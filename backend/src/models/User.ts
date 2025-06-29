import mongoose, { Document, Schema } from 'mongoose'

export interface IUserPreferences {
  emailNotifications: boolean
  analysisAlerts: boolean
  weeklyReports: boolean
}

export interface IUsageStats {
  totalUploads: number
  tokensUsed: number
  tokensLimit: number
  apiCalls: number
  currentPlan: 'free' | 'pro' | 'enterprise'
  lastResetDate: Date
  lastActive: Date
}

export interface IUser extends Document {
  clerkId: string
  email: string
  name: string
  imageUrl?: string
  usage: {
    totalUploads: number
    tokensUsed: number
    tokensLimit: number
    apiCalls: number
    lastActive: Date
    currentPlan: 'free' | 'pro' | 'enterprise'
  }
  agentMemory: {
    contractHistory: Array<{
      contractId: string
      contractType: string
      riskLevel: string
      userPreferences: Record<string, any>
      timestamp: Date
    }>
    feedbackHistory: Array<{
      analysisId: string
      suggestionId: string
      feedbackType: 'helpful' | 'not_helpful' | 'corrected'
      userCorrection?: string
      timestamp: Date
    }>
    learnedPatterns: Array<{
      pattern: string
      userPreference: string
      confidence: number
      lastUsed: Date
    }>
  }
  agentPreferences: {
    preferredAnalysisDepth: 'quick' | 'standard' | 'thorough'
    prioritizedRisks: string[]
    notificationSettings: Record<string, boolean>
  }
  createdAt: Date
  updatedAt: Date
}

const userPreferencesSchema = new Schema<IUserPreferences>({
  emailNotifications: { type: Boolean, default: true },
  analysisAlerts: { type: Boolean, default: true },
  weeklyReports: { type: Boolean, default: false }
}, { _id: false })

const usageStatsSchema = new Schema<IUsageStats>({
  totalUploads: { type: Number, default: 0 },
  tokensUsed: { type: Number, default: 0 },
  tokensLimit: { type: Number, default: 10000 },
  apiCalls: { type: Number, default: 0 },
  currentPlan: { 
    type: String, 
    default: 'free', 
    enum: ['free', 'pro', 'enterprise'] 
  },
  lastResetDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, { _id: false })

const userSchema = new Schema<IUser>({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  usage: {
    totalUploads: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
    tokensLimit: { type: Number, default: 10000 },
    apiCalls: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    currentPlan: { 
      type: String, 
      enum: ['free', 'pro', 'enterprise'], 
      default: 'free' 
    }
  },
  agentMemory: {
    contractHistory: [{
      contractId: { type: String, required: true },
      contractType: { type: String, required: true },
      riskLevel: { type: String, required: true },
      userPreferences: { type: Schema.Types.Mixed, default: {} },
      timestamp: { type: Date, default: Date.now }
    }],
    feedbackHistory: [{
      analysisId: { type: String, required: true },
      suggestionId: { type: String, required: true },
      feedbackType: { 
        type: String, 
        enum: ['helpful', 'not_helpful', 'corrected'], 
        required: true 
      },
      userCorrection: { type: String },
      timestamp: { type: Date, default: Date.now }
    }],
    learnedPatterns: [{
      pattern: { type: String, required: true },
      userPreference: { type: String, required: true },
      confidence: { type: Number, default: 0.5, min: 0, max: 1 },
      lastUsed: { type: Date, default: Date.now }
    }]
  },
  agentPreferences: {
    preferredAnalysisDepth: { 
      type: String, 
      enum: ['quick', 'standard', 'thorough'], 
      default: 'standard' 
    },
    prioritizedRisks: [{ type: String }],
    notificationSettings: { type: Schema.Types.Mixed, default: {} }
  }
}, {
  timestamps: true
})

// Indexes
userSchema.index({ clerkId: 1 })
userSchema.index({ email: 1 })

export const User = mongoose.model<IUser>('User', userSchema) 