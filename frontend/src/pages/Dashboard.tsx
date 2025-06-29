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
  Search
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

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [statsResult, uploadsResult] = await Promise.allSettled([
        api.dashboard.getStats(),
        api.dashboard.getRecentUploads(5)
      ])
      
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value)
      } else {
        console.warn('Failed to fetch stats:', statsResult.reason)
        // Fallback to default empty stats
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
      // Set default empty stats on error
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
    // Check if this is the user's first visit
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

  // Filter uploads based on search and risk level
  const filteredUploads = recentUploads.filter(upload => {
    const matchesSearch = upload.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRisk === 'all' || upload.analysis?.overallRisk === filterRisk
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative">
            <LoadingSpinner size="lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-gray-500">Powered by IBM Granite AI</p>
        </div>
      </div>
    )
  }

  const tokensUsedPercentage = stats ? (stats.tokensUsed / stats.tokensLimit) * 100 : 0

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Welcome Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl text-white p-8 overflow-hidden" data-tour="nav">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-700/90"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold leading-tight">
                      Welcome back, {user?.firstName || 'User'}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg font-medium">
                      Ready to analyze contracts with AI-powered intelligence
                    </p>
                  </div>
                  <IBMBadge variant="default" className="bg-white/20 text-white border-white/30 backdrop-blur-sm" />
                </div>
                
                {/* Enhanced Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Link
                    to="/upload"
                    data-tour="upload-button"
                    className="group bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold">Upload Contract</span>
                      <span className="block text-xs text-blue-500">Analyze with AI</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  
                  <button
                    onClick={() => setShowChatAgent(true)}
                    className="group bg-white/20 text-white hover:bg-white/30 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm border border-white/20"
                  >
                    <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold">AI Assistant</span>
                      <span className="block text-xs text-blue-100">Get instant help</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowAnalytics(true)}
                    className="group bg-white/20 text-white hover:bg-white/30 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm border border-white/20"
                  >
                    <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold">Analytics</span>
                      <span className="block text-xs text-blue-100">View insights</span>
                    </div>
                  </button>
                </div>

                {/* Quick Stats Preview */}
                {stats && (
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{stats.totalUploads} Contracts</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">{Math.round(tokensUsedPercentage)}% AI Usage</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Last active: Now</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced AI Status Indicator */}
              <div className="hidden lg:flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Sparkles className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full border-2 border-white animate-bounce"></div>
                </div>
                <div className="text-center">
                  <span className="block text-sm text-blue-100 font-medium">AI Online</span>
                  <span className="block text-xs text-blue-200">IBM Granite</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors duration-300">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-semibold bg-green-100 rounded-full px-2 py-1">
                    +12% this month
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.totalUploads}</p>
                <p className="text-sm font-medium text-gray-500">Total Uploads</p>
                <p className="text-xs text-gray-400">Contracts analyzed</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-2xl group-hover:bg-red-200 transition-colors duration-300">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-orange-600 font-semibold bg-orange-100 rounded-full px-2 py-1">
                    -8% reduced
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.riskyClauses}</p>
                <p className="text-sm font-medium text-gray-500">Risky Clauses</p>
                <p className="text-xs text-gray-400">Flagged by AI</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors duration-300">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-semibold bg-green-100 rounded-full px-2 py-1">
                    +15% improved
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.safeClauses}</p>
                <p className="text-sm font-medium text-gray-500">Safe Clauses</p>
                <p className="text-xs text-gray-400">Verified secure</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors duration-300">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-purple-600 font-semibold bg-purple-100 rounded-full px-2 py-1">
                    Efficient usage
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{Math.round(tokensUsedPercentage)}%</p>
                <p className="text-sm font-medium text-gray-500">Token Usage</p>
                <p className="text-xs text-gray-400">IBM Granite AI</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Token Usage Progress */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">IBM Granite Token Usage</h3>
                  <p className="text-sm text-gray-500">AI processing capacity and efficiency</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.tokensUsed.toLocaleString()}
                </span>
                <span className="text-gray-500">/ {stats.tokensLimit.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${Math.min(tokensUsedPercentage, 100)}%` }}
                >
                  <div className="h-full bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Used: {Math.round(tokensUsedPercentage)}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-600">Available: {100 - Math.round(tokensUsedPercentage)}%</span>
                  </div>
                </div>
                <p className="text-gray-600 font-medium">
                  {stats.tokensLimit - stats.tokensUsed > 0 
                    ? `${(stats.tokensLimit - stats.tokensUsed).toLocaleString()} tokens remaining`
                    : 'Token limit reached - Upgrade for more capacity'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Recent Uploads Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Contract Analysis</h3>
                  <p className="text-sm text-gray-500">Your latest AI-powered contract reviews</p>
                </div>
              </div>
              <Link 
                to="/history" 
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                <span>View all</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="safe">Safe</option>
                  <option value="review">Needs Review</option>
                  <option value="risky">High Risk</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {filteredUploads.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative">
                  <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {recentUploads.length === 0 ? 'No contracts uploaded yet' : 'No matching contracts'}
                </h4>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {recentUploads.length === 0 
                    ? 'Upload your first contract to get started with AI-powered analysis and risk detection'
                    : 'Try adjusting your search or filter criteria to find contracts'
                  }
                </p>
                <Link 
                  to="/upload" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Upload Contract</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUploads.slice(0, 5).map((upload, index) => (
                  <div 
                    key={upload.id} 
                    className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-md"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        {upload.analysis?.overallRisk && (
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            upload.analysis.overallRisk === 'safe' ? 'bg-green-500' :
                            upload.analysis.overallRisk === 'review' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                          {upload.fileName}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            Uploaded {formatDate(upload.uploadDate)}
                          </p>
                          {upload.analysis?.confidence && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">Confidence:</span>
                              <span className="text-xs font-medium text-gray-600">
                                {Math.round(upload.analysis.confidence * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Risk Status Badge */}
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                        upload.analysis?.overallRisk === 'safe' 
                          ? 'bg-green-100 text-green-700 border border-green-200' :
                        upload.analysis?.overallRisk === 'review' 
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                        upload.analysis?.overallRisk === 'risky'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {upload.analysis?.overallRisk === 'safe' && <CheckCircle className="h-3 w-3" />}
                        {upload.analysis?.overallRisk === 'review' && <AlertTriangle className="h-3 w-3" />}
                        {upload.analysis?.overallRisk === 'risky' && <AlertTriangle className="h-3 w-3" />}
                        <span>
                          {upload.analysis?.overallRisk === 'safe' && 'Safe'}
                          {upload.analysis?.overallRisk === 'review' && 'Review'}
                          {upload.analysis?.overallRisk === 'risky' && 'High Risk'}
                          {!upload.analysis?.overallRisk && 'Processing'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>

                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 flex items-center space-x-1">
                        <span>View Analysis</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredUploads.length > 5 && (
                  <div className="text-center pt-4">
                    <Link 
                      to="/history"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-center space-x-2 hover:underline"
                    >
                      <span>View {filteredUploads.length - 5} more contracts</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Agent Modal */}
        {showChatAgent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl">
              <ContractChatAgent 
                contractTitle="Recent Contract Analysis"
                onClose={() => setShowChatAgent(false)}
              />
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                      <p className="text-sm text-gray-500">Comprehensive insights and performance metrics</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                  >
                    <span className="text-2xl text-gray-400">×</span>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <AnalyticsDashboard />
              </div>
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
      </div>
    </div>
  )
}

export default Dashboard 