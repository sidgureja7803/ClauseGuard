# 🚀 ClauseGuard AI Agent - Deployment Guide

## 📋 **Issues Fixed & Files Status**

### ✅ **Fixed Issues**
1. **OnboardingTooltips Props Error**: Fixed missing `isActive`, `onComplete`, `onSkip` props
2. **TypeScript Compilation Errors**: Removed unused imports and variables in LandingPage.tsx
3. **Missing Dependencies**: Verified all LangChain dependencies are installed
4. **Image Assets**: Confirmed logo.png and background.png exist in public folder

### ✅ **Complete File Structure**
```
ClauseGuard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx ✅
│   │   │   └── ui/
│   │   │       ├── AnalyticsDashboard.tsx ✅
│   │   │       ├── AnimatedCounter.tsx ✅
│   │   │       ├── Button.tsx ✅
│   │   │       ├── Card.tsx ✅
│   │   │       ├── ClauseLibrary.tsx ✅
│   │   │       ├── ContractChatAgent.tsx ✅
│   │   │       ├── FloatingCTA.tsx ✅
│   │   │       ├── GradientText.tsx ✅
│   │   │       ├── HowItWorksModal.tsx ✅
│   │   │       ├── IBMBadge.tsx ✅
│   │   │       ├── LoadingSpinner.tsx ✅
│   │   │       ├── OnboardingTooltips.tsx ✅
│   │   │       └── SampleContractDemo.tsx ✅
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx ✅
│   │   │   ├── History.tsx ✅
│   │   │   ├── LandingPage.tsx ✅ (Fixed)
│   │   │   ├── Settings.tsx ✅
│   │   │   ├── SignInPage.tsx ✅
│   │   │   ├── SignUpPage.tsx ✅
│   │   │   └── Upload.tsx ✅
│   │   ├── types/index.ts ✅
│   │   └── lib/utils.ts ✅
│   └── public/
│       ├── logo.png ✅
│       └── background.png ✅
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── contractAgent.ts ✅ (New AI Agent)
│   │   │   ├── langchainAgent.ts ✅
│   │   │   ├── graniteAI.ts ✅
│   │   │   └── fileProcessor.ts ✅
│   │   ├── routes/
│   │   │   ├── contractAgent.ts ✅ (New Agent API)
│   │   │   ├── langchain.ts ✅
│   │   │   ├── compliance.ts ✅
│   │   │   ├── analysis.ts ✅
│   │   │   ├── auth.ts ✅
│   │   │   ├── upload.ts ✅
│   │   │   └── user.ts ✅
│   │   ├── models/
│   │   │   ├── ContractAnalysis.ts ✅
│   │   │   └── User.ts ✅
│   │   └── server.ts ✅ (Updated with Agent routes)
│   └── package.json ✅ (All dependencies installed)
└── docker-compose.yml ✅
```

---

## 🛠️ **Pre-Deployment Setup**

### **1. Environment Variables**

Create these environment files:

#### **Backend (.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/clauseguard
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/clauseguard

# IBM Granite AI
IBM_GRANITE_API_KEY=your_ibm_granite_api_key
IBM_GRANITE_BASE_URL=https://us-south.ml.cloud.ibm.com/ml/v1

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# App Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app

# Security
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
```

#### **Frontend (.env)**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
VITE_API_URL=https://your-backend-api.com/api
VITE_NODE_ENV=production
```

### **2. Install Dependencies**

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

---

## 🐳 **Docker Deployment (Recommended)**

### **1. Build and Run with Docker Compose**
```bash
# From project root
docker-compose up --build -d
```

### **2. Docker Compose Configuration** (Already exists)
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: clauseguard

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - IBM_GRANITE_API_KEY=${IBM_GRANITE_API_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  mongodb_data:
```

---

## 🆘 **Troubleshooting**

### **Common Issues**
1. **MongoDB Connection**: Check connection string and network access
2. **IBM Granite API**: Verify API key and endpoint URL
3. **Clerk Auth**: Ensure public/secret keys match frontend/backend
4. **CORS Errors**: Check FRONTEND_URL in backend environment
5. **Build Errors**: Remove unused imports, fix TypeScript errors

### **Debug Commands**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Database connection
mongo "mongodb://localhost:27017/clauseguard"

# Test AI endpoint
curl -X POST http://localhost:3001/api/agent/demo/risk-analysis
```

---

## ✅ **Deployment Checklist**

- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database connected
- [ ] IBM Granite AI API working
- [ ] Clerk authentication setup
- [ ] File upload (Cloudinary) working
- [ ] SSL certificates installed (production)
- [ ] Domain DNS configured
- [ ] Health checks passing
- [ ] AI Agent endpoints tested
- [ ] Frontend build successful
- [ ] Error monitoring setup

---

Your ClauseGuard AI Agent is now ready for production! 🎉

The platform now features true autonomous AI capabilities with multi-step reasoning, dynamic planning, and intelligent tool orchestration - all powered by IBM Granite models. 

## 🚀 Vercel Deployment Steps

### Step 1: Prepare Your Repository
```bash
# Ensure your code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Configure Vercel Environment Variables
In your Vercel dashboard, add these environment variables:

**Environment Variables:**
- `VITE_CLERK_PUBLISHABLE_KEY` = `pk_live_your_actual_clerk_key`
- `VITE_API_URL` = `https://your-backend-url.com/api`
- `VITE_NODE_ENV` = `production`

### Step 3: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Alternative: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## 🔧 Backend Deployment (Railway/Render/Digital Ocean)

### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Option 2: Render
1. Connect GitHub repository
2. Choose "Web Service"
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables

### Option 3: Digital Ocean App Platform
1. Create new app from GitHub
2. Configure build settings:
   - Source: `backend/`
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
3. Add environment variables

## 📊 **AI Agent Features Deployed**

### **✅ Available Endpoints**
- `POST /api/agent/analyze` - Main agentic analysis
- `POST /api/agent/continue` - Multi-turn conversations  
- `GET /api/agent/demo/:scenario` - Demo scenarios
- `DELETE /api/agent/session/:id` - Clear agent memory

### **✅ Agent Capabilities**
- Intent classification and goal understanding
- Dynamic planning and task decomposition
- Multi-step reasoning with 8+ specialized tools
- Legal knowledge retrieval and application
- Self-correction and result refinement
- Conversation memory and context awareness

### **✅ IBM Granite Model Integration**
- **Granite 8B Instruct**: Planning, intent classification, risk analysis
- **Granite Code**: Clause rewriting, legal drafting
- **Vector Database**: Legal knowledge storage and retrieval

## 📊 Monitoring & Analytics

### Health Checks
```bash
# Backend health
curl https://your-backend.com/health

# Frontend health
curl https://your-app.vercel.app
```

### Logging
- Enable structured logging in production
- Monitor API response times
- Track error rates
- Set up alerts for critical issues

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

If you encounter deployment issues:
1. Check the logs in Vercel dashboard
2. Verify all environment variables
3. Test API endpoints individually
4. Check network connectivity

**Quick Fix for Vercel Error:**
The error you're seeing means Vercel can't find the environment variable. Set these in your Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add: `VITE_CLERK_PUBLISHABLE_KEY` with your actual Clerk key
- Redeploy 