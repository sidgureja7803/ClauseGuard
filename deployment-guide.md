# ClauseGuard Deployment Guide

This guide covers deploying ClauseGuard to production environments.

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Clerk account (for authentication)
- IBM Granite API access
- Cloudinary account (for file storage)
- Vercel account (for frontend)
- Railway/Render/DigitalOcean account (for backend)

## Environment Setup

### 1. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Whitelist your IP addresses
4. Get your connection string

### 2. Authentication Setup (Clerk)

1. Create a Clerk application
2. Configure OAuth providers (Google, GitHub)
3. Set up webhooks for user events
4. Get your publishable and secret keys

### 3. AI Service Setup (IBM Granite)

1. Sign up for IBM Granite access
2. Get your API key
3. Note the base URL for your region

### 4. File Storage Setup (Cloudinary)

1. Create a Cloudinary account
2. Get your cloud name, API key, and secret
3. Configure upload presets

## Frontend Deployment (Vercel)

### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login and connect project
vercel login
vercel --cwd frontend
```

### 2. Environment Variables

Set these in Vercel dashboard:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://your-backend.railway.app/api
```

### 3. Build Configuration

Vercel will automatically detect the Vite configuration.

## Backend Deployment (Railway)

### 1. Connect Repository

1. Go to Railway.app
2. Connect your GitHub repository
3. Select the backend folder

### 2. Environment Variables

Set these in Railway dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_test_...
IBM_GRANITE_API_KEY=your_key
IBM_GRANITE_BASE_URL=https://api.granite.ibm.com/v1
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3001
```

### 3. Build Configuration

Railway will use your package.json scripts automatically.

## Alternative Backend Deployment (Render)

### 1. Connect Repository

1. Go to Render.com
2. Connect your GitHub repository
3. Create a new Web Service

### 2. Configuration

```
Build Command: npm run build
Start Command: npm start
Environment: Node.js
```

### 3. Environment Variables

Same as Railway configuration above.

## Alternative Backend Deployment (DigitalOcean App Platform)

### 1. Create App

1. Go to DigitalOcean App Platform
2. Connect your repository
3. Select backend folder

### 2. App Spec

```yaml
name: clauseguard-backend
services:
- name: api
  source_dir: backend
  github:
    repo: your-username/clauseguard
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: your_mongodb_uri
```

## Docker Deployment

### 1. Build Images

```bash
# Build backend
docker build -t clauseguard-backend ./backend

# Build frontend (create Dockerfile for frontend)
docker build -t clauseguard-frontend ./frontend
```

### 2. Run with Docker Compose

```bash
# Use the provided docker-compose.yml
docker-compose up -d
```

## Post-Deployment Setup

### 1. Configure Clerk Webhooks

Set webhook URL to: `https://your-backend.railway.app/api/auth/webhook`

### 2. Test the Application

1. Visit your frontend URL
2. Sign up with a test account
3. Upload a test contract
4. Verify AI analysis works

### 3. Monitor Logs

- Check Vercel function logs
- Check Railway/Render application logs
- Monitor MongoDB Atlas metrics

## Production Considerations

### Security

- Enable CORS properly
- Use HTTPS everywhere
- Implement rate limiting
- Set up proper monitoring

### Performance

- Enable CDN for static assets
- Implement Redis caching
- Optimize database queries
- Use database indexes

### Monitoring

- Set up uptime monitoring
- Configure error tracking (Sentry)
- Monitor API usage and costs
- Set up log aggregation

### Backup

- Enable MongoDB Atlas backups
- Backup Cloudinary assets
- Version control all configurations

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check FRONTEND_URL environment variable
2. **Auth Failures**: Verify Clerk keys and webhook URL
3. **File Upload Issues**: Check Cloudinary configuration
4. **AI Analysis Failures**: Verify IBM Granite API key and quotas

### Debug Commands

```bash
# Check backend health
curl https://your-backend.railway.app/health

# Check MongoDB connection
mongosh "your_mongodb_uri"

# View application logs
railway logs # or render logs, vercel logs
```

## Scaling

### Horizontal Scaling

- Use multiple backend instances
- Implement load balancing
- Use database read replicas

### Vertical Scaling

- Upgrade instance sizes
- Increase memory limits
- Optimize resource allocation

## Cost Optimization

1. Monitor usage metrics
2. Implement request caching
3. Optimize file storage
4. Use appropriate instance sizes
5. Set up budget alerts 