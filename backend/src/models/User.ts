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
  currentPlan: 'free' | 'pro' | 'enterprise'
  lastResetDate: Date
}

export interface IUser extends Document {
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  preferences: IUserPreferences
  usage: IUsageStats
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
  currentPlan: { 
    type: String, 
    default: 'free', 
    enum: ['free', 'pro', 'enterprise'] 
  },
  lastResetDate: { type: Date, default: Date.now }
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
  firstName: { type: String },
  lastName: { type: String },
  imageUrl: { type: String },
  preferences: { 
    type: userPreferencesSchema, 
    default: () => ({}) 
  },
  usage: { 
    type: usageStatsSchema, 
    default: () => ({}) 
  }
}, {
  timestamps: true
})

// Indexes
userSchema.index({ clerkId: 1 })
userSchema.index({ email: 1 })

export const User = mongoose.model<IUser>('User', userSchema) 