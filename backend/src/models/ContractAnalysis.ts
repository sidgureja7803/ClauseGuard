import mongoose, { Document, Schema } from 'mongoose'

export interface IClause {
  id: string
  text: string
  summary: string
  riskLevel: 'safe' | 'review' | 'risky'
  riskReasons: string[]
  recommendations?: string[]
  impact?: string
  rewriteSuggestion?: string
  confidence: number
  position: {
    start: number
    end: number
  }
}

export interface IRiskAssessment {
  score: number
  level: string
  factors: Array<{
    risk: string
    impact: string
    mitigation: string
  }>
}

export interface IKeyFinding {
  issue: string
  riskLevel: 'safe' | 'review' | 'risky'
  impact: 'low' | 'medium' | 'high'
  recommendation: string
  clause?: string
}

export interface IAnalysis {
  summary: string
  clauses: IClause[]
  overallRisk: 'safe' | 'review' | 'risky'
  confidence: number
  tokensUsed: number
  processingTime: number
  contractType?: string
  riskScore?: number
  keyFindings?: IKeyFinding[]
  recommendations?: string[]
  actionItems?: string[]
  executiveSummary?: string
  riskAssessment?: IRiskAssessment
  complianceNotes?: string[]
  strengthsAndWeaknesses?: {
    strengths: string[]
    weaknesses: string[]
  }
  agentAuditTrail?: IAgentStep[]
  userFeedback?: IUserFeedback[]
}

export interface IAgentStep {
  stepId: string
  stepType: 'extraction' | 'risk_tagging' | 'clause_suggestion' | 'summary' | 'prioritization'
  stepName: string
  startTime: Date
  endTime: Date
  agentDecision: string
  reasoning: string
  tokensUsed: number
  confidence: number
  input: any
  output: any
}

export interface IUserFeedback {
  feedbackId: string
  suggestionId: string
  feedbackType: 'helpful' | 'not_helpful' | 'corrected'
  userCorrection?: string
  timestamp: Date
  applied: boolean
}

export interface IContractAnalysis extends Document {
  userId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: 'pdf' | 'docx' | 'txt'
  uploadDate: Date
  status: 'processing' | 'completed' | 'failed'
  analysis?: IAnalysis
  errorMessage?: string
  extractedText?: string
  createdAt: Date
  updatedAt: Date
}

const clauseSchema = new Schema<IClause>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  summary: { type: String, required: true },
  riskLevel: { 
    type: String, 
    required: true, 
    enum: ['safe', 'review', 'risky'] 
  },
  riskReasons: [{ type: String }],
  recommendations: [{ type: String }],
  impact: { type: String },
  rewriteSuggestion: { type: String },
  confidence: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 1 
  },
  position: {
    start: { type: Number, required: true },
    end: { type: Number, required: true }
  }
}, { _id: false })

const agentStepSchema = new Schema<IAgentStep>({
  stepId: { type: String, required: true },
  stepType: { 
    type: String, 
    required: true,
    enum: ['extraction', 'risk_tagging', 'clause_suggestion', 'summary', 'prioritization']
  },
  stepName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  agentDecision: { type: String, required: true },
  reasoning: { type: String, required: true },
  tokensUsed: { type: Number, default: 0 },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  input: { type: Schema.Types.Mixed },
  output: { type: Schema.Types.Mixed }
}, { _id: false })

const userFeedbackSchema = new Schema<IUserFeedback>({
  feedbackId: { type: String, required: true },
  suggestionId: { type: String, required: true },
  feedbackType: { 
    type: String, 
    required: true,
    enum: ['helpful', 'not_helpful', 'corrected']
  },
  userCorrection: { type: String },
  timestamp: { type: Date, default: Date.now },
  applied: { type: Boolean, default: false }
}, { _id: false })

const analysisSchema = new Schema<IAnalysis>({
  summary: { type: String, required: true },
  clauses: [clauseSchema],
  overallRisk: { 
    type: String, 
    required: true, 
    enum: ['safe', 'review', 'risky'] 
  },
  confidence: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 1 
  },
  tokensUsed: { type: Number, required: true },
  processingTime: { type: Number, required: true },
  contractType: { type: String },
  riskScore: { type: Number },
  keyFindings: [{
    issue: { type: String },
    riskLevel: { type: String },
    impact: { type: String },
    recommendation: { type: String },
    clause: { type: String }
  }],
  recommendations: [{ type: String }],
  actionItems: [{ type: String }],
  executiveSummary: { type: String },
  riskAssessment: {
    score: { type: Number },
    level: { type: String },
    factors: [{
      risk: { type: String },
      impact: { type: String },
      mitigation: { type: String }
    }]
  },
  complianceNotes: [{ type: String }],
  strengthsAndWeaknesses: {
    strengths: [{ type: String }],
    weaknesses: [{ type: String }]
  },
  agentAuditTrail: [agentStepSchema],
  userFeedback: [userFeedbackSchema]
}, { _id: false })

const contractAnalysisSchema = new Schema<IContractAnalysis>({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  fileType: { 
    type: String, 
    required: true, 
    enum: ['pdf', 'docx', 'txt'] 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  analysis: analysisSchema,
  errorMessage: { type: String },
  extractedText: { type: String }
}, {
  timestamps: true
})

// Indexes for performance
contractAnalysisSchema.index({ userId: 1, createdAt: -1 })
contractAnalysisSchema.index({ status: 1 })
contractAnalysisSchema.index({ 'analysis.overallRisk': 1 })

export const ContractAnalysis = mongoose.model<IContractAnalysis>('ContractAnalysis', contractAnalysisSchema) 