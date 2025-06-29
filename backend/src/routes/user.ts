import express from 'express'
import { requireAuth, asyncHandler } from '../middleware/auth'
import { User } from '../models/User'
import { ContractAnalysis } from '../models/ContractAnalysis'

const router = express.Router()

// Get user profile and preferences
router.get('/profile', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      preferences: user.preferences,
      usage: user.usage,
      createdAt: user.createdAt
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve user profile' 
    })
  }
}))

// Get dashboard statistics
router.get('/dashboard/stats', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const userId = req.userId

    // Get user's contract analysis stats
    const [totalUploads, completedAnalyses, userDoc] = await Promise.all([
      ContractAnalysis.countDocuments({ userId }),
      ContractAnalysis.find({ userId, status: 'completed' }),
      User.findOne({ clerkId: userId })
    ])

    // Calculate clause statistics
    let riskyClauses = 0
    let safeClauses = 0
    let tokensUsed = 0

    completedAnalyses.forEach(analysis => {
      if (analysis.analysis?.clauses) {
        analysis.analysis.clauses.forEach(clause => {
          if (clause.riskLevel === 'risky') {
            riskyClauses++
          } else if (clause.riskLevel === 'safe') {
            safeClauses++
          }
        })
      }
      if (analysis.analysis?.tokensUsed) {
        tokensUsed += analysis.analysis.tokensUsed
      }
    })

    const stats = {
      totalUploads,
      riskyClauses,
      safeClauses,
      tokensUsed: userDoc?.usage?.tokensUsed || tokensUsed,
      tokensLimit: 10000 // Default limit, could be user-specific
    }

    res.json(stats)

  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve dashboard statistics' 
    })
  }
}))

// Get recent uploads for dashboard
router.get('/dashboard/recent-uploads', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const userId = req.userId
    const limit = parseInt(req.query.limit as string) || 5

    const recentUploads = await ContractAnalysis.find({ userId })
      .select('-extractedText') // Exclude large text field
      .sort({ uploadDate: -1 })
      .limit(limit)
      .lean()

    // Format the response to match frontend expectations
    const formattedUploads = recentUploads.map(upload => ({
      id: upload._id,
      userId: upload.userId,
      fileName: upload.fileName,
      fileUrl: upload.fileUrl,
      uploadDate: upload.uploadDate,
      fileType: upload.fileType,
      status: upload.status,
      analysis: upload.analysis
    }))

    res.json(formattedUploads)

  } catch (error) {
    console.error('Get recent uploads error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve recent uploads' 
    })
  }
}))

// Update user preferences
router.put('/preferences', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { emailNotifications, analysisAlerts, weeklyReports } = req.body

    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update preferences
    if (typeof emailNotifications === 'boolean') {
      user.preferences.emailNotifications = emailNotifications
    }
    if (typeof analysisAlerts === 'boolean') {
      user.preferences.analysisAlerts = analysisAlerts
    }
    if (typeof weeklyReports === 'boolean') {
      user.preferences.weeklyReports = weeklyReports
    }

    await user.save()

    res.json({
      success: true,
      preferences: user.preferences,
      message: 'Preferences updated successfully'
    })

  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({ 
      error: 'Failed to update preferences' 
    })
  }
}))

// Get user's token usage analytics
router.get('/analytics/tokens', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const userId = req.userId
    const { timeRange = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    const analyses = await ContractAnalysis.find({
      userId,
      uploadDate: { $gte: startDate },
      status: 'completed'
    }).sort({ uploadDate: 1 })

    // Group by day and calculate token usage
    const dailyUsage: { [key: string]: number } = {}
    const labels: string[] = []
    const data: number[] = []

    // Initialize all days in range
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
      const dateKey = date.toISOString().split('T')[0]
      dailyUsage[dateKey] = 0
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }

    // Aggregate actual usage
    analyses.forEach(analysis => {
      const dateKey = analysis.uploadDate.toISOString().split('T')[0]
      if (dailyUsage.hasOwnProperty(dateKey)) {
        dailyUsage[dateKey] += analysis.analysis?.tokensUsed || 0
      }
    })

    Object.keys(dailyUsage).forEach(key => {
      data.push(dailyUsage[key])
    })

    const totalTokens = data.reduce((sum, val) => sum + val, 0)
    const avgDaily = totalTokens / daysBack

    res.json({
      labels,
      data,
      summary: {
        totalTokens,
        avgDaily: Math.round(avgDaily),
        timeRange,
        period: `${daysBack} days`
      }
    })

  } catch (error) {
    console.error('Get token analytics error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve token analytics' 
    })
  }
}))

// Get user's contract risk analytics
router.get('/analytics/risks', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const userId = req.userId
    const { timeRange = '30d' } = req.query

    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    const analyses = await ContractAnalysis.find({
      userId,
      uploadDate: { $gte: startDate },
      status: 'completed'
    })

    // Calculate risk distribution
    const riskStats = {
      safe: 0,
      review: 0,
      risky: 0,
      total: analyses.length
    }

    const clauseTypes: { [key: string]: number } = {}
    const riskTrends: { [key: string]: { safe: number; review: number; risky: number } } = {}

    analyses.forEach(analysis => {
      // Overall risk distribution
      const overallRisk = analysis.analysis?.overallRisk
      if (overallRisk && riskStats.hasOwnProperty(overallRisk)) {
        riskStats[overallRisk]++
      }

      // Clause-level analysis
      if (analysis.analysis?.clauses) {
        analysis.analysis.clauses.forEach(clause => {
          if (clause.riskLevel === 'risky') {
            // Track common risk types
            clause.riskReasons?.forEach(reason => {
              clauseTypes[reason] = (clauseTypes[reason] || 0) + 1
            })
          }
        })
      }

      // Risk trends over time
      const monthKey = analysis.uploadDate.toISOString().substring(0, 7) // YYYY-MM
      if (!riskTrends[monthKey]) {
        riskTrends[monthKey] = { safe: 0, review: 0, risky: 0 }
      }
      if (overallRisk && riskTrends[monthKey].hasOwnProperty(overallRisk)) {
        riskTrends[monthKey][overallRisk]++
      }
    })

    // Get top risk types
    const topRiskTypes = Object.entries(clauseTypes)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }))

    res.json({
      riskDistribution: riskStats,
      topRiskTypes,
      riskTrends,
      summary: {
        totalContracts: analyses.length,
        riskScore: riskStats.total > 0 ? Math.round((riskStats.risky / riskStats.total) * 100) : 0,
        timeRange,
        period: `${daysBack} days`
      }
    })

  } catch (error) {
    console.error('Get risk analytics error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve risk analytics' 
    })
  }
}))

// Update user usage tracking
router.patch('/usage', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { tokensUsed, apiCalls } = req.body
    const userId = req.userId

    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update usage statistics
    if (typeof tokensUsed === 'number') {
      user.usage.tokensUsed = (user.usage.tokensUsed || 0) + tokensUsed
    }
    if (typeof apiCalls === 'number') {
      user.usage.apiCalls = (user.usage.apiCalls || 0) + apiCalls
    }

    user.usage.lastActive = new Date()
    await user.save()

    res.json({
      success: true,
      usage: user.usage,
      message: 'Usage updated successfully'
    })

  } catch (error) {
    console.error('Update usage error:', error)
    res.status(500).json({ 
      error: 'Failed to update usage' 
    })
  }
}))

// Delete user account and all data
router.delete('/account', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const userId = req.userId

    // Delete all user's contract analyses
    await ContractAnalysis.deleteMany({ userId })

    // Delete user record
    await User.findOneAndDelete({ clerkId: userId })

    res.json({
      success: true,
      message: 'Account deletion request received. Processing will complete within 24 hours.'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ 
      error: 'Failed to process account deletion' 
    })
  }
}))

export default router 