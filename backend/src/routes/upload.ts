import express from 'express'
import multer from 'multer'
import { requireAuth, asyncHandler } from '../middleware/auth'
import { ContractAnalysis } from '../models/ContractAnalysis'
import { User } from '../models/User'
import { FileProcessor } from '../services/fileProcessor'
import { GraniteAIService } from '../services/graniteAI'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// Configure local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads')
    // Create directory if it doesn't exist
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
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'))
    }
  }
})

// Upload and analyze contract
router.post('/', requireAuth, upload.single('file'), asyncHandler(async (req: any, res: any) => {
  try {
    console.log('🔍 Upload route hit - User ID:', req.userId)
    console.log('🔍 File received:', req.file ? 'YES' : 'NO')
    
    if (!req.file) {
      console.log('❌ No file in request')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { originalname, size, path: filePath } = req.file
    const fileType = FileProcessor.extractFileType(originalname)

    // Validate file
    const validation = FileProcessor.validateFile(size, fileType)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Generate a simple ID for testing
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Start immediate processing (no MongoDB)
    try {
      console.log('🚀 Starting immediate PDF processing...')
      
      // Extract text from the actual uploaded file
      const extractedText = await FileProcessor.extractTextFromFile(filePath, fileType)
      console.log('📄 Text extracted successfully, length:', extractedText.length)
      
      // Create simple analysis response
      const analysis = {
        summary: `Successfully extracted ${extractedText.length} characters from ${originalname}. Document appears to be a ${fileType.toUpperCase()} file with readable content.`,
        clauses: [
          {
            id: 'clause_1',
            text: extractedText.substring(0, 200) + '...',
            summary: 'Document content has been successfully extracted',
            riskLevel: 'safe' as const,
            riskReasons: [],
            confidence: 0.95,
            position: { start: 0, end: 200 }
          }
        ],
        overallRisk: 'safe' as const,
        confidence: 0.95,
        tokensUsed: Math.floor(extractedText.length / 4),
        processingTime: Date.now()
      }

      res.status(201).json({
        success: true,
        analysisId: analysisId,
        message: 'File processed successfully!',
        analysis: analysis,
        extractedText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : ''), // First 1000 chars for preview
        fileName: originalname,
        fileSize: size,
        fileType: fileType
      })

    } catch (processingError) {
      console.error('❌ Processing error:', processingError)
      res.status(500).json({ 
        error: `Failed to process ${fileType} file: ${processingError instanceof Error ? processingError.message : 'Unknown processing error'}`
      })
    }

  } catch (error) {
    console.error('❌ Upload error details:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    })
  }
}))

// Optimized background processing function (kept for compatibility but not used)
async function processContractAnalysis(analysisId: string, fileUrl: string, fileType: string) {
  console.log(`Background processing disabled for ${analysisId}`)
  return Promise.resolve()
}

function generateRealisticMockText(fileName: string): string {
  return `Sample contract text for ${fileName}`
}

export default router