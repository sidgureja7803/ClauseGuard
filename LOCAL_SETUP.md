# 🚀 ClauseGuard - Local Development Setup

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)

## 🔧 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 2. Environment Configuration

#### Backend Environment
```bash
# Copy template and edit
cp backend/env.template backend/.env
```

**Edit `backend/.env`:**
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/clauseguard

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Skip MongoDB for testing (recommended for local dev)
SKIP_MONGODB=true

# Security
JWT_SECRET=your_super_secure_jwt_secret_min_32_characters_long

# Optional: Add when ready to test full features
# IBM_GRANITE_API_KEY=your_ibm_granite_api_key
# CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
# CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Frontend Environment
```bash
# Copy template and edit
cp frontend/env.template frontend/.env
```

**Edit `frontend/.env`:**
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWFyeS1ncml6emx5LTg2LmNsZXJrLmFjY291bnRzLmRldiQ

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Environment
VITE_NODE_ENV=development
```

## 🎯 Running Locally

### Option 1: Run Both Services (Recommended)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option 2: Single Command (if available)
```bash
# From root directory
npm run dev
```

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🧪 Testing the Setup

### 1. Frontend Test
- Navigate to http://localhost:3000
- You should see the beautiful ClauseGuard landing page
- Test navigation to sign-in and sign-up pages

### 2. Backend Test
- Visit http://localhost:3001/api/health
- Should return `{"status": "ok", "message": "ClauseGuard API is running"}`

### 3. Authentication Test
- Try signing up/signing in (requires Clerk configuration)
- Basic UI navigation should work without full auth setup

## 🔑 Optional: Full Feature Setup

### 1. Clerk Authentication
1. Go to https://clerk.com and create account
2. Create new application
3. Copy publishable key to `frontend/.env`
4. Copy secret key to `backend/.env`

### 2. IBM Granite AI
1. Sign up for IBM Watson Studio
2. Get API key and add to `backend/.env`
3. Configure AI agent features

### 3. MongoDB (for persistence)
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `backend/.env`
3. Set `SKIP_MONGODB=false`

### 4. Cloudinary (for file uploads)
1. Create Cloudinary account
2. Get cloud name, API key, and secret
3. Add to `backend/.env`

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Same for frontend/backend
cd frontend && rm -rf node_modules package-lock.json && npm install
cd ../backend && rm -rf node_modules package-lock.json && npm install
```

#### TypeScript Errors
```bash
# Frontend build check
cd frontend && npm run build

# Backend build check
cd backend && npm run build
```

## 📱 Development Features Available

### ✅ Working Locally (without external services)
- Beautiful landing page with animations
- Professional sign-in/sign-up UI
- Navigation and routing
- UI components and styling
- Basic API structure

### 🔐 With Clerk Setup
- User authentication
- Protected routes
- User management
- Dashboard access

### 🤖 With IBM Granite AI
- Contract analysis
- AI agent capabilities
- Risk detection
- Smart recommendations

### 📄 With Full Setup
- File uploads
- Contract storage
- Analysis history
- All premium features

## 🎨 Development Notes

- **Hot reload** enabled for both frontend and backend
- **TypeScript** support with error checking
- **Beautiful UI** with Tailwind CSS and animations
- **Modern React** with hooks and components
- **Express.js** backend with proper structure

## 🔜 Next Steps

1. **Test locally** - Verify basic functionality
2. **Add services** - Configure Clerk, IBM AI, etc. as needed
3. **Deploy** - Use deployment guide for production

---

**🎉 You're ready to develop ClauseGuard locally!** 