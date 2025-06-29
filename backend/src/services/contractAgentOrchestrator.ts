import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { DynamicTool } from '@langchain/core/tools'
import { AgentExecutor, createReactAgent } from 'langchain/agents'
import { pull } from 'langchain/hub'
import { ConversationSummaryBufferMemory } from 'langchain/memory'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from 'langchain/document'
import winston from 'winston'
import { GraniteAIService } from './graniteAI'
import { User } from '../models/User'
import { IAgentStep, IAnalysis, IClause } from '../models/ContractAnalysis'

interface AgentInput {
  contractText: string
  userId: string
  sessionId: string
  contractId: string
  fileName: string
  userPreferences?: any
}

interface AgentDecision {
  prioritizedSteps: string[]
  reasoning: string
  estimatedTime: number
  confidence: number
}

export class ContractAgentOrchestrator {
  private granite: GraniteAIService
  private logger: winston.Logger
  private auditTrail: IAgentStep[] = []

  constructor() {
    this.granite = new GraniteAIService()
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/agent.log' })
      ]
    })
  }

  private setupLogger() {
    // This method is now redundant since we initialize logger in constructor
    // but keeping for backward compatibility if needed elsewhere
  }

  private async recordAgentStep(
    stepType: string, 
    stepName: string, 
    decision: string, 
    reasoning: string,
    input: any,
    output: any,
    tokensUsed: number = 0,
    confidence: number = 0.8
  ): Promise<void> {
    const step: IAgentStep = {
      stepId: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stepType: stepType as any,
      stepName,
      startTime: new Date(),
      endTime: new Date(),
      agentDecision: decision,
      reasoning,
      tokensUsed,
      confidence,
      input,
      output
    }

    this.auditTrail.push(step)
    
    this.logger.info('Agent Step Recorded', {
      stepType,
      stepName,
      decision,
      confidence
    })
  }

  private async makeAgentDecision(contractText: string, userHistory: any): Promise<AgentDecision> {
    // Simplified decision making logic
    const textLower = contractText.toLowerCase()
    let prioritizedSteps: string[] = []
    let reasoning = ''

    if (textLower.includes('termination') || textLower.includes('arbitration')) {
      prioritizedSteps = ['extraction', 'risk_tagging', 'clause_suggestion', 'summary']
      reasoning = 'Detected high-risk clauses (termination/arbitration), prioritizing risk assessment'
    } else if (textLower.includes('confidential') || textLower.includes('nda')) {
      prioritizedSteps = ['clause_suggestion', 'extraction', 'risk_tagging', 'summary']
      reasoning = 'Detected confidentiality clauses, prioritizing rewrite suggestions'
    } else {
      prioritizedSteps = ['extraction', 'risk_tagging', 'clause_suggestion', 'summary']
      reasoning = 'Standard contract analysis workflow'
    }

    const decision: AgentDecision = {
      prioritizedSteps,
      reasoning,
      estimatedTime: 45,
      confidence: 0.8
    }

    await this.recordAgentStep(
      'prioritization',
      'Decision Making',
      `Prioritized steps: ${prioritizedSteps.join(' → ')}`,
      reasoning,
      { contractLength: contractText.length, userHistory },
      decision,
      50,
      0.8
    )

    return decision
  }

  private async loadUserMemory(userId: string): Promise<any> {
    try {
      const user = await User.findOne({ clerkId: userId })
      return user?.agentMemory || {
        contractHistory: [],
        feedbackHistory: [],
        learnedPatterns: []
      }
    } catch (error) {
      this.logger.warn('Failed to load user memory:', error)
      return { contractHistory: [], feedbackHistory: [], learnedPatterns: [] }
    }
  }

  private async updateUserMemory(userId: string, contractData: any): Promise<void> {
    try {
      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          $push: {
            'agentMemory.contractHistory': {
              contractId: contractData.contractId,
              contractType: contractData.contractType,
              riskLevel: contractData.overallRisk,
              userPreferences: {},
              timestamp: new Date()
            }
          }
        }
      )

      this.logger.info('User memory updated', { userId, contractId: contractData.contractId })
    } catch (error) {
      this.logger.error('Failed to update user memory:', error)
    }
  }

  private async executeSteps(prioritizedSteps: string[], contractText: string): Promise<{
    clauses: any[]
    recommendations: string[]
    summary: string
    tokensUsed: number
  }> {
    let clauses: any[] = []
    let recommendations: string[] = []
    let summary = ''
    let totalTokens = 0

    for (const step of prioritizedSteps) {
      try {
        switch (step) {
          case 'extraction':
            clauses = await this.executeExtractionStep(contractText)
            break
          
          case 'risk_tagging':
            clauses = await this.executeRiskTaggingStep(clauses.length > 0 ? clauses : [])
            break
          
          case 'clause_suggestion':
            recommendations = await this.executeClauseSuggestionStep(clauses)
            break
          
          case 'summary':
            const summaryResult = await this.executeSummaryStep(contractText)
            summary = summaryResult.summary
            totalTokens += summaryResult.tokensUsed
            break
        }
      } catch (error) {
        this.logger.error(`Step ${step} failed:`, error)
      }
    }

    return { clauses, recommendations, summary, tokensUsed: totalTokens }
  }

  private async executeExtractionStep(contractText: string): Promise<any[]> {
    this.logger.info('Executing extraction step...')
    
    // Simplified extraction using basic patterns
    const sections = contractText.split(/\n\s*\n/).filter(section => section.trim().length > 100)
    const clauses = sections.slice(0, 10).map((section, index) => ({
      id: `clause_${index + 1}`,
      text: section.trim(),
      type: 'extracted_clause',
      importance: 'medium'
    }))

    await this.recordAgentStep(
      'extraction',
      'Clause Extraction',
      `Extracted ${clauses.length} key clauses`,
      'Identified contract sections based on paragraph structure',
      { contractLength: contractText.length },
      clauses,
      100,
      0.75
    )

    return clauses
  }

  private async executeRiskTaggingStep(clauses: any[]): Promise<any[]> {
    this.logger.info('Executing risk tagging step...')

    const taggedClauses = clauses.map(clause => {
      const text = clause.text.toLowerCase()
      let riskLevel = 'safe'
      const riskReasons: string[] = []

      if (text.includes('liability') || text.includes('damages')) {
        riskLevel = 'risky'
        riskReasons.push('Contains liability provisions')
      } else if (text.includes('termination') || text.includes('breach')) {
        riskLevel = 'review'
        riskReasons.push('Contains termination clauses')
      }

      return {
        ...clause,
        riskLevel,
        riskReasons,
        confidence: 0.8
      }
    })

    const highRiskCount = taggedClauses.filter(c => c.riskLevel === 'risky').length

    await this.recordAgentStep(
      'risk_tagging',
      'Risk Assessment',
      `Tagged ${taggedClauses.length} clauses, ${highRiskCount} high-risk identified`,
      'Applied pattern-based risk assessment to extracted clauses',
      { totalClauses: clauses.length },
      { taggedClauses, highRiskCount },
      150,
      0.8
    )

    return taggedClauses
  }

  private async executeClauseSuggestionStep(clauses: any[]): Promise<string[]> {
    this.logger.info('Executing clause suggestion step...')

    const suggestions = clauses
      .filter(clause => clause.riskLevel === 'risky')
      .slice(0, 3)
      .map(clause => `Consider revising clause: ${clause.text.substring(0, 50)}...`)

    await this.recordAgentStep(
      'clause_suggestion',
      'Rewrite Suggestions',
      `Generated ${suggestions.length} clause suggestions`,
      'Focused on high-risk clauses to provide improvement recommendations',
      { riskyClauses: clauses.filter(c => c.riskLevel === 'risky').length },
      suggestions,
      200,
      0.75
    )

    return suggestions
  }

  private async executeSummaryStep(contractText: string): Promise<{ summary: string; tokensUsed: number }> {
    this.logger.info('Executing summary step...')

    try {
      const summaryResult = await this.granite.summarizeContract(contractText)
      
      await this.recordAgentStep(
        'summary',
        'Contract Summary',
        'Generated comprehensive contract summary',
        'Created executive-level overview using IBM Granite AI',
        { contractLength: contractText.length },
        { summary: summaryResult.summary },
        summaryResult.tokensUsed,
        0.9
      )

      return summaryResult
    } catch (error) {
      const fallbackSummary = `Contract analysis completed for ${Math.round(contractText.length / 1000)}k characters. Professional legal review recommended.`
      
      await this.recordAgentStep(
        'summary',
        'Summary Fallback',
        'Generated fallback summary',
        'AI summary failed, using template summary',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { summary: fallbackSummary },
        0,
        0.6
      )

      return { summary: fallbackSummary, tokensUsed: 0 }
    }
  }

  public async analyzeContractWithAgent(input: AgentInput): Promise<IAnalysis> {
    const startTime = Date.now()
    this.auditTrail = [] // Reset audit trail for this analysis

    this.logger.info('Starting agent-orchestrated analysis', {
      userId: input.userId,
      sessionId: input.sessionId,
      contractLength: input.contractText.length,
      fileName: input.fileName
    })

    try {
      // Step 1: Load user memory and make decisions
      const userHistory = await this.loadUserMemory(input.userId)
      const decision = await this.makeAgentDecision(input.contractText, userHistory)

      // Step 2: Execute steps in prioritized order
      const { clauses, recommendations, summary, tokensUsed } = await this.executeSteps(
        decision.prioritizedSteps, 
        input.contractText
      )

      // Step 3: Compile final analysis
      const processingTime = Date.now() - startTime

      const analysis: IAnalysis = {
        summary,
        clauses: clauses.map(clause => ({
          id: clause.id,
          text: clause.text,
          summary: clause.type || 'Contract clause',
          riskLevel: clause.riskLevel || 'review',
          riskReasons: clause.riskReasons || [],
          confidence: clause.confidence || 0.7,
          position: { start: 0, end: clause.text?.length || 0 }
        })) as IClause[],
        overallRisk: this.calculateOverallRisk(clauses),
        confidence: this.calculateOverallConfidence(),
        tokensUsed,
        processingTime,
        contractType: this.detectContractType(input.contractText),
        recommendations,
        agentAuditTrail: this.auditTrail,
        userFeedback: []
      }

      // Step 4: Update user memory
      await this.updateUserMemory(input.userId, {
        contractId: input.contractId,
        contractType: analysis.contractType,
        overallRisk: analysis.overallRisk
      })

      this.logger.info('Agent analysis completed', {
        userId: input.userId,
        processingTime,
        stepsExecuted: this.auditTrail.length,
        overallRisk: analysis.overallRisk
      })

      return analysis

    } catch (error) {
      this.logger.error('Agent analysis failed:', error)
      
      // Return fallback analysis
      return {
        summary: 'Agent analysis encountered an error. Manual review recommended.',
        clauses: [],
        overallRisk: 'review',
        confidence: 0.3,
        tokensUsed: 0,
        processingTime: Date.now() - startTime,
        agentAuditTrail: this.auditTrail,
        userFeedback: []
      }
    }
  }

  private calculateOverallRisk(clauses: any[]): 'safe' | 'review' | 'risky' {
    if (clauses.length === 0) return 'review'
    
    const riskyClauses = clauses.filter(c => c.riskLevel === 'risky').length
    const totalClauses = clauses.length
    
    if (riskyClauses / totalClauses >= 0.3) return 'risky'
    if (riskyClauses > 0) return 'review'
    return 'safe'
  }

  private calculateOverallConfidence(): number {
    if (this.auditTrail.length === 0) return 0.5
    
    const avgConfidence = this.auditTrail.reduce((sum, step) => sum + step.confidence, 0) / this.auditTrail.length
    return Math.round(avgConfidence * 100) / 100
  }

  private detectContractType(contractText: string): string {
    const text = contractText.toLowerCase()
    
    if (text.includes('employment') || text.includes('employee')) return 'employment'
    if (text.includes('service') || text.includes('consulting')) return 'service'
    if (text.includes('license') || text.includes('software')) return 'license'
    if (text.includes('nda') || text.includes('confidential')) return 'nda'
    if (text.includes('lease') || text.includes('rental')) return 'lease'
    
    return 'general'
  }

  public getAuditTrail(): IAgentStep[] {
    return [...this.auditTrail]
  }
} 