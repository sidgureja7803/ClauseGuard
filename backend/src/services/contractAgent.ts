import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createReactAgent } from 'langchain/agents'
import { pull } from 'langchain/hub'
import { DynamicTool } from '@langchain/core/tools'
import { PromptTemplate } from '@langchain/core/prompts'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { ConversationSummaryBufferMemory } from 'langchain/memory'
import { VectorStore } from '@langchain/core/vectorstores'
import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from 'langchain/document'
import winston from 'winston'

// Enhanced types for agentic behavior
interface ContractAgentInput {
  contractText: string
  userGoal: string  // "analyze risks", "rewrite risky clauses", "ensure GDPR compliance"
  context?: string  // Additional context from user
  priority?: 'speed' | 'thoroughness' | 'compliance'
  sessionId: string
}

interface AgentTask {
  id: string
  description: string
  tool: string
  input: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  dependencies?: string[]
}

interface AgentMemory {
  contractContext: Document[]
  previousAnalyses: Document[]
  userPreferences: Record<string, any>
  domainKnowledge: Document[]
}

class ContractAIAgent {
  private llmPlanner!: ChatOpenAI      // Granite 8B Instruct for planning
  private llmExecutor!: ChatOpenAI     // Granite 8B Instruct for tool execution  
  private llmSpecialist!: ChatOpenAI   // Granite Code for specialized tasks
  private agentExecutor!: AgentExecutor
  private memory!: ConversationSummaryBufferMemory
  private vectorStore!: VectorStore
  private agentMemory!: Map<string, AgentMemory>
  private tools!: DynamicTool[]
  private logger!: winston.Logger

  constructor() {
    this.initializeModels()
    this.initializeMemory()
    this.initializeTools()
    this.initializeAgent()
    this.setupLogger()
  }

  private initializeModels() {
    // Planner: High-level reasoning and task decomposition
    this.llmPlanner = new ChatOpenAI({
      model: 'granite-8b-instruct-v1',
      temperature: 0.1,
      maxTokens: 2000,
      openAIApiKey: process.env.IBM_GRANITE_API_KEY!,
      configuration: {
        baseURL: process.env.IBM_GRANITE_BASE_URL!
      }
    })

    // Executor: Tool usage and multi-step reasoning
    this.llmExecutor = new ChatOpenAI({
      model: 'granite-8b-instruct-v1', 
      temperature: 0.2,
      maxTokens: 1500,
      openAIApiKey: process.env.IBM_GRANITE_API_KEY!,
      configuration: {
        baseURL: process.env.IBM_GRANITE_BASE_URL!
      }
    })

    // Specialist: Code generation, rewriting, specialized analysis
    this.llmSpecialist = new ChatOpenAI({
      model: 'granite-code-v1',
      temperature: 0.3,
      maxTokens: 2000,
      openAIApiKey: process.env.IBM_GRANITE_API_KEY!,
      configuration: {
        baseURL: process.env.IBM_GRANITE_BASE_URL!
      }
    })
  }

  private async initializeMemory() {
    // Vector store for semantic memory (contract knowledge, patterns, precedents)
    this.vectorStore = new MemoryVectorStore(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.IBM_GRANITE_API_KEY!,
        configuration: {
          baseURL: process.env.IBM_GRANITE_BASE_URL! + '/embeddings'
        }
      })
    )

    // Conversation memory with summarization
    this.memory = new ConversationSummaryBufferMemory({
      llm: this.llmPlanner,
      maxTokenLimit: 2000,
      returnMessages: true,
      memoryKey: "chat_history"
    })

    // Session-based agent memory
    this.agentMemory = new Map()

    // Pre-populate with legal knowledge
    await this.loadDomainKnowledge()
  }

  private async loadDomainKnowledge() {
    const legalKnowledge = [
      { content: "Liability limitation clauses should include exceptions for gross negligence and willful misconduct", type: "best_practice" },
      { content: "Termination clauses should specify notice periods and obligations upon termination", type: "best_practice" },
      { content: "Payment terms should include late fees and dispute resolution mechanisms", type: "best_practice" },
      { content: "GDPR compliance requires data processing clauses with specific guarantees", type: "compliance" },
      { content: "Force majeure clauses have been scrutinized post-COVID for pandemic coverage", type: "trend" }
    ]

    const docs = legalKnowledge.map(item => 
      new Document({ 
        pageContent: item.content, 
        metadata: { type: item.type, domain: 'contract_law' }
      })
    )

    await this.vectorStore.addDocuments(docs)
  }

  private initializeTools() {
    this.tools = [
      // Intent Classification Tool
      new DynamicTool({
        name: "classify_user_intent",
        description: "Classify user's high-level goal for contract analysis. Use when user provides vague instructions.",
        func: async (input: string) => {
          const prompt = PromptTemplate.fromTemplate(`
            Analyze this user request and classify their primary intent:
            
            User Request: {userInput}
            
            Classify into one of these categories:
            1. RISK_ANALYSIS - User wants to identify and understand risks
            2. COMPLIANCE_CHECK - User needs regulatory/legal compliance verification  
            3. CLAUSE_IMPROVEMENT - User wants suggestions to improve specific clauses
            4. FULL_REVIEW - User wants comprehensive contract analysis
            5. COMPARISON - User wants to compare with standards or another contract
            6. NEGOTIATION_PREP - User is preparing for contract negotiations
            
            Also extract:
            - Priority level (speed/thoroughness/compliance)
            - Specific focus areas mentioned
            - Any deadlines or urgency indicators
            
            Format: {{"intent": "INTENT_TYPE", "priority": "PRIORITY", "focus_areas": ["area1", "area2"], "urgency": "level"}}
          `)
          
          const result = await this.llmPlanner.invoke(
            await prompt.format({ userInput: input })
          )
          
          return result.content as string
        }
      }),

      // Dynamic Task Planner Tool
      new DynamicTool({
        name: "create_execution_plan", 
        description: "Create a step-by-step execution plan based on user intent and contract content.",
        func: async (input: string) => {
          const { intent, contractText, context } = JSON.parse(input)
          
          const prompt = PromptTemplate.fromTemplate(`
            Create an execution plan for contract analysis:
            
            User Intent: {intent}
            Contract Length: {contractLength} characters
            Context: {context}
            
            Create a step-by-step plan with these available tools:
            - extract_key_clauses: Extract important contract clauses
            - analyze_clause_risk: Assess risk for specific clauses  
            - retrieve_legal_context: Get relevant legal knowledge
            - generate_compliance_check: Check regulatory compliance
            - suggest_improvements: Generate improvement suggestions
            - synthesize_results: Combine analysis into final report
            
            Format as JSON array: [
              {{"step": 1, "task": "task_description", "tool": "tool_name", "input_source": "where_input_comes_from"}},
              ...
            ]
          `)
          
          const result = await this.llmPlanner.invoke(
            await prompt.format({ 
              intent, 
              contractLength: contractText.length,
              context: context || "No additional context"
            })
          )
          
          return result.content as string
        }
      }),

      // Enhanced Clause Extraction Tool
      new DynamicTool({
        name: "extract_key_clauses",
        description: "Extract and categorize important clauses from contract text based on intent.",
        func: async (input: string) => {
          const { contractText, focus } = JSON.parse(input)
          
          const prompt = PromptTemplate.fromTemplate(`
            Extract key clauses from this contract, focusing on: {focus}
            
            Contract: {contractText}
            
            Identify and extract:
            1. Payment and financial terms
            2. Liability and risk allocation
            3. Termination and renewal
            4. Intellectual property
            5. Compliance and regulatory
            6. Performance obligations
            
            For each clause, provide:
            - Clause text (exact)
            - Category 
            - Position in document
            - Initial risk assessment (low/medium/high)
            
            Format as JSON array of clause objects.
          `)
          
          const result = await this.llmExecutor.invoke(
            await prompt.format({ contractText, focus })
          )
          
          return result.content as string
        }
      }),

      // Intelligent Risk Analysis Tool
      new DynamicTool({
        name: "analyze_clause_risk",
        description: "Analyze specific clauses for legal and business risks with confidence scoring.",
        func: async (input: string) => {
          const { clause, context, userProfile } = JSON.parse(input)
          
          // Retrieve relevant legal knowledge
          const relevantDocs = await this.vectorStore.similaritySearch(clause.text, 3)
          const legalContext = relevantDocs.map(doc => doc.pageContent).join('\n')
          
          const prompt = PromptTemplate.fromTemplate(`
            Analyze this contract clause for risks:
            
            Clause: {clauseText}
            Clause Type: {clauseType}
            User Context: {userContext}
            
            Relevant Legal Knowledge:
            {legalKnowledge}
            
            Provide detailed risk analysis:
            1. Risk Level: safe/moderate/high/critical
            2. Specific Risk Factors (list each with explanation)
            3. Potential Business Impact
            4. Legal Vulnerabilities 
            5. Confidence Score (0.0-1.0)
            6. Recommended Actions
            
            Consider both legal and business risks. Be specific about why each risk matters.
            
            Format as JSON with all analysis components.
          `)
          
          const result = await this.llmExecutor.invoke(
            await prompt.format({
              clauseText: clause.text,
              clauseType: clause.category,
              userContext: context,
              legalKnowledge: legalContext
            })
          )
          
          return result.content as string
        }
      }),

      // Legal Knowledge Retrieval Tool
      new DynamicTool({
        name: "retrieve_legal_context",
        description: "Retrieve relevant legal knowledge, precedents, and best practices for contract analysis.",
        func: async (input: string) => {
          const query = typeof input === 'string' ? input : JSON.stringify(input)
          
          const relevantDocs = await this.vectorStore.similaritySearch(query, 5)
          
          return JSON.stringify({
            query,
            knowledge: relevantDocs.map(doc => ({
              content: doc.pageContent,
              type: doc.metadata.type,
              relevance: doc.metadata.score || 'high'
            }))
          })
        }
      }),

      // Intelligent Clause Improvement Tool  
      new DynamicTool({
        name: "suggest_improvements",
        description: "Generate specific improvement suggestions for risky or problematic clauses.",
        func: async (input: string) => {
          const { clause, riskAnalysis, intent } = JSON.parse(input)
          
          const prompt = PromptTemplate.fromTemplate(`
            Generate improvement suggestions for this clause:
            
            Original Clause: {originalClause}
            Risk Analysis: {riskAnalysis}
            User Intent: {userIntent}
            
            Provide:
            1. 2-3 alternative clause wordings
            2. Explanation of how each alternative reduces risk
            3. Trade-offs for each option
            4. Recommended option with justification
            5. Implementation notes
            
            Make suggestions practical and legally sound. Consider business impact.
            
            Format as JSON with structured alternatives.
          `)
          
          const result = await this.llmSpecialist.invoke(
            await prompt.format({
              originalClause: clause.text,
              riskAnalysis: JSON.stringify(riskAnalysis),
              userIntent: intent
            })
          )
          
          return result.content as string
        }
      }),

      // Results Synthesis Tool
      new DynamicTool({
        name: "synthesize_results",
        description: "Combine all analysis results into a comprehensive, actionable report.",
        func: async (input: string) => {
          const { analyses, userIntent, contractSummary } = JSON.parse(input)
          
          const prompt = PromptTemplate.fromTemplate(`
            Synthesize contract analysis results into an executive summary:
            
            User Goal: {userGoal}
            Contract Overview: {contractOverview}
            Individual Analyses: {analysisResults}
            
            Create a comprehensive report with:
            1. Executive Summary (2-3 sentences)
            2. Key Findings (prioritized by importance)
            3. Risk Assessment (overall + specific risks)
            4. Actionable Recommendations (prioritized)
            5. Next Steps
            6. Confidence Assessment
            
            Tailor the tone and detail level to the user's intent. Focus on actionability.
            
            Format as structured JSON report.
          `)
          
          const result = await this.llmPlanner.invoke(
            await prompt.format({
              userGoal: userIntent,
              contractOverview: contractSummary,
              analysisResults: JSON.stringify(analyses)
            })
          )
          
          return result.content as string
        }
      }),

      // Memory Storage Tool
      new DynamicTool({
        name: "store_analysis_memory",
        description: "Store analysis results and insights for future reference and learning.",
        func: async (input: string) => {
          const { sessionId, analysis, insights } = JSON.parse(input)
          
          // Store in vector database for future retrieval
          const docs = insights.map((insight: any) => 
            new Document({
              pageContent: insight.content,
              metadata: { 
                sessionId, 
                type: insight.type,
                timestamp: Date.now(),
                contractType: analysis.contractType
              }
            })
          )
          
          await this.vectorStore.addDocuments(docs)
          
          return JSON.stringify({ stored: docs.length, sessionId })
        }
      })
    ]
  }

  private async initializeAgent() {
    // Use ReAct agent with our enhanced tools
    const reactPrompt = await pull("hwchase17/react") as any
    
    const agent = await createReactAgent({
      llm: this.llmExecutor,
      tools: this.tools,
      prompt: reactPrompt,
    })

    this.agentExecutor = new AgentExecutor({
      agent: agent,
      tools: this.tools,
      memory: this.memory,
      verbose: true,
      maxIterations: 10,
      earlyStoppingMethod: "generate"
    })
  }

  private setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/contract-agent.log' }),
        new winston.transports.Console()
      ]
    })
  }

  // Main agent execution method
  async analyzeContract(input: ContractAgentInput) {
    const startTime = Date.now()
    
    try {
      this.logger.info('Contract Agent: Starting analysis', { 
        sessionId: input.sessionId,
        userGoal: input.userGoal,
        contractLength: input.contractText.length
      })

      // Initialize session memory
      if (!this.agentMemory.has(input.sessionId)) {
        this.agentMemory.set(input.sessionId, {
          contractContext: [],
          previousAnalyses: [],
          userPreferences: {},
          domainKnowledge: []
        })
      }

      // Create the agent's input with full context
      const agentInput = `
        USER GOAL: ${input.userGoal}
        CONTRACT TEXT: ${input.contractText}
        ADDITIONAL CONTEXT: ${input.context || 'None'}
        PRIORITY: ${input.priority || 'thoroughness'}
        SESSION ID: ${input.sessionId}
        
        Please analyze this contract according to the user's goal. Start by classifying the intent, 
        then create an execution plan, and systematically work through the analysis using the 
        available tools. Provide a comprehensive final report.
      `

      // Execute the agent
      const result = await this.agentExecutor.invoke({ 
        input: agentInput,
        sessionId: input.sessionId
      })

      const processingTime = Date.now() - startTime

      this.logger.info('Contract Agent: Analysis completed', {
        sessionId: input.sessionId,
        processingTime,
        success: true
      })

      return {
        success: true,
        result: result.output,
        processingTime,
        sessionId: input.sessionId,
        tokensUsed: this.estimateTokenUsage(agentInput + result.output),
        agentSteps: result.intermediateSteps?.length || 0
      }

    } catch (error) {
      this.logger.error('Contract Agent: Analysis failed', {
        sessionId: input.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        processingTime: Date.now() - startTime,
        sessionId: input.sessionId
      }
    }
  }

  // Method for multi-turn conversation
  async continueConversation(sessionId: string, followUpQuestion: string) {
    const agentInput = `
      FOLLOW-UP QUESTION: ${followUpQuestion}
      SESSION ID: ${sessionId}
      
      Please continue our conversation about the previously analyzed contract. 
      Use the context from our previous discussion and any stored analysis results.
    `

    return await this.agentExecutor.invoke({ 
      input: agentInput,
      sessionId 
    })
  }

  private estimateTokenUsage(text: string): number {
    return Math.ceil(text.length / 4)
  }

  // Cleanup method
  async clearSession(sessionId: string) {
    this.agentMemory.delete(sessionId)
    await this.memory.clear()
  }
}

export { ContractAIAgent, ContractAgentInput } 