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

// Get usage statistics
router.get('/usage', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get monthly usage breakdown
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyAnalyses = await ContractAnalysis.find({
      userId: req.userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).countDocuments()

    const monthlyTokens = await ContractAnalysis.aggregate([
      {
        $match: {
          userId: req.userId,
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$analysis.tokensUsed' }
        }
      }
    ])

    res.json({
      currentUsage: user.usage,
      monthlyStats: {
        analyses: monthlyAnalyses,
        tokensUsed: monthlyTokens[0]?.totalTokens || 0
      },
      billingPeriod: {
        startDate: user.usage.lastResetDate,
        endDate: new Date(new Date(user.usage.lastResetDate).setMonth(new Date(user.usage.lastResetDate).getMonth() + 1))
      }
    })

  } catch (error) {
    console.error('Get usage error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve usage statistics' 
    })
  }
}))

// Export user data
router.get('/export', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const analyses = await ContractAnalysis.find({ userId: req.userId })
      .select('-extractedText') // Exclude large text fields for export

    const exportData = {
      user: {
        id: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences,
        usage: user.usage,
        createdAt: user.createdAt
      },
      analyses: analyses.map(analysis => ({
        id: analysis._id,
        fileName: analysis.fileName,
        fileType: analysis.fileType,
        uploadDate: analysis.uploadDate,
        status: analysis.status,
        analysis: analysis.analysis
      })),
      exportedAt: new Date().toISOString()
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename="clauseguard_data_export.json"')
    res.json(exportData)

  } catch (error) {
    console.error('Export data error:', error)
    res.status(500).json({ 
      error: 'Failed to export user data' 
    })
  }
}))

// Delete user account (soft delete)
router.delete('/account', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { confirmDelete } = req.body

    if (!confirmDelete) {
      return res.status(400).json({ 
        error: 'Account deletion must be confirmed' 
      })
    }

    // TODO: Implement account deletion logic
    // - Mark user as deleted
    // - Delete/anonymize personal data
    // - Delete uploaded files
    // - Cancel subscriptions

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