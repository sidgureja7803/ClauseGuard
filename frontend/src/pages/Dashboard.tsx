import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Plus,
  MessageSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  Eye,
  Download,
  Filter,
  Search,
  Star,
  Activity,
  Users,
  Target
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { DashboardStats, ContractAnalysis } from '@/types'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import IBMBadge from '@/components/ui/IBMBadge'
import AnalyticsDashboard from '@/components/ui/AnalyticsDashboard'
import ContractChatAgent from '@/components/ui/ContractChatAgent'
import OnboardingTooltips from '@/components/ui/OnboardingTooltips'

// Extend window interface for Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>
      }
    }
  }
}

const Dashboard = () => {
  const { user } = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUploads, setRecentUploads] = useState<ContractAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [showChatAgent, setShowChatAgent] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<'all' | 'safe' | 'review' | 'risky'>('all')
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Check for latest analysis in sessionStorage
      const storedAnalysis = sessionStorage.getItem('latestAnalysis')
      if (storedAnalysis) {
        setLatestAnalysis(JSON.parse(storedAnalysis))
        // Clear it after displaying
        sessionStorage.removeItem('latestAnalysis')
      }
      
      // Set timeout for API calls to prevent hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      )
      
      const [statsResult, uploadsResult] = await Promise.allSettled([
        Promise.race([api.dashboard.getStats(), timeout]),
        Promise.race([api.dashboard.getRecentUploads(5), timeout])
      ])
      
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value)
      } else {
        console.warn('Failed to fetch stats:', statsResult.reason)
        setStats({
          totalUploads: 0,
          riskyClauses: 0,
          safeClauses: 0,
          tokensUsed: 0,
          tokensLimit: 10000
        })
      }
      
      if (uploadsResult.status === 'fulfilled') {
        setRecentUploads(uploadsResult.value)
      } else {
        console.warn('Failed to fetch recent uploads:', uploadsResult.reason)
        setRecentUploads([])
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setStats({
        totalUploads: 0,
        riskyClauses: 0,
        safeClauses: 0,
        tokensUsed: 0,
        tokensLimit: 10000
      })
      setRecentUploads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const hasVisited = localStorage.getItem(`dashboard_visited_${user?.id}`)
    if (!hasVisited && user?.id) {
      setIsFirstVisit(true)
      setShowOnboarding(true)
      localStorage.setItem(`dashboard_visited_${user?.id}`, 'true')
    }

    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const filteredUploads = recentUploads.filter(upload => {
    const matchesSearch = upload.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRisk === 'all' || upload.analysis?.overallRisk === filterRisk
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-ping"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">Preparing your contract intelligence...</p>
          <IBMBadge variant="default" className="mx-auto" />
        </div>
      </div>
    )
  }

  const tokensUsedPercentage = stats ? (stats.tokensUsed / stats.tokensLimit) * 100 : 0
  const isNewUser = (stats?.totalUploads || 0) === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Enhanced Hero Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl text-white p-8 lg:p-12 overflow-hidden" data-tour="nav">
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 translate-x-36 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400/20 rounded-full -translate-x-16 -translate-y-16 blur-2xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                        Welcome back, {user?.firstName || 'User'}! 👋
                      </h1>
                      <p className="text-blue-100 text-lg lg:text-xl font-medium mt-2">
                        Ready to analyze contracts with AI-powered intelligence
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats Bar */}
                  <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <FileText className="h-4 w-4" />
                      <span>{stats?.totalUploads || 0} Contracts</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <Zap className="h-4 w-4" />
                      <span>{Math.round(tokensUsedPercentage)}% AI Usage</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <Clock className="h-4 w-4" />
                      <span>Last active: Now</span>
                    </div>
                  </div>
                </div>
                
                <IBMBadge variant="default" className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300" />
              </div>
              
              {/* Enhanced Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                <Link
                  to="/upload"
                  data-tour="upload-button"
                  className="group relative bg-white text-blue-600 hover:text-blue-700 font-semibold py-6 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-4 shadow-lg hover:shadow-2xl transform hover:scale-105 border border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center space-x-4 w-full">
                    <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300 group-hover:scale-110 transform">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-lg font-bold">Upload Contract</span>
                      <span className="block text-sm text-blue-500">Analyze with AI</span>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                  </div>
                </Link>
                
                <button
                  onClick={() => setShowChatAgent(true)}
                  className="group relative bg-white/20 text-white hover:bg-white/30 font-semibold py-6 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-4 backdrop-blur-sm border border-white/30 hover:border-white/50"
                >
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300 group-hover:scale-110 transform">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-lg font-bold">AI Assistant</span>
                    <span className="block text-sm text-blue-100">Get instant help</span>
                  </div>
                  <Sparkles className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="group relative bg-white/20 text-white hover:bg-white/30 font-semibold py-6 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-4 backdrop-blur-sm border border-white/30 hover:border-white/50"
                >
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300 group-hover:scale-110 transform">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-lg font-bold">Analytics</span>
                    <span className="block text-sm text-blue-100">View insights</span>
                  </div>
                  <TrendingUp className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Analysis Results - Show if available */}
        {latestAnalysis && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analysis Complete! 🎉</h2>
                  <p className="text-gray-600">Your contract "{latestAnalysis.fileName}" has been successfully analyzed</p>
                </div>
              </div>
              <button
                onClick={() => setLatestAnalysis(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
                <p className="text-gray-700 leading-relaxed">{latestAnalysis.analysis.summary}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Risk Level:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      latestAnalysis.analysis.overallRisk === 'safe' 
                        ? 'bg-green-100 text-green-800'
                        : latestAnalysis.analysis.overallRisk === 'review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {latestAnalysis.analysis.overallRisk?.toUpperCase() || 'SAFE'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Confidence: {Math.round((latestAnalysis.analysis.confidence || 0.95) * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium">{(latestAnalysis.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Type:</span>
                    <span className="font-medium">{latestAnalysis.fileType?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Characters Extracted:</span>
                    <span className="font-medium">{latestAnalysis.extractedText?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clauses Found:</span>
                    <span className="font-medium">{latestAnalysis.analysis.clauses?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {latestAnalysis.extractedText && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Text Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {latestAnalysis.extractedText.substring(0, 500)}
                    {latestAnalysis.extractedText.length > 500 && '...'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Uploads Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-blue-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +12% this month
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">{stats?.totalUploads || 0}</h3>
                <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                <p className="text-xs text-gray-500">Contracts analyzed</p>
              </div>
            </div>
          </div>

          {/* Risky Clauses Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-red-200">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    -8% reduced
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">{stats?.riskyClauses || 0}</h3>
                <p className="text-sm font-medium text-gray-600">Risky Clauses</p>
                <p className="text-xs text-gray-500">Flagged by AI</p>
              </div>
            </div>
          </div>

          {/* Safe Clauses Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-green-200">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +15% improved
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">{stats?.safeClauses || 0}</h3>
                <p className="text-sm font-medium text-gray-600">Safe Clauses</p>
                <p className="text-xs text-gray-500">Verified secure</p>
              </div>
            </div>
          </div>

          {/* Token Usage Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-purple-200">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    Efficient usage
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">{Math.round(tokensUsedPercentage)}%</h3>
                <p className="text-sm font-medium text-gray-600">Token Usage</p>
                <p className="text-xs text-gray-500">IBM Granite AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Token Usage Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">IBM Granite Token Usage</h3>
                  <p className="text-sm text-gray-600">AI processing capacity and efficiency</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.tokensUsed || 0}<span className="text-lg text-gray-500">/{stats?.tokensLimit || 10000}</span>
                </div>
                <p className="text-sm text-gray-500">tokens used</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(tokensUsedPercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0</span>
                <span className="font-medium">{Math.round(tokensUsedPercentage)}% used</span>
                <span>{stats?.tokensLimit || 10000}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Content Based on User State */}
        {isNewUser ? (
          /* Getting Started Section for New Users */
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to ClauseGuard! 🚀
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get started by uploading your first contract for AI-powered analysis. 
                Our advanced IBM Granite AI will identify risks, highlight important clauses, and provide actionable insights.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Upload</h3>
                  <p className="text-sm text-gray-600">Upload your contract in PDF, DOCX, or TXT format</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Analyze</h3>
                  <p className="text-sm text-gray-600">AI analyzes clauses and identifies potential risks</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Review</h3>
                  <p className="text-sm text-gray-600">Get detailed insights and recommendations</p>
                </div>
              </div>
              
              <Link
                to="/upload"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Upload Your First Contract</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Recent Activity Section for Existing Users */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-gray-600">Your latest contract analyses</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contracts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Risks</option>
                    <option value="safe">Safe</option>
                    <option value="review">Review</option>
                    <option value="risky">Risky</option>
                  </select>
                  
                  <Link
                    to="/history"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View All</span>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredUploads.length > 0 ? (
                <div className="space-y-4">
                  {filteredUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                            {upload.fileName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(upload.uploadDate)} • {upload.analysis?.overallRisk || 'Processing'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          upload.analysis?.overallRisk === 'safe' 
                            ? 'bg-green-100 text-green-700'
                            : upload.analysis?.overallRisk === 'review'
                            ? 'bg-yellow-100 text-yellow-700' 
                            : upload.analysis?.overallRisk === 'risky'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {upload.analysis?.overallRisk || 'Processing'}
                        </div>
                        
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-300">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No contracts found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterRisk !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Upload your first contract to get started with AI analysis'
                    }
                  </p>
                  {!searchTerm && filterRisk === 'all' && (
                    <Link
                      to="/upload"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Upload Contract</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

                 {/* Onboarding Tooltips */}
         {showOnboarding && (
           <OnboardingTooltips
             isActive={showOnboarding}
             onComplete={() => setShowOnboarding(false)}
             onSkip={() => setShowOnboarding(false)}
           />
         )}

                 {/* Chat Agent Modal */}
         {showChatAgent && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
               <ContractChatAgent
                 contractTitle="Dashboard Contract Analysis"
                 onClose={() => setShowChatAgent(false)}
               />
             </div>
           </div>
         )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                <AnalyticsDashboard />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 