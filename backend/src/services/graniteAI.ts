import axios from 'axios'
import { IClause, IAnalysis } from '../models/ContractAnalysis'

interface IAMTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  expiration: number
  scope: string
}

interface GraniteResponse {
  results: Array<{
    generated_text: string
    stop_reason?: string
  }>
  created_at: string
  model_id: string
  input_token_count?: number
  generated_token_count?: number
}

interface ClauseAnalysisRequest {
  text: string
  clauseId: string
  position: { start: number; end: number }
}

export class GraniteAIService {
  private apiKey: string
  private baseURL: string
  private iamBaseURL: string
  private projectId: string
  private accessToken: string | null = null
  private tokenExpiration: number = 0

  constructor() {
    this.apiKey = process.env.IBM_GRANITE_API_KEY || ''
    this.baseURL = process.env.IBM_GRANITE_BASE_URL || 'https://us-south.ml.cloud.ibm.com'
    this.iamBaseURL = 'https://iam.cloud.ibm.com'
    this.projectId = process.env.WATSONX_PROJECT_ID || process.env.PROJECT_ID || ''
    
    if (!this.apiKey) {
      throw new Error('IBM_GRANITE_API_KEY environment variable is required')
    }
    
    console.log('🚀 IBM Granite AI initialized with proper IAM authentication')
    console.log('📡 Base URL:', this.baseURL)
    console.log('🔑 Project ID:', this.projectId ? 'Set' : 'Missing')
  }

  private async getIAMToken(): Promise<string> {
    try {
      console.log('🔐 Getting IBM IAM access token...')
      
      const response = await axios.post(
        `${this.iamBaseURL}/identity/token`,
        new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.apiKey
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )

      const tokenData: IAMTokenResponse = response.data
      this.accessToken = tokenData.access_token
      this.tokenExpiration = Date.now() + (tokenData.expires_in * 1000) - 60000 // Refresh 1 minute early
      
      console.log('✅ IBM IAM access token obtained successfully')
      return tokenData.access_token
    } catch (error: any) {
      console.error('❌ Failed to get IBM IAM token:', error.response?.data || error.message)
      throw new Error(`IBM IAM authentication failed: ${error.response?.data?.errorMessage || error.message}`)
    }
  }

  private async getValidToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiration) {
      return this.accessToken
    }
    
    // Get a new token
    return await this.getIAMToken()
  }

  private async makeRequest(data: any): Promise<GraniteResponse> {
    try {
      const token = await this.getValidToken()
      console.log('🔗 Making IBM WatsonX.ai API request...')
      
      const requestData = {
        ...data,
        project_id: this.projectId
      }

      const response = await axios.post(
        `${this.baseURL}/ml/v1/text/generation?version=2024-05-01`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // Increased timeout for better reliability
        }
      )
      
      console.log('✅ IBM WatsonX.ai API response received')
      return response.data
    } catch (error: any) {
      console.error('❌ IBM WatsonX.ai API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      // If token is expired, try to refresh once
      if (error.response?.status === 401 && this.accessToken) {
        console.log('🔄 Token might be expired, refreshing...')
        this.accessToken = null
        const newToken = await this.getValidToken()
        
        // Retry the request with new token
        try {
          const requestData = {
            ...data,
            project_id: this.projectId
          }

          const retryResponse = await axios.post(
            `${this.baseURL}/ml/v1/text/generation?version=2024-05-01`,
            requestData,
            {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              timeout: 30000
            }
          )
          
          console.log('✅ IBM WatsonX.ai API retry successful')
          return retryResponse.data
        } catch (retryError: any) {
          console.error('❌ IBM WatsonX.ai API retry failed:', retryError.response?.data || retryError.message)
        }
      }
      
      throw new Error(`IBM WatsonX.ai API error: ${error.response?.data?.error?.message || error.response?.data?.message || error.message}`)
    }
  }

  async summarizeContract(text: string): Promise<{ summary: string; tokensUsed: number }> {
    const prompt = `Analyze the following contract and provide a comprehensive summary in 2-3 sentences. Focus on the key terms, obligations, and any notable clauses that require attention.

Contract text:
${text}

Summary:`

    const response = await this.makeRequest({
      model_id: 'ibm/granite-3-3-8b-instruct',
      input: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.3,
        top_p: 0.9,
        stop_sequences: ['\\n\\n']
      }
    })

    return {
      summary: response.results[0]?.generated_text?.trim() || 'Unable to generate summary',
      tokensUsed: (response.input_token_count || 0) + (response.generated_token_count || 0)
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

    const response = await this.makeRequest({
      model_id: 'ibm/granite-3-3-8b-instruct',
      input: prompt,
      parameters: {
        max_new_tokens: 800,
        temperature: 0.2,
        top_p: 0.8
      }
    })

    try {
      const analysisText = response.results[0]?.generated_text?.trim() || '{}'
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
        tokensUsed: (response.input_token_count || 0) + (response.generated_token_count || 0)
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
        tokensUsed: (response.input_token_count || 0) + (response.generated_token_count || 0)
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

    const response = await this.makeRequest({
      model_id: 'ibm/granite-3-3-8b-instruct',
      input: prompt,
      parameters: {
        max_new_tokens: 600,
        temperature: 0.4,
        top_p: 0.9
      }
    })

    return {
      rewriteSuggestion: response.results[0]?.generated_text?.trim() || 'Manual rewrite recommended',
      tokensUsed: (response.input_token_count || 0) + (response.generated_token_count || 0)
    }
  }

  async extractClauses(text: string): Promise<ClauseAnalysisRequest[]> {
    // Simple clause extraction based on common patterns
    // In a production system, you might want more sophisticated NLP
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 50)
    
    return sentences.slice(0, 10).map((sentence, index) => ({
      clauseId: `clause-${index + 1}`,
      text: sentence.trim(),
      position: { start: index * 100, end: (index + 1) * 100 }
    }))
  }

  async analyzeFullContract(text: string): Promise<IAnalysis> {
    const startTime = Date.now()
    console.log('🧠 Starting full contract analysis with IBM Granite AI...')
    
    try {
      // Step 1: Generate summary
      const summaryResult = await this.summarizeContract(text)
      
      // Step 2: Extract and analyze clauses
      const clauseRequests = await this.extractClauses(text)
      const clauseAnalyses = await Promise.all(
        clauseRequests.slice(0, 5).map(request => this.analyzeClause(request)) // Limit to 5 clauses for speed
      )
      
      const clauses = clauseAnalyses.map(result => result.clause)
      
      // Step 3: Determine overall risk
      const riskLevels = clauses.map(c => c.riskLevel)
      const riskyCount = riskLevels.filter(r => r === 'risky').length
      const reviewCount = riskLevels.filter(r => r === 'review').length
      
      let overallRisk: 'safe' | 'review' | 'risky'
      if (riskyCount > 0) {
        overallRisk = 'risky'
      } else if (reviewCount > 0) {
        overallRisk = 'review'
      } else {
        overallRisk = 'safe'
      }
      
      // Step 4: Calculate confidence
      const avgConfidence = clauses.length > 0 
        ? clauses.reduce((sum, c) => sum + c.confidence, 0) / clauses.length 
        : 0.7
      
      // Step 5: Calculate total tokens used
      const totalTokens = summaryResult.tokensUsed + 
        clauseAnalyses.reduce((sum, result) => sum + result.tokensUsed, 0)

      const processingTime = Date.now() - startTime
      console.log(`✅ Full contract analysis completed successfully in ${processingTime}ms`)
      
      return {
        summary: summaryResult.summary,
        clauses,
        overallRisk,
        confidence: avgConfidence,
        tokensUsed: totalTokens,
        processingTime
      }
    } catch (error) {
      console.error('❌ Full contract analysis failed:', error)
      throw error
    }
  }
} 