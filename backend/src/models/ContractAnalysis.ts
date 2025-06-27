import mongoose, { Document, Schema } from 'mongoose'

export interface IClause {
  id: string
  text: string
  summary: string
  riskLevel: 'safe' | 'review' | 'risky'
  riskReasons: string[]
  rewriteSuggestion?: string
  confidence: number
  position: {
    start: number
    end: number
  }
}

export interface IAnalysis {
  summary: string
  clauses: IClause[]
  overallRisk: 'safe' | 'review' | 'risky'
  confidence: number
  tokensUsed: number
  processingTime: number
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
  processingTime: { type: Number, required: true }
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