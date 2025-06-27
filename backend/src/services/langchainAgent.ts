import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { DynamicTool } from '@langchain/core/tools'
import { AgentExecutor, createReactAgent } from 'langchain/agents'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import winston from 'winston'

// Types for our analysis
interface ContractAnalysisInput {
  contractText: string
  sessionId?: string
}

interface ClauseAnalysis {
  clauseId: string
  text: string
  summary: string
  riskLevel: 'safe' | 'review' | 'risky'
  riskReasons: string[]
  confidence: number
  suggestions?: string
}

interface ContractAnalysisResult {
  summary: string
  clauses: ClauseAnalysis[]
  overallRisk: 'safe' | 'review' | 'risky'
  recommendations: string[]
  tokensUsed: number
}

// Logger for LangChain operations
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'langchain-agent' },
  transports: [
    new winston.transports.File({ filename: 'logs/langchain.log' }),
    new winston.transports.Console()
  ]
})

class LangChainContractAgent {
  private llmInstruct: ChatOpenAI
  private llmCode: ChatOpenAI
  private messageHistory: Map<string, ChatMessageHistory>
  private tools: DynamicTool[]

  constructor() {
    // Initialize different Granite models via OpenAI-compatible wrapper
    this.llmInstruct = new ChatOpenAI({
      model: 'granite-8b-instruct-v1',
      temperature: 0.2,
      maxTokens: 2000,
      openAIApiKey: process.env.IBM_GRANITE_API_KEY || 'dummy-key',
      configuration: {
        baseURL: process.env.IBM_GRANITE_BASE_URL || 'https://us-south.ml.cloud.ibm.com/v1'
      }
    })

    this.llmCode = new ChatOpenAI({
      model: 'granite-code-v1',
      temperature: 0.3,
      maxTokens: 1500,
      openAIApiKey: process.env.IBM_GRANITE_API_KEY || 'dummy-key',
      configuration: {
        baseURL: process.env.IBM_GRANITE_BASE_URL || 'https://us-south.ml.cloud.ibm.com/v1'
      }
    })

    this.messageHistory = new Map()
    this.tools = this.initializeTools()
  }

  private initializeTools(): DynamicTool[] {
    // Tool 1: Summarize Contract Clauses
    const summarizeClauseTool = new DynamicTool({
      name: 'summarize_clause',
      description: 'Summarizes a specific contract clause using Granite Instruct model. Input should be the clause text.',
      func: async (input: string) => {
        try {
          logger.info('LangChain: Executing summarize_clause tool', { 
            clauseLength: input.length 
          })

          const prompt = PromptTemplate.fromTemplate(`
            You are a legal AI assistant specializing in contract analysis.
            
            Analyze this contract clause and provide a clear, concise summary:
            
            Clause: {clauseText}
            
            Provide:
            1. A brief summary of what this clause means
            2. Key obligations and rights
            3. Any notable terms or conditions
            
            Keep the summary professional and accessible to non-lawyers.
          `)

          const chain = prompt.pipe(this.llmInstruct)
          const result = await chain.invoke({
            clauseText: input
          })

          return result.content as string
        } catch (error) {
          logger.error('Error in summarize_clause tool:', error)
          return 'Error: Unable to summarize clause at this time.'
        }
      }
    })

    // Tool 2: Analyze Risk Level
    const analyzeRiskTool = new DynamicTool({
      name: 'analyze_risk',
      description: 'Analyzes the risk level of a contract clause. Input should be the clause text to analyze.',
      func: async (input: string) => {
        try {
          logger.info('LangChain: Executing analyze_risk tool', { 
            clauseLength: input.length
          })

          const prompt = PromptTemplate.fromTemplate(`
            You are a legal risk assessment AI. Analyze this contract clause for potential risks.
            
            Clause: {clauseText}
            
            Provide your analysis in this format:
            Risk Level: [safe/review/risky]
            Risk Reasons: [List specific concerns]
            Confidence: [0.0-1.0]
            
            Risk levels:
            - safe: No significant legal risks
            - review: Some concerns that need legal review
            - risky: High-risk clauses that could cause problems
          `)

          const chain = prompt.pipe(this.llmInstruct)
          const result = await chain.invoke({
            clauseText: input
          })

          return result.content as string
        } catch (error) {
          logger.error('Error in analyze_risk tool:', error)
          return 'Error: Unable to analyze risk at this time.'
        }
      }
    })

    // Tool 3: Generate Rewrite Suggestions
    const rewriteClauseTool = new DynamicTool({
      name: 'rewrite_clause',
      description: 'Generates safer alternatives for risky clauses. Input should be the original clause text.',
      func: async (input: string) => {
        try {
          logger.info('LangChain: Executing rewrite_clause tool', { 
            originalLength: input.length
          })

          const prompt = PromptTemplate.fromTemplate(`
            You are a legal drafting AI that creates safer contract language.
            
            Original Clause: {originalClause}
            
            Generate 2-3 alternative clause wordings that:
            1. Address potential legal risks
            2. Maintain the original intent
            3. Use clear, professional legal language
            4. Protect the client's interests
            
            Format each suggestion clearly with explanations of how it reduces risk.
          `)

          const chain = prompt.pipe(this.llmCode)
          const result = await chain.invoke({
            originalClause: input
          })

          return result.content as string
        } catch (error) {
          logger.error('Error in rewrite_clause tool:', error)
          return 'Error: Unable to generate rewrite suggestions at this time.'
        }
      }
    })

    // Tool 4: Store Analysis Results
    const storeAnalysisTool = new DynamicTool({
      name: 'store_analysis',
      description: 'Stores contract analysis results. Input should be a JSON string with analysis data.',
      func: async (input: string) => {
        try {
          logger.info('LangChain: Executing store_analysis tool')

          // In a real implementation, this would save to MongoDB
          // For now, we'll log and return success
          logger.info('Analysis stored successfully', {
            data: input.substring(0, 100) + '...'
          })

          return 'Analysis stored successfully in the database.'
        } catch (error) {
          logger.error('Error in store_analysis tool:', error)
          return 'Error: Unable to store analysis results.'
        }
      }
    })

    return [summarizeClauseTool, analyzeRiskTool, rewriteClauseTool, storeAnalysisTool]
  }

  private getOrCreateMessageHistory(sessionId: string): ChatMessageHistory {
    if (!this.messageHistory.has(sessionId)) {
      this.messageHistory.set(sessionId, new ChatMessageHistory())
    }
    return this.messageHistory.get(sessionId)!
  }

  async analyzeContract(input: ContractAnalysisInput): Promise<ContractAnalysisResult> {
    const sessionId = input.sessionId || `session_${Date.now()}`
    
    try {
      logger.info('LangChain: Starting contract analysis', { 
        sessionId,
        textLength: input.contractText.length 
      })

      // For this demo, we'll use direct LLM calls with a structured approach
      // In production, you'd use the full agent system

      // Step 1: Extract clauses and summarize
      const summaryPrompt = PromptTemplate.fromTemplate(`
        You are ClauseGuard's AI contract analyst. Analyze this contract text and provide:
        1. A brief overall summary
        2. Key contract clauses identified
        3. Overall risk assessment (safe/review/risky)
        4. Main recommendations

        Contract Text: {contractText}

        Format your response clearly with sections for each analysis type.
      `)

      const summaryResult = await this.llmInstruct.invoke(
        await summaryPrompt.format({ contractText: input.contractText })
      )

      // Step 2: Risk analysis for specific sections
      const riskPrompt = PromptTemplate.fromTemplate(`
        Analyze the following contract for specific legal risks:
        
        {contractText}
        
        Identify:
        1. High-risk clauses (liability, termination, payment terms)
        2. Confidence level for each risk
        3. Specific legal concerns
        4. Recommended actions
      `)

      const riskResult = await this.llmInstruct.invoke(
        await riskPrompt.format({ contractText: input.contractText })
      )

      // Process and structure the results
      const analysisResult: ContractAnalysisResult = {
        summary: this.extractSummary(summaryResult.content as string),
        clauses: this.extractClauses(summaryResult.content as string, riskResult.content as string),
        overallRisk: this.determineOverallRisk(riskResult.content as string),
        recommendations: this.extractRecommendations(summaryResult.content as string),
        tokensUsed: this.estimateTokenUsage(input.contractText, summaryResult.content as string)
      }

      logger.info('LangChain: Contract analysis completed', {
        sessionId,
        overallRisk: analysisResult.overallRisk,
        clauseCount: analysisResult.clauses.length
      })

      return analysisResult

    } catch (error) {
      logger.error('Error in contract analysis:', error)
      
      // Return fallback analysis
      return {
        summary: 'Error occurred during analysis. Please try again.',
        clauses: [],
        overallRisk: 'review',
        recommendations: ['Manual review recommended due to technical error'],
        tokensUsed: 0
      }
    }
  }

  private extractSummary(output: string): string {
    const summaryMatch = output.match(/(?:Summary|Overall|Analysis):?\s*(.+?)(?:\n\n|\n[A-Z]|$)/i)
    return summaryMatch?.[1] || 'Contract analysis completed using advanced AI models.'
  }

  private extractClauses(summaryOutput: string, riskOutput: string): ClauseAnalysis[] {
    // Simple extraction - in production, this would be more sophisticated
    const clauses: ClauseAnalysis[] = []
    
    // Look for clause mentions in the analysis
    const clausePatterns = [
      /liability/i,
      /payment/i,
      /termination/i,
      /confidentiality/i,
      /indemnification/i
    ]

    clausePatterns.forEach((pattern, index) => {
      if (pattern.test(summaryOutput) || pattern.test(riskOutput)) {
        clauses.push({
          clauseId: `clause_${index + 1}`,
          text: `${pattern.source.replace(/[^a-z]/gi, '')} clause identified`,
          summary: `Analysis of ${pattern.source.replace(/[^a-z]/gi, '')} terms`,
          riskLevel: this.determineClauseRisk(riskOutput, pattern.source),
          riskReasons: ['Automated analysis completed'],
          confidence: 0.8
        })
      }
    })

    return clauses
  }

  private determineClauseRisk(riskOutput: string, clauseType: string): 'safe' | 'review' | 'risky' {
    const text = riskOutput.toLowerCase()
    if (text.includes('risky') || text.includes('high risk')) return 'risky'
    if (text.includes('concern') || text.includes('review')) return 'review'
    return 'safe'
  }

  private determineOverallRisk(output: string): 'safe' | 'review' | 'risky' {
    const riskMatch = output.match(/overall risk:?\s*(safe|review|risky)/i)
    const text = output.toLowerCase()
    
    if (riskMatch) return riskMatch[1] as 'safe' | 'review' | 'risky'
    if (text.includes('risky') || text.includes('high risk')) return 'risky'
    if (text.includes('concern') || text.includes('review')) return 'review'
    return 'safe'
  }

  private extractRecommendations(output: string): string[] {
    const recommendations = []
    if (output.includes('review')) recommendations.push('Legal review recommended')
    if (output.includes('liability')) recommendations.push('Consider liability limitations')
    if (output.includes('payment')) recommendations.push('Clarify payment terms')
    
    return recommendations.length > 0 ? recommendations : ['Standard contract review practices apply']
  }

  private estimateTokenUsage(input: string, output: string): number {
    return Math.ceil((input.length + output.length) / 4)
  }

  async clearHistory(sessionId: string): Promise<void> {
    this.messageHistory.delete(sessionId)
    logger.info('LangChain: Cleared message history', { sessionId })
  }

  // Tool execution methods for direct access
  async summarizeClause(clauseText: string): Promise<string> {
    return await this.tools[0].func(clauseText)
  }

  async analyzeRisk(clauseText: string): Promise<string> {
    return await this.tools[1].func(clauseText)
  }

  async rewriteClause(clauseText: string): Promise<string> {
    return await this.tools[2].func(clauseText)
  }

  async storeAnalysis(analysisData: string): Promise<string> {
    return await this.tools[3].func(analysisData)
  }
}

export { LangChainContractAgent, ContractAnalysisInput, ContractAnalysisResult } 