import express from 'express'
import { LangChainContractAgent } from '../services/langchainAgent'

const router = express.Router()

// Skip auth for testing - in production, you'd protect these routes
router.use((req, res, next) => {
  console.log(`🔓 LangChain Route: ${req.method} ${req.path} - Bypassing auth for testing`)
  next()
})

// Initialize LangChain agent
const langchainAgent = new LangChainContractAgent()

// Test route for LangChain agent workflows
router.post('/test', async (req, res) => {
  try {
    const { contractText, sessionId } = req.body

    if (!contractText) {
      return res.status(400).json({
        success: false,
        error: 'Contract text is required'
      })
    }

    console.log('🤖 LangChain Agent: Starting contract analysis...')
    console.log(`📄 Contract length: ${contractText.length} characters`)

    // Perform full contract analysis using LangChain agent
    const analysisResult = await langchainAgent.analyzeContract({
      contractText,
      sessionId: sessionId || `test_${Date.now()}`
    })

    console.log('✅ LangChain Agent: Analysis completed')
    console.log(`🎯 Overall Risk: ${analysisResult.overallRisk}`)
    console.log(`📊 Clauses Found: ${analysisResult.clauses.length}`)
    console.log(`💡 Recommendations: ${analysisResult.recommendations.length}`)

    res.json({
      success: true,
      message: 'LangChain contract analysis completed successfully',
      data: analysisResult,
      metadata: {
        agent: 'LangChain + IBM Granite',
        timestamp: new Date().toISOString(),
        tokensUsed: analysisResult.tokensUsed
      }
    })

  } catch (error) {
    console.error('❌ LangChain Agent Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze contract with LangChain agent',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

// Test individual LangChain tools
router.post('/test-tools', async (req, res) => {
  try {
    const { clauseText, toolName } = req.body

    if (!clauseText || !toolName) {
      return res.status(400).json({
        success: false,
        error: 'clauseText and toolName are required'
      })
    }

    console.log(`🛠️ LangChain Tool Test: ${toolName}`)

    let result: string

    switch (toolName) {
      case 'summarize':
        result = await langchainAgent.summarizeClause(clauseText)
        break
      case 'analyze_risk':
        result = await langchainAgent.analyzeRisk(clauseText)
        break
      case 'rewrite':
        result = await langchainAgent.rewriteClause(clauseText)
        break
      case 'store':
        result = await langchainAgent.storeAnalysis(JSON.stringify({ 
          clause: clauseText, 
          timestamp: new Date().toISOString() 
        }))
        break
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid tool name. Use: summarize, analyze_risk, rewrite, or store'
        })
    }

    console.log(`✅ Tool ${toolName} completed successfully`)

    res.json({
      success: true,
      message: `LangChain tool '${toolName}' executed successfully`,
      data: {
        tool: toolName,
        input: clauseText,
        output: result
      },
      metadata: {
        agent: 'LangChain + IBM Granite',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error(`❌ LangChain Tool Error (${req.body.toolName}):`, error)
    
    res.status(500).json({
      success: false,
      error: `Failed to execute LangChain tool: ${req.body.toolName}`,
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

// Demo route with sample contract
router.get('/demo', async (req, res) => {
  try {
    console.log('🎯 LangChain Demo: Running sample contract analysis...')

    const sampleContract = `
      SOFTWARE LICENSE AGREEMENT
      
      1. GRANT OF LICENSE
      Licensor hereby grants to Licensee a non-exclusive, non-transferable license to use the Software.
      
      2. LIABILITY
      IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, 
      INCLUDING WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, BUSINESS INTERRUPTION, LOSS OF DATA, 
      OR ANY OTHER COMMERCIAL DAMAGES OR LOSSES, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY.
      
      3. TERMINATION
      This Agreement may be terminated by either party with 30 days written notice. Upon termination, 
      Licensee must destroy all copies of the Software.
      
      4. PAYMENT TERMS
      Licensee agrees to pay all fees within 90 days of invoice date. Late payments will incur a 2% 
      monthly penalty fee.
      
      5. INDEMNIFICATION
      Licensee agrees to indemnify and hold harmless Licensor from any claims arising from Licensee's 
      use of the Software, including unlimited liability for damages.
    `

    const analysisResult = await langchainAgent.analyzeContract({
      contractText: sampleContract,
      sessionId: 'demo_session'
    })

    console.log('✅ LangChain Demo: Analysis completed successfully')

    res.json({
      success: true,
      message: 'LangChain demo analysis completed',
      data: {
        sampleContract,
        analysis: analysisResult
      },
      metadata: {
        agent: 'LangChain + IBM Granite',
        demo: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ LangChain Demo Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to run LangChain demo',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

// Clear agent memory for a session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    
    await langchainAgent.clearHistory(sessionId)
    
    console.log(`🧹 LangChain: Cleared session history for ${sessionId}`)
    
    res.json({
      success: true,
      message: `Session history cleared for ${sessionId}`
    })
  } catch (error) {
    console.error('❌ LangChain Session Clear Error:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to clear session history'
    })
  }
})

export default router 