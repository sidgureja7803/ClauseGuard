import express from 'express'
import { ContractAIAgent, ContractAgentInput } from '../services/contractAgent'
import { requireAuth, asyncHandler } from '../middleware/auth'
import { ContractAnalysis } from '../models/ContractAnalysis'
import { User } from '../models/User'

const router = express.Router()
const contractAgent = new ContractAIAgent()

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

    // Check user token limits
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
    const result = await contractAgent.analyzeContract(agentInput)

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

    console.log('💬 Contract Agent: Continuing conversation...')
    console.log(`🗣️ Follow-up: ${followUpQuestion}`)
    console.log(`📝 Session: ${sessionId}`)

    // Continue the conversation
    const result = await contractAgent.continueConversation(sessionId, followUpQuestion)

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
          Licensor grants Licensee a non-exclusive, non-transferable license to use the Software.
          
          2. PAYMENT TERMS
          License fees are due within 90 days of invoice date. Late payments subject to 5% monthly penalty.
          
          3. SUPPORT AND MAINTENANCE  
          Support is provided during business hours Monday-Friday. Response time is best effort basis.
          
          4. WARRANTIES
          SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
          
          5. LIMITATION OF LIABILITY
          LICENSOR'S LIABILITY SHALL NOT EXCEED THE AMOUNT PAID FOR THE SOFTWARE.
        `,
        userGoal: 'Help me prepare for contract negotiations to get better terms',
        context: 'I am about to negotiate this software license and want to identify areas where I can push for improvements'
      }
    }

    const demo = demoScenarios[scenario as keyof typeof demoScenarios]
    
    if (!demo) {
      return res.status(404).json({
        success: false,
        error: 'Demo scenario not found',
        availableScenarios: Object.keys(demoScenarios)
      })
    }

    console.log(`🎭 Demo Agent: Running ${scenario} scenario...`)

    const agentInput: ContractAgentInput = {
      contractText: demo.contractText.trim(),
      userGoal: demo.userGoal,
      context: demo.context,
      priority: 'thoroughness',
      sessionId: `demo_${scenario}_${Date.now()}`
    }

    const result = await contractAgent.analyzeContract(agentInput)

    res.json({
      success: true,
      message: `Demo scenario '${scenario}' completed`,
      data: {
        scenario,
        demoInput: demo,
        analysis: result.result,
        agentSteps: result.agentSteps,
        processingTime: result.processingTime
      },
      metadata: {
        demo: true,
        scenario,
        agent: 'ContractAIAgent',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Demo Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Demo scenario failed',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}))

// Get available demo scenarios
router.get('/demo', (req, res) => {
  res.json({
    success: true,
    message: 'Available demo scenarios',
    scenarios: [
      {
        id: 'risk-analysis',
        name: 'Risk Analysis',
        description: 'Comprehensive risk assessment of a consulting agreement',
        userGoal: 'Identify and understand contract risks'
      },
      {
        id: 'compliance-check', 
        name: 'GDPR Compliance Check',
        description: 'Verify GDPR compliance in a data processing agreement',
        userGoal: 'Ensure regulatory compliance'
      },
      {
        id: 'negotiation-prep',
        name: 'Negotiation Preparation',
        description: 'Prepare for contract negotiations with improvement suggestions',
        userGoal: 'Get better contract terms'
      }
    ]
  })
})

// Clear agent session memory
router.delete('/session/:sessionId', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { sessionId } = req.params
    
    await contractAgent.clearSession(sessionId)
    
    console.log(`🧹 Contract Agent: Cleared session ${sessionId}`)
    
    res.json({
      success: true,
      message: `Agent session ${sessionId} cleared successfully`
    })
  } catch (error) {
    console.error('❌ Session Clear Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to clear agent session'
    })
  }
}))

export default router 