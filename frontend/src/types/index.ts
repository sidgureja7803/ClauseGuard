export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
}

export interface ContractAnalysis {
  id: string
  userId: string
  fileName: string
  fileUrl: string
  uploadDate: string
  fileType: 'pdf' | 'docx' | 'txt'
  status: 'processing' | 'completed' | 'failed'
  analysis?: {
    summary: string
    clauses: Clause[]
    overallRisk: 'safe' | 'review' | 'risky'
    confidence: number
  }
}

export interface Clause {
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

export interface UploadResponse {
  success: boolean
  analysisId: string
  message: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface DashboardStats {
  totalUploads: number
  riskyClauses: number
  safeClauses: number
  tokensUsed: number
  tokensLimit: number
}

import React from 'react'

export interface FeatureCard {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
} 