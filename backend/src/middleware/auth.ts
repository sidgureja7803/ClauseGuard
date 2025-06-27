import { Request, Response, NextFunction } from 'express'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { User } from '../models/User'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      user?: any
    }
  }
}

export const clerkMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip auth for health check and public routes
    if (req.path === '/health' || req.path.startsWith('/api/auth/webhook')) {
      return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.split(' ')[1]
    
    try {
      const payload = await clerkClient.verifyToken(token)
      req.userId = payload.sub

      // Get or create user in our database
      let user = await User.findOne({ clerkId: payload.sub })
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(payload.sub)
        user = new User({
          clerkId: payload.sub,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl
        })
        await user.save()
      }

      req.user = user
      next()
    } catch (error) {
      console.error('Token verification failed:', error)
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
} 