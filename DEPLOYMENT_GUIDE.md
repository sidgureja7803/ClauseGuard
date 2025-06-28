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
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Security
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
```

#### **Frontend (.env)**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_BACKEND_URL=https://your-backend-domain.com
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
      - MONGODB_URI=mongodb://mongodb:27017/clauseguard
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

## ☁️ **Cloud Deployment Options**

### **Option 1: Vercel + Railway (Recommended)**

#### **Frontend (Vercel)**
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### **Backend (Railway)**
1. Connect GitHub repo to Railway
2. Add MongoDB service
3. Set environment variables
4. Deploy with automatic scaling

### **Option 2: AWS/Digital Ocean**

#### **Backend Deployment**
```bash
# On your server
git clone https://github.com/your-username/clauseguard.git
cd clauseguard/backend
npm install
npm run build
npm start
```

#### **Frontend Deployment**
```bash
cd ../frontend
npm install
npm run build
# Serve dist/ folder with nginx/apache
```

### **Option 3: Heroku**

#### **Backend (Heroku)**
```bash
cd backend
heroku create clauseguard-api
heroku addons:create mongolab:sandbox
heroku config:set IBM_GRANITE_API_KEY=your_key
heroku config:set CLERK_SECRET_KEY=your_secret
git push heroku main
```

#### **Frontend (Vercel/Netlify)**
- Connect repo and deploy

---

## 🔧 **Database Setup**

### **MongoDB Atlas (Cloud - Recommended)**
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Add to MONGODB_URI environment variable

### **Local MongoDB**
```bash
# Install MongoDB
brew install mongodb/brew/mongodb-community  # macOS
sudo apt-get install mongodb  # Ubuntu

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb  # Ubuntu

# Use connection string
MONGODB_URI=mongodb://localhost:27017/clauseguard
```

---

## 🧪 **Testing Deployment**

### **1. Health Checks**
```bash
# Backend health
curl https://your-backend-domain.com/health

# AI Agent demo
curl https://your-backend-domain.com/api/agent/demo

# LangChain demo
curl https://your-backend-domain.com/api/langchain/demo
```

### **2. Frontend Test**
- Visit https://your-frontend-domain.com
- Test signup/login
- Upload a contract
- Try AI Agent analysis

---

## 🚀 **Production Optimizations**

### **1. Security**
- Enable HTTPS/SSL certificates
- Use strong JWT secrets
- Implement rate limiting
- Add CORS restrictions
- Use helmet.js (already included)

### **2. Performance**
- Enable Redis for caching
- Use CDN for static assets
- Implement database indexing
- Add monitoring (DataDog, New Relic)

### **3. Monitoring & Logging**
```bash
# Add to package.json
npm install @datadog/browser-rum
npm install winston-datadog
```

---

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