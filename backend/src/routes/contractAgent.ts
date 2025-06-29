import express from 'express'
import { ContractAIAgent, ContractAgentInput } from '../services/contractAgent'
import { requireAuth, asyncHandler } from '../middleware/auth'
import { ContractAnalysis } from '../models/ContractAnalysis'
import { User } from '../models/User'

const router = express.Router()

// Lazy initialization - only create when needed and API keys are available
let contractAgent: ContractAIAgent | null = null

function getContractAgent(): ContractAIAgent | null {
  // Check if AI services are configured
  const hasAIConfig = process.env.IBM_GRANITE_API_KEY && 
                     process.env.IBM_GRANITE_BASE_URL
  
  if (!hasAIConfig) {
    console.log('⚠️ AI services not configured - running in demo mode')
    return null
  }

  // Lazy initialization
  if (!contractAgent) {
    try {
      contractAgent = new ContractAIAgent()
      console.log('✅ ContractAIAgent initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize ContractAIAgent:', error)
      return null
    }
  }
  
  return contractAgent
}

// Demo response for when AI services aren't configured
function getDemoAnalysisResponse(contractText: string, userGoal: string) {
  return {
    success: true,
    result: {
      summary: `Demo Analysis: This is a mock analysis for "${userGoal}". To enable full AI-powered analysis, configure IBM Granite API keys in your environment.`,
      
      overallRisk: 'moderate',
      confidence: 0.75,
      
      keyFindings: [
        {
          type: 'demo',
          title: 'Demo Mode Active',
          description: 'This is a demonstration response. Configure AI services for real analysis.',
          severity: 'info',
          recommendation: 'Add IBM_GRANITE_API_KEY to your .env file'
        }
      ],
      
      clauses: [
        {
          text: contractText.substring(0, 200) + '...',
          risk: 'low',
          explanation: 'Demo analysis - actual risk analysis requires AI service configuration'
        }
      ],
      
      recommendations: [
        'Configure IBM Granite AI for detailed analysis',
        'Set up proper environment variables',
        'Review the DEPLOYMENT_GUIDE.md for setup instructions'
      ]
    },
    agentSteps: [
      { step: 1, description: 'Demo mode - AI services not configured', status: 'completed' }
    ],
    processingTime: 50,
    tokensUsed: 0,
    sessionId: `demo_${Date.now()}`
  }
}

// Main agentic contract analysis endpoint
router.post('/analyze', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { 
      contractText, 
      userGoal, 
      context, 
      priority = 'thoroughness' 
    } = req.body

    if (!contractText || !userGoal) {
      return res.status(400).json({
        success: false,
        error: 'Contract text and user goal are required'
      })
    }

    // Get the agent (returns null if not configured)
    const agent = getContractAgent()

    // If no AI services configured, return demo response
    if (!agent) {
      console.log('🎭 Running in demo mode - AI services not configured')
      const demoResult = getDemoAnalysisResponse(contractText, userGoal)
      
      return res.json({
        success: true,
        message: 'Demo analysis completed (configure AI services for full features)',
        data: {
          analysis: demoResult.result,
          agentSteps: demoResult.agentSteps,
          processingTime: demoResult.processingTime,
          tokensUsed: demoResult.tokensUsed,
          sessionId: demoResult.sessionId
        },
        metadata: {
          userGoal,
          priority,
          agent: 'Demo Mode - Configure IBM Granite for full AI features',
          timestamp: new Date().toISOString()
        }
      })
    }

    // Check user token limits (only if using real AI)
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.usage.tokensUsed >= user.usage.tokensLimit) {
      return res.status(429).json({ 
        error: 'Token limit exceeded. Please upgrade your plan.' 
      })
    }

    const sessionId = `${req.userId}_${Date.now()}`

    console.log('🤖 Contract Agent: Starting agentic analysis...')
    console.log(`🎯 User Goal: ${userGoal}`)
    console.log(`📄 Contract Length: ${contractText.length} characters`)
    console.log(`⚙️ Priority: ${priority}`)

    // Create agent input
    const agentInput: ContractAgentInput = {
      contractText,
      userGoal,
      context,
      priority: priority as 'speed' | 'thoroughness' | 'compliance',
      sessionId
    }

    // Execute the agent
    const result = await agent.analyzeContract(agentInput)

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Agent analysis failed',
        sessionId
      })
    }

    // Update user token usage
    user.usage.tokensUsed += result.tokensUsed || 0
    user.usage.totalUploads += 1
    await user.save()

    console.log('✅ Contract Agent: Analysis completed successfully')
    console.log(`🔥 Agent Steps: ${result.agentSteps}`)
    console.log(`⏱️ Processing Time: ${result.processingTime}ms`)
    console.log(`🪙 Tokens Used: ${result.tokensUsed}`)

    res.json({
      success: true,
      message: 'Agentic contract analysis completed',
      data: {
        analysis: result.result,
        agentSteps: result.agentSteps,
        processingTime: result.processingTime,
        tokensUsed: result.tokensUsed,
        sessionId: result.sessionId
      },
      metadata: {
        userGoal,
        priority,
        agent: 'ContractAIAgent + IBM Granite',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Contract Agent Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Agentic analysis failed',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}))

// Continue conversation with the agent
router.post('/continue', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { sessionId, followUpQuestion } = req.body

    if (!sessionId || !followUpQuestion) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and follow-up question are required'
      })
    }

    const agent = getContractAgent()

    // Demo response if AI not configured
    if (!agent) {
      return res.json({
        success: true,
        message: 'Demo conversation response',
        data: {
          response: `Demo response to: "${followUpQuestion}". Configure IBM Granite AI for real conversational analysis.`,
          sessionId
        },
        metadata: {
          timestamp: new Date().toISOString(),
          agent: 'Demo Mode - Configure AI for conversations'
        }
      })
    }

    console.log('💬 Contract Agent: Continuing conversation...')
    console.log(`🗣️ Follow-up: ${followUpQuestion}`)
    console.log(`📝 Session: ${sessionId}`)

    // Continue the conversation
    const result = await agent.continueConversation(sessionId, followUpQuestion)

    res.json({
      success: true,
      message: 'Conversation continued successfully',
      data: {
        response: result.output,
        sessionId
      },
      metadata: {
        timestamp: new Date().toISOString(),
        agent: 'ContractAIAgent Conversational'
      }
    })

  } catch (error) {
    console.error('❌ Conversation Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to continue conversation',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}))

// Demo endpoint with sample scenarios
router.get('/demo/:scenario', asyncHandler(async (req: any, res: any) => {
  try {
    const { scenario } = req.params

    const demoScenarios = {
      'risk-analysis': {
        contractText: `
          CONSULTING AGREEMENT
          
          1. LIABILITY LIMITATION
          Consultant's total liability for any claims arising under this Agreement shall be 
          limited to the fees paid by Client in the preceding 12 months, regardless of the 
          form of action or the theory of liability.
          
          2. INDEMNIFICATION  
          Client agrees to indemnify and hold harmless Consultant from any and all claims, 
          damages, costs and expenses, including attorney's fees, arising from Client's use 
          of the Services or breach of this Agreement.
          
          3. TERMINATION
          Either party may terminate this Agreement immediately without cause or notice.
          
          4. INTELLECTUAL PROPERTY
          All work product and deliverables created by Consultant shall become the exclusive 
          property of Client upon payment of fees.
        `,
        userGoal: 'I need to understand the major risks in this consulting agreement before signing it',
        context: 'I am a small business owner entering into my first consulting agreement'
      },
      
      'compliance-check': {
        contractText: `
          DATA PROCESSING AGREEMENT
          
          1. DATA PROCESSING
          Processor shall process Personal Data only for the purposes specified in Exhibit A
          and in accordance with Applicable Data Protection Laws.
          
          2. SECURITY MEASURES
          Processor shall implement appropriate technical and organizational measures to 
          ensure security of Personal Data against unauthorized access, disclosure, or destruction.
          
          3. DATA TRANSFERS
          Processor may transfer Personal Data to third countries provided adequate safeguards 
          are in place as required by applicable law.
          
          4. DATA RETENTION
          Personal Data shall be deleted or returned upon termination of services unless 
          required to be retained by law.
        `,
        userGoal: 'Ensure this data processing agreement is GDPR compliant',
        context: 'We are a EU-based company processing customer data and need to ensure full GDPR compliance'
      },
      
      'negotiation-prep': {
        contractText: `
          SOFTWARE LICENSE AGREEMENT
          
          1. LICENSE GRANT
          Licensor grants Licensee a non-exclusive, non-transferable license to use the Software
          for internal business purposes only.
          
          2. RESTRICTIONS
          Licensee may not modify, reverse engineer, or create derivative works based on the Software.
          
          3. SUPPORT
          Licensor will provide email support during business hours for technical issues.
          
          4. WARRANTY DISCLAIMER
          THE SOFTWARE IS PROVIDED "AS IS" WITHOUT ANY WARRANTIES OF ANY KIND.
        `,
        userGoal: 'Help me prepare for negotiations - what terms should I push back on?',
        context: 'I am purchasing software for my company and want to negotiate better terms'
      }
    }

    const scenario_data = demoScenarios[scenario as keyof typeof demoScenarios]
    
    if (!scenario_data) {
      return res.status(404).json({
        success: false,
        error: 'Demo scenario not found',
        availableScenarios: Object.keys(demoScenarios)
      })
    }

    // Use demo response instead of actual AI
    const demoResult = getDemoAnalysisResponse(scenario_data.contractText, scenario_data.userGoal)

    res.json({
      success: true,
      message: `Demo scenario: ${scenario}`,
      data: {
        scenario: scenario_data,
        analysis: demoResult.result
      },
      metadata: {
        timestamp: new Date().toISOString(),
        agent: 'Demo Mode',
        note: 'Configure IBM Granite AI for real analysis'
      }
    })

  } catch (error) {
    console.error('❌ Demo Scenario Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to load demo scenario',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}))

// Clear session memory
router.delete('/session/:sessionId', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { sessionId } = req.params
    const agent = getContractAgent()

    if (agent) {
      await agent.clearSession(sessionId)
    }

    res.json({
      success: true,
      message: 'Session cleared successfully'
    })

  } catch (error) {
    console.error('❌ Clear Session Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to clear session'
    })
  }
}))

export default router 