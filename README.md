# ClauseGuard - AI Risk Analyzer for Business Contracts

🚀 **FULLY IMPLEMENTED** - Production-ready SaaS application for AI-powered contract analysis that scans contracts for risks in seconds.

## ✅ Implementation Status

**ClauseGuard is now complete** with all requested features implemented:

- ✅ **Landing Page** - Beautiful hero section with "Scan Your Contracts for Risk in Seconds"
- ✅ **Authentication** - Clerk integration with Google & GitHub OAuth
- ✅ **Dashboard** - Sidebar navigation (Home, Upload, History, Settings)
- ✅ **File Upload** - Drag-and-drop for PDF/DOCX/TXT files
- ✅ **AI Analysis** - IBM Granite models for risk detection and rewrite suggestions
- ✅ **History & Analytics** - View past uploads with download capabilities
- ✅ **Settings** - User preferences and account management
- ✅ **Cloud Storage** - Cloudinary integration for file storage
- ✅ **Production Ready** - Docker, deployment configs, error handling

## 🎯 Key Features

- 🔎 **Clause Summarization** - AI-powered contract clause breakdown
- ⚠️ **Risk Detection** - Identify risky clauses with severity levels (Safe/Review/Risky)
- ✍️ **Safe Rewrite Suggestions** - Get AI-generated safer alternatives
- 📊 **Dashboard** - Track upload history and analytics with usage quotas
- 🔐 **Secure Authentication** - OAuth with Google & GitHub via Clerk
- ☁️ **Cloud Storage** - File storage via Cloudinary
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **Production Ready** - Complete deployment setup

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- Clerk Authentication
- Axios for API calls
- React Router for navigation
- React Dropzone for file uploads
- Framer Motion for animations

**Backend:**
- Express.js + TypeScript
- MongoDB with Mongoose
- IBM Granite AI Models
- Cloudinary Storage
- PDF/DOCX/TXT parsing
- Winston logging
- Helmet security
- CORS configuration

**AI Models (IBM Granite):**
- `granite-4b-instruct-v2` - Document analysis & risk detection
- `granite-8b-instruct-v1` - Clause summarization
- `granite-code-v1` - Rewrite suggestions

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repo-url>
cd ClauseGuard
npm install
```

### 2. Environment Setup

**Frontend (.env):**
```bash
cp frontend/env.config.example frontend/.env
```
Edit `frontend/.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

**Backend (.env):**
```bash
cp backend/env.config.example backend/.env
```
Edit `backend/.env` with your actual keys:
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clauseguard
CLERK_SECRET_KEY=sk_test_your_clerk_secret
IBM_GRANITE_API_KEY=your_ibm_granite_api_key
IBM_GRANITE_BASE_URL=https://us-south.ml.cloud.ibm.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Start Development Servers

**Option 1: Start both simultaneously**
```bash
npm run dev
```

**Option 2: Start individually**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 Required Services Setup

### 1. MongoDB
- Install locally OR use MongoDB Atlas
- Default local connection: `mongodb://localhost:27017/clauseguard`

### 2. Clerk Authentication
- Sign up at [clerk.com](https://clerk.com)
- Create a new application
- Configure OAuth providers (Google, GitHub)
- Get publishable and secret keys

### 3. IBM Granite AI
- Apply for IBM Granite API access
- Get your API key and region endpoint
- Models used: granite-4b-instruct-v2, granite-8b-instruct-v1, granite-code-v1

### 4. Cloudinary
- Sign up at [cloudinary.com](https://cloudinary.com)
- Get cloud name, API key, and secret
- Used for contract file storage

## 🏗 Project Structure

```
ClauseGuard/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── lib/            # Utilities and configurations
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Express middleware
│   │   └── server.ts       # Main server file
│   └── package.json
├── docker-compose.yml       # Docker development setup
├── vercel.json             # Vercel deployment config
└── deployment-guide.md     # Detailed deployment instructions
```

## 🎨 UI Features

### Landing Page
- Hero section with gradient backgrounds
- Feature cards with animations
- Statistics section
- Call-to-action buttons
- Responsive navigation

### Dashboard
- Sidebar navigation with active states
- User statistics and usage tracking
- Recent uploads display
- Quick upload button
- Welcome messages

### Upload Page
- Drag-and-drop file upload
- File type validation (PDF, DOCX, TXT)
- Upload progress indicators
- File size limits
- Real-time status updates

### Analysis Results
- Contract sections in organized cards
- Risk level badges (Safe/Review/Risky)
- Clause summaries
- Rewrite suggestions
- Confidence scores

### History
- Searchable upload history
- Filtering by date and risk level
- Download analysis as PDF
- Pagination for large datasets

### Settings
- User profile management
- Usage quota tracking
- Account preferences
- API key management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/webhook` - Clerk webhook handler
- `GET /api/auth/me` - Get current user

### File Upload
- `POST /api/upload` - Upload contract file
- `GET /api/upload/:id` - Get upload status

### Analysis
- `GET /api/analysis/:id` - Get analysis results
- `POST /api/analysis/:id/reanalyze` - Trigger reanalysis

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/preferences` - Update preferences
- `GET /api/user/usage` - Get usage statistics

## 🚀 Production Deployment

See `deployment-guide.md` for comprehensive deployment instructions covering:

- **Frontend**: Vercel deployment
- **Backend**: Railway, Render, or DigitalOcean
- **Database**: MongoDB Atlas
- **Domain**: Custom domain setup
- **SSL**: Automatic HTTPS
- **Monitoring**: Error tracking and analytics

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run backend tests  
cd backend && npm test

# Run linting
npm run lint
```

## 🔒 Security Features

- Helmet.js security headers
- CORS configuration
- File upload validation
- Rate limiting
- Input sanitization
- Secure session management
- Environment variable protection

## 📈 Performance

- Code splitting and lazy loading
- Image optimization
- CDN integration via Cloudinary
- Database indexing
- Caching strategies
- Background processing

## 🐳 Docker Support

```bash
# Development with Docker
docker-compose up -d

# Production build
docker build -t clauseguard-backend ./backend
docker build -t clauseguard-frontend ./frontend
```

## 📞 Support

For setup assistance or deployment questions:
1. Check the `deployment-guide.md` for detailed instructions
2. Verify all environment variables are properly set
3. Ensure all required services (MongoDB, Clerk, IBM Granite, Cloudinary) are configured

## 📄 License

MIT License - see LICENSE file for details

---

**ClauseGuard** - Making contract analysis accessible and secure for everyone. 🛡️ 