import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import winston from 'winston'

// Route imports
import authRoutes from './routes/auth'
import uploadRoutes from './routes/upload'
import analysisRoutes from './routes/analysis'
import userRoutes from './routes/user'
import langchainRoutes from './routes/langchain'
import complianceRoutes from './routes/compliance'
import contractAgentRoutes from './routes/contractAgent'
import agentUploadRoutes from './routes/agentUpload'
import feedbackRoutes from './routes/feedback'

// Middleware imports
import { errorHandler } from './middleware/errorHandler'
import { clerkMiddleware } from './middleware/auth'

// Shared data store
import { uploadHistory } from './shared/dataStore'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 7777

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'clauseguard-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

// Middleware
app.use(helmet())
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true
}))

// Apply JSON parsing ONLY to non-upload routes
app.use('/api/auth', express.json({ limit: '10mb' }))
app.use('/api/analysis', express.json({ limit: '10mb' }))
app.use('/api/user', express.json({ limit: '10mb' }))
app.use('/api/langchain', express.json({ limit: '10mb' }))
app.use('/api/agent', express.json({ limit: '10mb' }))
app.use('/api/compliance', express.json({ limit: '10mb' }))

// URL encoded for form data (but not for file uploads)
app.use((req, res, next) => {
  if (!req.path.includes('/api/upload')) {
    express.urlencoded({ extended: true, limit: '10mb' })(req, res, next)
  } else {
    next()
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Mock dashboard stats endpoint
app.get('/api/user/dashboard/stats', (req, res) => {
  res.json({
    totalUploads: uploadHistory.length,
    riskyClauses: uploadHistory.filter(u => u.analysis?.overallRisk === 'risky').length,
    safeClauses: uploadHistory.filter(u => u.analysis?.overallRisk === 'safe').length,
    tokensUsed: uploadHistory.reduce((sum, u) => sum + (u.analysis?.tokensUsed || 0), 0),
    tokensLimit: 10000
  })
})

// Mock user profile endpoint
app.get('/api/user/profile', (req, res) => {
  res.json({
    id: 'test-user',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    usage: {
      tokensUsed: uploadHistory.reduce((sum, u) => sum + (u.analysis?.tokensUsed || 0), 0),
      tokensLimit: 10000,
      totalUploads: uploadHistory.length
    }
  })
})

// LangChain routes (before auth middleware for testing)
app.use('/api/langchain', langchainRoutes)

// Contract Agent routes (before auth middleware for testing)
app.use('/api/agent', contractAgentRoutes)

// Public compliance routes
app.use('/api/compliance', complianceRoutes)

// Clerk authentication middleware (temporarily skip for upload testing)
app.use((req, res, next) => {
  // Skip all auth for upload routes during testing
  if (req.path.startsWith('/api/upload')) {
    req.userId = 'test-user' // Mock user ID for testing
    return next()
  }
  
  // Skip auth for other testing routes
  if (req.path === '/health' || req.path.startsWith('/api/langchain') || req.path.startsWith('/api/agent') || req.path.startsWith('/api/compliance')) {
    return next()
  }
  
  // For all other routes, apply normal auth (but they might fail due to no MongoDB)
  return clerkMiddleware(req, res, next)
})

// Protected API routes
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/agent/upload', agentUploadRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/user', userRoutes)
app.use('/api/contractAgent', contractAgentRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
const startServer = async () => {
  try {
    // Skip MongoDB for testing
    console.log('Skipping MongoDB connection for testing')
    
    app.listen(PORT, () => {
      logger.info(`ClauseGuard API server running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  mongoose.connection.close().then(() => {
    logger.info('MongoDB connection closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  mongoose.connection.close().then(() => {
    logger.info('MongoDB connection closed')
    process.exit(0)
  })
})

startServer()

export default app 