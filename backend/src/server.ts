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

// Middleware imports
import { errorHandler } from './middleware/errorHandler'
import { clerkMiddleware } from './middleware/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// LangChain routes (before auth middleware for testing)
app.use('/api/langchain', langchainRoutes)

// Contract Agent routes (before auth middleware for testing)
app.use('/api/agent', contractAgentRoutes)

// Public compliance routes
app.use('/api/compliance', complianceRoutes)

// Clerk authentication middleware
app.use(clerkMiddleware)

// Protected API routes
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/user', userRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is required')
    }

    await mongoose.connect(mongoURI)
    logger.info('MongoDB connected successfully')
  } catch (error) {
    logger.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}

// Start server
const startServer = async () => {
  try {
    // Temporarily skip MongoDB for LangChain testing
    if (process.env.SKIP_MONGODB !== 'true') {
      await connectDB()
    } else {
      logger.info('Skipping MongoDB connection for testing')
    }
    
    app.listen(PORT, () => {
      logger.info(`ClauseGuard API server running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`LangChain integration: Ready for testing!`)
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