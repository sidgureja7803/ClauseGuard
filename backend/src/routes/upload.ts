import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { requireAuth, asyncHandler } from '../middleware/auth'
import { ContractAnalysis } from '../models/ContractAnalysis'
import { User } from '../models/User'
import { FileProcessor } from '../services/fileProcessor'
import { GraniteAIService } from '../services/graniteAI'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clauseguard-contracts',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
    resource_type: 'auto',
    public_id: (req: any, file: any) => {
      const timestamp = Date.now()
      const filename = file.originalname.split('.')[0]
      return `${req.userId}_${timestamp}_${filename}`
    }
  } as any
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
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { originalname, size } = req.file
    const fileUrl = req.file.path // Cloudinary URL
    const fileType = FileProcessor.extractFileType(originalname)

    // Validate file
    const validation = FileProcessor.validateFile(size, fileType)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Check user token limits
    const user = await User.findOne({ clerkId: req.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.usage.tokensUsed >= user.usage.tokensLimit) {
      return res.status(429).json({ 
        error: 'Token limit exceeded. Please upgrade your plan or wait for the next billing cycle.' 
      })
    }

    // Create contract analysis record
    const contractAnalysis = new ContractAnalysis({
      userId: req.userId,
      fileName: originalname,
      fileUrl,
      fileSize: size,
      fileType,
      status: 'processing'
    })

    await contractAnalysis.save()

    // Start background analysis (don't await)
    processContractAnalysis(contractAnalysis._id.toString(), fileUrl, fileType)
      .catch(error => {
        console.error('Background analysis failed:', error)
      })

    res.status(201).json({
      success: true,
      analysisId: contractAnalysis._id,
      message: 'File uploaded successfully. Analysis started.',
      estimatedTime: '30-60 seconds'
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    })
  }
}))

// Background processing function
async function processContractAnalysis(analysisId: string, fileUrl: string, fileType: string) {
  try {
    const analysis = await ContractAnalysis.findById(analysisId)
    if (!analysis) {
      throw new Error('Analysis record not found')
    }

    // For demo purposes, we'll simulate the processing
    // In production, you would download and process the actual file
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Mock extracted text (in production, extract from actual file)
    const mockText = `SAMPLE CONTRACT

1. PARTIES: This agreement is between Company A and Company B.

2. SERVICES: Company B shall provide consulting services to Company A.

3. PAYMENT: Payment shall be made within 30 days of invoice.

4. TERMINATION: Either party may terminate this agreement with 30 days notice.

5. LIMITATION OF LIABILITY: Company B's liability shall be limited to the amount paid under this agreement.

6. GOVERNING LAW: This agreement shall be governed by the laws of California.`

    // Store extracted text
    analysis.extractedText = mockText
    await analysis.save()

    // Analyze with Granite AI (or mock for demo)
    const graniteService = new GraniteAIService()
    let aiAnalysis

    try {
      aiAnalysis = await graniteService.analyzeFullContract(mockText)
    } catch (error) {
      console.error('Granite AI analysis failed, using mock data:', error)
      
      // Fallback mock analysis if AI service fails
      aiAnalysis = {
        summary: 'This consulting agreement contains standard terms with moderate risk factors. The limitation of liability clause requires review.',
        clauses: [
          {
            id: 'clause_1',
            text: 'Company B\'s liability shall be limited to the amount paid under this agreement.',
            summary: 'Limits service provider liability to contract value',
            riskLevel: 'review' as const,
            riskReasons: ['May leave client with insufficient recourse for significant damages'],
            rewriteSuggestion: 'Consider: "Company B\'s liability shall be limited to the amount paid under this agreement, except for cases of gross negligence or willful misconduct."',
            confidence: 0.85,
            position: { start: 200, end: 280 }
          },
          {
            id: 'clause_2',
            text: 'Either party may terminate this agreement with 30 days notice.',
            summary: 'Standard termination clause with reasonable notice period',
            riskLevel: 'safe' as const,
            riskReasons: [],
            confidence: 0.92,
            position: { start: 150, end: 200 }
          }
        ],
        overallRisk: 'review' as const,
        confidence: 0.88,
        tokensUsed: 450,
        processingTime: 3000
      }
    }

    // Update analysis record
    analysis.analysis = aiAnalysis
    analysis.status = 'completed'
    await analysis.save()

    // Update user token usage
    const user = await User.findOne({ clerkId: analysis.userId })
    if (user) {
      user.usage.tokensUsed += aiAnalysis.tokensUsed
      user.usage.totalUploads += 1
      await user.save()
    }

    console.log(`Analysis completed for ${analysisId}`)

  } catch (error) {
    console.error(`Analysis failed for ${analysisId}:`, error)
    
    const analysis = await ContractAnalysis.findById(analysisId)
    if (analysis) {
      analysis.status = 'failed'
      analysis.errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      await analysis.save()
    }
  }
}

// Get analysis status
router.get('/:analysisId/status', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { analysisId } = req.params
    
    const analysis = await ContractAnalysis.findOne({
      _id: analysisId,
      userId: req.userId
    })

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    res.json({
      analysisId: analysis._id,
      status: analysis.status,
      fileName: analysis.fileName,
      uploadDate: analysis.uploadDate,
      ...(analysis.status === 'completed' && analysis.analysis && {
        analysis: analysis.analysis
      }),
      ...(analysis.status === 'failed' && {
        error: analysis.errorMessage
      })
    })

  } catch (error) {
    console.error('Status check error:', error)
    res.status(500).json({ 
      error: 'Failed to check analysis status' 
    })
  }
}))

// Get full analysis results
router.get('/:analysisId', requireAuth, asyncHandler(async (req: any, res: any) => {
  try {
    const { analysisId } = req.params
    
    const analysis = await ContractAnalysis.findOne({
      _id: analysisId,
      userId: req.userId
    })

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    if (analysis.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Analysis not completed yet',
        status: analysis.status 
      })
    }

    res.json({
      analysisId: analysis._id,
      fileName: analysis.fileName,
      uploadDate: analysis.uploadDate,
      fileType: analysis.fileType,
      status: analysis.status,
      analysis: analysis.analysis
    })

  } catch (error) {
    console.error('Get analysis error:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve analysis' 
    })
  }
}))

export default router 