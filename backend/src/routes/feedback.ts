import express from 'express'
import { requireAuth, asyncHandler } from '../middleware/auth'
import { ContractAnalysis } from '../models/ContractAnalysis'
import { User } from '../models/User'

const router = express.Router()

// Submit feedback on analysis suggestion
router.post('/suggestion', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { 
      analysisId, 
      suggestionId, 
      feedbackType, 
      userCorrection, 
      clauseText 
    } = req.body

    if (!analysisId || !suggestionId || !feedbackType) {
      return res.status(400).json({ 
        error: 'analysisId, suggestionId, and feedbackType are required' 
      })
    }

    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update contract analysis with feedback
    const analysis = await ContractAnalysis.findById(analysisId)
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    if (analysis.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Add feedback to analysis
    if (!analysis.analysis?.userFeedback) {
      if (!analysis.analysis) {
        analysis.analysis = {
          summary: '',
          clauses: [],
          overallRisk: 'review',
          confidence: 0.5,
          tokensUsed: 0,
          processingTime: 0,
          userFeedback: []
        } as any
      } else {
        analysis.analysis.userFeedback = []
      }
    }

    analysis.analysis!.userFeedback!.push({
      feedbackId,
      suggestionId,
      feedbackType,
      userCorrection,
      timestamp: new Date(),
      applied: false
    })

    await analysis.save()

    // Update user's feedback history for agent learning
    await User.findOneAndUpdate(
      { clerkId: req.userId },
      {
        $push: {
          'agentMemory.feedbackHistory': {
            analysisId,
            suggestionId,
            feedbackType,
            userCorrection,
            timestamp: new Date()
          }
        }
      }
    )

    // If it's a correction, try to extract learned patterns
    if (feedbackType === 'corrected' && userCorrection && clauseText) {
      const pattern = await extractLearningPattern(clauseText, userCorrection)
      if (pattern) {
        await User.findOneAndUpdate(
          { clerkId: req.userId },
          {
            $push: {
              'agentMemory.learnedPatterns': {
                pattern: pattern.pattern,
                userPreference: pattern.preference,
                confidence: 0.7,
                lastUsed: new Date()
              }
            }
          }
        )
      }
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId,
      learnedPattern: feedbackType === 'corrected'
    })

  } catch (error) {
    console.error('Submit feedback error:', error)
    res.status(500).json({ 
      error: 'Failed to submit feedback' 
    })
  }
}))

// Get user feedback statistics
router.get('/stats', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const feedbackHistory = user.agentMemory?.feedbackHistory || []
    const learnedPatterns = user.agentMemory?.learnedPatterns || []

    const stats = {
      totalFeedback: feedbackHistory.length,
      helpfulFeedback: feedbackHistory.filter(f => f.feedbackType === 'helpful').length,
      corrections: feedbackHistory.filter(f => f.feedbackType === 'corrected').length,
      learnedPatterns: learnedPatterns.length,
      lastFeedback: feedbackHistory.length > 0 
        ? feedbackHistory[feedbackHistory.length - 1].timestamp 
        : null
    }

    res.json(stats)

  } catch (error) {
    console.error('Get feedback stats error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve feedback statistics' 
    })
  }
}))

// Get agent learning insights for user
router.get('/insights', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const contractHistory = user.agentMemory?.contractHistory || []
    const learnedPatterns = user.agentMemory?.learnedPatterns || []
    const feedbackHistory = user.agentMemory?.feedbackHistory || []

    // Generate insights
    const insights = {
      contractPreferences: analyzeContractPreferences(contractHistory),
      riskTolerance: analyzeRiskTolerance(feedbackHistory),
      learningProgress: {
        patternsLearned: learnedPatterns.length,
        feedbackGiven: feedbackHistory.length,
        improvementAreas: identifyImprovementAreas(feedbackHistory)
      },
      recommendations: generatePersonalizedRecommendations(user.agentMemory)
    }

    res.json(insights)

  } catch (error) {
    console.error('Get insights error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve insights' 
    })
  }
}))

// Apply feedback corrections to improve future analysis
router.post('/apply/:feedbackId', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { feedbackId } = req.params
    const { applied } = req.body

    // Find the analysis containing this feedback
    const analysis = await ContractAnalysis.findOne({
      userId: req.userId,
      'analysis.userFeedback.feedbackId': feedbackId
    })

    if (!analysis) {
      return res.status(404).json({ error: 'Feedback not found' })
    }

    // Mark feedback as applied
    const feedback = analysis.analysis?.userFeedback?.find(f => f.feedbackId === feedbackId)
    if (feedback) {
      feedback.applied = applied
      await analysis.save()
    }

    res.json({
      success: true,
      message: 'Feedback application status updated',
      applied
    })

  } catch (error) {
    console.error('Apply feedback error:', error)
    res.status(500).json({ 
      error: 'Failed to apply feedback' 
    })
  }
}))

// Helper functions
async function extractLearningPattern(originalClause: string, userCorrection: string) {
  try {
    // Simple pattern extraction - in production, use ML
    const originalWords = originalClause.toLowerCase().split(' ')
    const correctionWords = userCorrection.toLowerCase().split(' ')
    
    // Find key differences
    const addedWords = correctionWords.filter(word => !originalWords.includes(word))
    const removedWords = originalWords.filter(word => !correctionWords.includes(word))
    
    if (addedWords.length > 0 || removedWords.length > 0) {
      return {
        pattern: `Contract clauses involving: ${removedWords.join(', ')}`,
        preference: `User prefers: ${addedWords.join(', ')}`
      }
    }
    
    return null
  } catch (error) {
    console.error('Pattern extraction error:', error)
    return null
  }
}

function analyzeContractPreferences(contractHistory: any[]) {
  const contractTypes = contractHistory.map(c => c.contractType)
  const riskLevels = contractHistory.map(c => c.riskLevel)
  
  return {
    mostCommonType: getMostFrequent(contractTypes),
    riskDistribution: {
      safe: riskLevels.filter(r => r === 'safe').length,
      review: riskLevels.filter(r => r === 'review').length,
      risky: riskLevels.filter(r => r === 'risky').length
    },
    totalContracts: contractHistory.length
  }
}

function analyzeRiskTolerance(feedbackHistory: any[]) {
  const corrections = feedbackHistory.filter(f => f.feedbackType === 'corrected')
  const helpful = feedbackHistory.filter(f => f.feedbackType === 'helpful')
  
  return {
    correctionRate: feedbackHistory.length > 0 ? corrections.length / feedbackHistory.length : 0,
    satisfaction: feedbackHistory.length > 0 ? helpful.length / feedbackHistory.length : 0,
    engagementLevel: feedbackHistory.length > 10 ? 'high' : feedbackHistory.length > 3 ? 'medium' : 'low'
  }
}

function identifyImprovementAreas(feedbackHistory: any[]) {
  const recentFeedback = feedbackHistory.slice(-10)
  const corrections = recentFeedback.filter(f => f.feedbackType === 'corrected')
  
  return corrections.length > 3 
    ? ['Clause interpretation accuracy', 'Risk assessment calibration']
    : ['Continue providing feedback for better personalization']
}

function generatePersonalizedRecommendations(agentMemory: any) {
  const recommendations = []
  
  if (agentMemory.feedbackHistory?.length < 3) {
    recommendations.push('Provide more feedback to help the agent learn your preferences')
  }
  
  if (agentMemory.contractHistory?.length > 5) {
    recommendations.push('Consider setting up automated monitoring for contract types you analyze frequently')
  }
  
  if (agentMemory.learnedPatterns?.length > 10) {
    recommendations.push('Your agent has learned significant patterns - try the advanced analysis mode')
  }
  
  return recommendations.length > 0 ? recommendations : ['Keep using ClauseGuard to build your agent\'s knowledge']
}

function getMostFrequent(arr: string[]) {
  if (arr.length === 0) return 'none'
  
  const frequency: { [key: string]: number } = {}
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1
  })
  
  return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b)
}

export default router 