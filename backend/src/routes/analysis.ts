import express from 'express'
import { requireAuth, asyncHandler } from '../middleware/auth'
import { ContractAnalysis } from '../models/ContractAnalysis'
import { User } from '../models/User'

const router = express.Router()

// Get user's analysis history
router.get('/history', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, status, riskLevel, search } = req.query
    
    const query: any = { userId: req.userId }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status
    }
    
    // Filter by risk level
    if (riskLevel && riskLevel !== 'all') {
      query['analysis.overallRisk'] = riskLevel
    }
    
    // Search by filename
    if (search) {
      query.fileName = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const [analyses, total] = await Promise.all([
      ContractAnalysis.find(query)
        .select('-extractedText') // Exclude large text field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ContractAnalysis.countDocuments(query)
    ])

    res.json({
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve analysis history' 
    })
  }
}))

// Get dashboard statistics
router.get('/stats', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get clause statistics
    const clauseStats = await ContractAnalysis.aggregate([
      { $match: { userId: req.userId, status: 'completed' } },
      { $unwind: '$analysis.clauses' },
      {
        $group: {
          _id: '$analysis.clauses.riskLevel',
          count: { $sum: 1 }
        }
      }
    ])

    const clauseCounts = {
      safe: 0,
      review: 0,
      risky: 0
    }

    clauseStats.forEach((stat: any) => {
      if (stat._id in clauseCounts) {
        clauseCounts[stat._id as keyof typeof clauseCounts] = stat.count
      }
    })

    // Get recent activity
    const recentAnalyses = await ContractAnalysis.find({ 
      userId: req.userId 
    })
      .select('fileName status analysis.overallRisk createdAt')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      totalUploads: user.usage.totalUploads,
      riskyClauses: clauseCounts.risky,
      safeClauses: clauseCounts.safe,
      reviewClauses: clauseCounts.review,
      tokensUsed: user.usage.tokensUsed,
      tokensLimit: user.usage.tokensLimit,
      currentPlan: user.usage.currentPlan,
      recentAnalyses
    })

  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve statistics' 
    })
  }
}))

// Download analysis as PDF/JSON
router.get('/:analysisId/download', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { analysisId } = req.params
    const { format = 'json' } = req.query
    
    const analysis = await ContractAnalysis.findOne({
      _id: analysisId,
      userId: req.userId
    })

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    if (analysis.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Analysis not completed yet' 
      })
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${analysis.fileName}_analysis.json"`)
      
      const downloadData = {
        fileName: analysis.fileName,
        uploadDate: analysis.uploadDate,
        analysis: analysis.analysis,
        generatedAt: new Date().toISOString()
      }
      
      res.json(downloadData)
    } else {
      // TODO: Implement PDF generation
      res.status(501).json({ error: 'PDF format not yet implemented' })
    }

  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ 
      error: 'Failed to download analysis' 
    })
  }
}))

// Delete analysis
router.delete('/:analysisId', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { analysisId } = req.params
    
    const analysis = await ContractAnalysis.findOneAndDelete({
      _id: analysisId,
      userId: req.userId
    })

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    // TODO: Delete file from Cloudinary if needed

    res.json({ 
      success: true,
      message: 'Analysis deleted successfully' 
    })

  } catch (error) {
    console.error('Delete analysis error:', error)
    res.status(500).json({ 
      error: 'Failed to delete analysis' 
    })
  }
}))

export default router 