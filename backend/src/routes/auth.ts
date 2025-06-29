import express from 'express'
import { User } from '../models/User'

const router = express.Router()

// Clerk webhook for user events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
  try {
    const event = req.body
    
    // In production, verify the webhook signature
    // const signature = req.headers['svix-signature']
    // Verify signature with Clerk webhook secret
    
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data)
        break
      case 'user.updated':
        await handleUserUpdated(event.data)
        break
      case 'user.deleted':
        await handleUserDeleted(event.data)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

async function handleUserCreated(userData: any) {
  try {
    const existingUser = await User.findOne({ clerkId: userData.id })
    if (existingUser) {
      return // User already exists
    }

    const user = new User({
      clerkId: userData.id,
      email: userData.email_addresses[0]?.email_address,
      name: userData.first_name + ' ' + userData.last_name,
      imageUrl: userData.image_url
    })

    await user.save()
    console.log(`User created: ${userData.id}`)
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const user = await User.findOne({ clerkId: userData.id })
    if (!user) {
      // Create user if doesn't exist
      await handleUserCreated(userData)
      return
    }

    // Update user data
    user.name = userData.first_name + ' ' + userData.last_name || user.name
    user.email = userData.email_addresses[0]?.email_address || user.email
    user.imageUrl = userData.image_url || user.imageUrl

    await user.save()
    console.log(`User updated: ${userData.id}`)
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

async function handleUserDeleted(userData: any) {
  try {
    // Soft delete user or mark as deleted
    const user = await User.findOne({ clerkId: userData.id })
    if (user) {
      // For GDPR compliance, you might want to anonymize instead of delete
      await User.deleteOne({ clerkId: userData.id })
      console.log(`User deleted: ${userData.id}`)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

// Health check for auth service
router.get('/health', (req: any, res: any) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'auth',
    timestamp: new Date().toISOString()
  })
})

export default router 