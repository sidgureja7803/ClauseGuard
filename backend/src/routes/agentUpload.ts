import express from 'express'
import multer from 'multer'
import { FileProcessor } from '../services/fileProcessor'
import { ContractAgentOrchestrator } from '../services/contractAgentOrchestrator'
import { addUpload } from '../shared/dataStore'
import { requireAuth, asyncHandler } from '../middleware/auth'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// Configure local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req: any, file, cb) {
    const timestamp = Date.now()
    const filename = file.originalname.split('.')[0]
    cb(null, `${req.userId}_${timestamp}_${filename}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'))
    }
  }
})

// Agent-powered upload and analysis
router.post('/', requireAuth, upload.single('file'), asyncHandler(async (req: any, res: any) => {
  try {
    console.log('🤖 Agent Upload: Starting agent-powered analysis...')
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { originalname, size, path: filePath } = req.file
    const fileType = FileProcessor.extractFileType(originalname)

    // Validate file
    const validation = FileProcessor.validateFile(size, fileType)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const analysisId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sessionId = `session_${req.userId}_${Date.now()}`

    // Extract text from uploaded file
    console.log('📄 Extracting text from file...')
    const extractedText = await FileProcessor.extractTextFromFile(filePath, fileType)
    
    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({ 
        error: 'Insufficient text content in file for analysis' 
      })
    }

    console.log(`✅ Text extracted: ${extractedText.length} characters`)

    // Initialize AI Agent Orchestrator
    console.log('🧠 Initializing ClauseGuard AI Agent...')
    const agentOrchestrator = new ContractAgentOrchestrator()

    // Execute agent-powered analysis
    console.log('🚀 Starting agent-orchestrated analysis...')
    const analysis = await agentOrchestrator.analyzeContractWithAgent({
      contractText: extractedText,
      userId: req.userId,
      sessionId,
      contractId: analysisId,
      fileName: originalname
    })

    console.log('✅ Agent analysis completed successfully')

    // Get audit trail for transparency
    const auditTrail = agentOrchestrator.getAuditTrail()

    // Store result
    addUpload({
      analysisId,
      fileName: originalname,
      fileSize: size,
      fileType,
      analysis: {
        ...analysis,
        agentAuditTrail: auditTrail
      },
      uploadDate: new Date().toISOString(),
      status: 'completed',
      userId: req.userId
    })

    res.status(201).json({
      success: true,
      analysisId,
      message: 'File analyzed successfully with AI Agent!',
      analysis: {
        ...analysis,
        agentAuditTrail: auditTrail
      },
      extractedText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : ''),
      fileName: originalname,
      fileSize: size,
      fileType,
      metadata: {
        agent: 'ClauseGuard AI Agent v2.0',
        stepsExecuted: auditTrail.length,
        processingTime: analysis.processingTime,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Agent upload error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Agent analysis failed' 
    })
  }
}))

export default router 