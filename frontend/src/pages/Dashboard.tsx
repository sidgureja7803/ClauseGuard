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
  BookOpen,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { DashboardStats, ContractAnalysis } from '@/types'
import { formatDate } from '@/lib/utils'
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

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get auth token
      let authToken = ''
      try {
        if (window.Clerk?.session?.getToken) {
          authToken = await window.Clerk.session.getToken()
        }
      } catch (tokenError) {
        console.warn('Could not get auth token:', tokenError)
      }
      
      // TODO: Replace with actual API endpoints
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const [statsResponse, uploadsResponse] = await Promise.allSettled([
        fetch('/api/dashboard/stats', { headers }),
        fetch('/api/dashboard/recent-uploads', { headers })
      ])
      
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json()
        setStats(statsData)
      } else {
        // Fallback to default empty stats
        setStats({
          totalUploads: 0,
          riskyClauses: 0,
          safeClauses: 0,
          tokensUsed: 0,
          tokensLimit: 10000
        })
      }
      
      if (uploadsResponse.status === 'fulfilled' && uploadsResponse.value.ok) {
        const uploadsData = await uploadsResponse.value.json()
        setRecentUploads(uploadsData)
      } else {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tokensUsedPercentage = stats ? (stats.tokensUsed / stats.tokensLimit) * 100 : 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl text-white p-8" data-tour="nav">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold">
                  Welcome back, {user?.firstName || 'User'}! 👋
                </h1>
                <IBMBadge variant="default" className="bg-white/20 text-white border-white/30" />
              </div>
              <p className="text-blue-100 text-lg mb-6">
                Ready to analyze some contracts? Upload a new document or try our AI assistant.
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/upload"
                  data-tour="upload-button"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Upload Contract</span>
                </Link>
                
                <button
                  onClick={() => setShowChatAgent(true)}
                  className="bg-white/20 text-white hover:bg-white/30 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Ask AI Assistant</span>
                </button>
                
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="bg-white/20 text-white hover:bg-white/30 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
            
            {/* AI Status Indicator */}
            <div className="hidden lg:flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <span className="text-sm text-blue-100 font-medium">AI Online</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Uploads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Risky Clauses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.riskyClauses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Safe Clauses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.safeClauses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Token Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(tokensUsedPercentage)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Usage Progress */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">IBM Granite Token Usage</h3>
              <span className="text-sm text-gray-500">
                {stats.tokensUsed.toLocaleString()} / {stats.tokensLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(tokensUsedPercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.tokensLimit - stats.tokensUsed > 0 
                ? `${(stats.tokensLimit - stats.tokensUsed).toLocaleString()} tokens remaining`
                : 'Token limit reached'
              }
            </p>
          </div>
        )}

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
              <Link to="/history" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentUploads.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No contracts uploaded yet</h4>
                <p className="text-gray-500 mb-4">
                  Upload your first contract to get started with AI-powered analysis
                </p>
                <Link to="/upload" className="btn-primary">
                  Upload Contract
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUploads.slice(0, 3).map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{upload.fileName}</h4>
                        <p className="text-sm text-gray-500">
                          Uploaded {formatDate(upload.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {upload.analysis?.overallRisk === 'safe' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {upload.analysis?.overallRisk === 'review' && (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      {upload.analysis?.overallRisk === 'risky' && (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View Analysis
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Agent Modal */}
        {showChatAgent && (
          <ContractChatAgent 
            contractTitle="Recent Contract Analysis"
            onClose={() => setShowChatAgent(false)}
          />
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
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