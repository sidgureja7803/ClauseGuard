import axios from 'axios'
import { IClause, IAnalysis } from '../models/ContractAnalysis'

interface GraniteResponse {
  data: {
    choices: Array<{
      text: string
      finish_reason: string
    }>
    usage: {
      total_tokens: number
    }
  }
}

interface ClauseAnalysisRequest {
  text: string
  clauseId: string
  position: { start: number; end: number }
}

export class GraniteAIService {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = process.env.IBM_GRANITE_API_KEY || ''
    this.baseURL = process.env.IBM_GRANITE_BASE_URL || 'https://api.granite.ibm.com/v1'
    
    if (!this.apiKey) {
      throw new Error('IBM_GRANITE_API_KEY environment variable is required')
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<GraniteResponse> {
    try {
      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })
      return response.data
    } catch (error: any) {
      console.error('Granite AI API error:', error.response?.data || error.message)
      throw new Error(`Granite AI API error: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  async summarizeContract(text: string): Promise<{ summary: string; tokensUsed: number }> {
    const prompt = `Analyze the following contract and provide a comprehensive summary in 2-3 sentences. Focus on the key terms, obligations, and any notable clauses that require attention.

Contract text:
${text}

Summary:`

    const response = await this.makeRequest('/completions', {
      model: 'ibm/granite-8b-instruct-v1',
      prompt,
      max_tokens: 500,
      temperature: 0.3,
      top_p: 0.9,
      stop: ['\n\n']
    })

    return {
      summary: response.data.choices[0]?.text?.trim() || 'Unable to generate summary',
      tokensUsed: response.data.usage?.total_tokens || 0
    }
  }

  async analyzeClause(request: ClauseAnalysisRequest): Promise<{ clause: IClause; tokensUsed: number }> {
    const prompt = `Analyze the following contract clause for potential legal risks and provide a detailed assessment.

Clause text:
"${request.text}"

Please provide your analysis in the following JSON format:
{
  "summary": "Brief summary of what this clause means",
  "riskLevel": "safe|review|risky",
  "riskReasons": ["List of specific risk factors or concerns"],
  "confidence": 0.0-1.0
}

Analysis:`

    const response = await this.makeRequest('/completions', {
      model: 'ibm/granite-4b-instruct-v2',
      prompt,
      max_tokens: 800,
      temperature: 0.2,
      top_p: 0.8
    })

    try {
      const analysisText = response.data.choices[0]?.text?.trim() || '{}'
      let analysisData

      try {
        // Try to parse JSON response
        analysisData = JSON.parse(analysisText)
      } catch {
        // Fallback if JSON parsing fails
        analysisData = {
          summary: 'Analysis completed',
          riskLevel: 'review',
          riskReasons: ['Unable to parse detailed analysis'],
          confidence: 0.5
        }
      }

      const clause: IClause = {
        id: request.clauseId,
        text: request.text,
        summary: analysisData.summary || 'Clause analysis completed',
        riskLevel: ['safe', 'review', 'risky'].includes(analysisData.riskLevel) 
          ? analysisData.riskLevel 
          : 'review',
        riskReasons: Array.isArray(analysisData.riskReasons) 
          ? analysisData.riskReasons 
          : ['Risk assessment completed'],
        confidence: typeof analysisData.confidence === 'number' 
          ? Math.max(0, Math.min(1, analysisData.confidence))
          : 0.7,
        position: request.position
      }

      return {
        clause,
        tokensUsed: response.data.usage?.total_tokens || 0
      }
    } catch (error) {
      console.error('Error processing clause analysis:', error)
      
      // Return a fallback clause analysis
      const clause: IClause = {
        id: request.clauseId,
        text: request.text,
        summary: 'Clause requires manual review',
        riskLevel: 'review',
        riskReasons: ['Automated analysis unavailable'],
        confidence: 0.5,
        position: request.position
      }

      return {
        clause,
        tokensUsed: response.data.usage?.total_tokens || 0
      }
    }
  }

  async generateRewriteSuggestion(clause: IClause): Promise<{ rewriteSuggestion: string; tokensUsed: number }> {
    if (clause.riskLevel === 'safe') {
      return { rewriteSuggestion: '', tokensUsed: 0 }
    }

    const prompt = `The following contract clause has been identified as potentially risky. Please provide a safer alternative that addresses the concerns while maintaining the original intent.

Original clause:
"${clause.text}"

Risk concerns:
${clause.riskReasons.join(', ')}

Please provide a rewritten version that mitigates these risks:

Safer alternative:`

    const response = await this.makeRequest('/completions', {
      model: 'ibm/granite-code-v1',
      prompt,
      max_tokens: 600,
      temperature: 0.4,
      top_p: 0.9
    })

    return {
      rewriteSuggestion: response.data.choices[0]?.text?.trim() || 'Manual rewrite recommended',
      tokensUsed: response.data.usage?.total_tokens || 0
    }
  }

  async extractClauses(text: string): Promise<ClauseAnalysisRequest[]> {
    // Simple clause extraction based on common patterns
    // In a production system, you might want more sophisticated NLP
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 50)
    const clauses: ClauseAnalysisRequest[] = []
    
    let currentPosition = 0
    
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim()
      if (trimmedSentence.length > 0) {
        const startPos = text.indexOf(trimmedSentence, currentPosition)
        const endPos = startPos + trimmedSentence.length
        
        clauses.push({
          text: trimmedSentence,
          clauseId: `clause_${index + 1}`,
          position: { start: startPos, end: endPos }
        })
        
        currentPosition = endPos
      }
    })
    
    return clauses
  }

  async analyzeFullContract(text: string): Promise<IAnalysis> {
    const startTime = Date.now()
    let totalTokens = 0

    try {
      // Step 1: Generate contract summary
      const { summary, tokensUsed: summaryTokens } = await this.summarizeContract(text)
      totalTokens += summaryTokens

      // Step 2: Extract and analyze clauses
      const clauseRequests = await this.extractClauses(text)
      const clauses: IClause[] = []

      for (const request of clauseRequests.slice(0, 10)) { // Limit to first 10 clauses for demo
        const { clause, tokensUsed } = await this.analyzeClause(request)
        clauses.push(clause)
        totalTokens += tokensUsed

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Step 3: Generate rewrite suggestions for risky clauses
      for (const clause of clauses) {
        if (clause.riskLevel === 'risky' || clause.riskLevel === 'review') {
          const { rewriteSuggestion, tokensUsed } = await this.generateRewriteSuggestion(clause)
          clause.rewriteSuggestion = rewriteSuggestion
          totalTokens += tokensUsed

          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // Step 4: Determine overall risk
      const riskyClauses = clauses.filter(c => c.riskLevel === 'risky').length
      const reviewClauses = clauses.filter(c => c.riskLevel === 'review').length
      
      let overallRisk: 'safe' | 'review' | 'risky'
      if (riskyClauses > 0) {
        overallRisk = 'risky'
      } else if (reviewClauses > 0) {
        overallRisk = 'review'
      } else {
        overallRisk = 'safe'
      }

      const avgConfidence = clauses.length > 0 
        ? clauses.reduce((sum, clause) => sum + clause.confidence, 0) / clauses.length
        : 0.7

      const processingTime = Date.now() - startTime

      return {
        summary,
        clauses,
        overallRisk,
        confidence: avgConfidence,
        tokensUsed: totalTokens,
        processingTime
      }
    } catch (error) {
      console.error('Full contract analysis failed:', error)
      
      // Return a basic analysis as fallback
      return {
        summary: 'Contract analysis completed with limited information due to processing error.',
        clauses: [],
        overallRisk: 'review',
        confidence: 0.3,
        tokensUsed: totalTokens,
        processingTime: Date.now() - startTime
      }
    }
  }
} 