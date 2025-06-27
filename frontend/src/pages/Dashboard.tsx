import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Plus
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { DashboardStats, ContractAnalysis } from '@/types'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Dashboard = () => {
  const { user } = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUploads, setRecentUploads] = useState<ContractAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    setTimeout(() => {
      setStats({
        totalUploads: 12,
        riskyClauses: 8,
        safeClauses: 34,
        tokensUsed: 2450,
        tokensLimit: 10000
      })
      
      setRecentUploads([
        {
          id: '1',
          userId: user?.id || '',
          fileName: 'Service Agreement.pdf',
          fileUrl: '',
          uploadDate: new Date().toISOString(),
          fileType: 'pdf',
          status: 'completed',
          analysis: {
            summary: 'Contract contains standard service terms with 2 high-risk clauses identified.',
            clauses: [],
            overallRisk: 'review',
            confidence: 0.87
          }
        },
        {
          id: '2',
          userId: user?.id || '',
          fileName: 'Employment Contract.docx',
          fileUrl: '',
          uploadDate: new Date(Date.now() - 86400000).toISOString(),
          fileType: 'docx',
          status: 'completed',
          analysis: {
            summary: 'Standard employment contract with competitive terms.',
            clauses: [],
            overallRisk: 'safe',
            confidence: 0.92
          }
        }
      ])
      
      setLoading(false)
    }, 1000)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tokensUsedPercentage = stats ? (stats.tokensUsed / stats.tokensLimit) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to analyze some contracts? Upload a new document to get started.
            </p>
          </div>
          <Link
            to="/upload"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>Upload New Contract</span>
          </Link>
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
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(tokensUsedPercentage)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Usage Bar */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              IBM Granite Token Usage
            </h3>
            <span className="text-sm text-gray-500">
              {stats.tokensUsed.toLocaleString()} / {stats.tokensLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${tokensUsedPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Recent Uploads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Uploads</h3>
            <Link
              to="/history"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        {recentUploads.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentUploads.map((upload) => (
              <div key={upload.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {upload.fileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(upload.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {upload.analysis && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        upload.analysis.overallRisk === 'safe'
                          ? 'bg-green-100 text-green-800'
                          : upload.analysis.overallRisk === 'review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {upload.analysis.overallRisk === 'safe' && '✅ Safe'}
                        {upload.analysis.overallRisk === 'review' && '🟠 Needs Review'}
                        {upload.analysis.overallRisk === 'risky' && '🔴 Risky'}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      upload.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : upload.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {upload.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads yet</h3>
            <p className="text-gray-500 mb-4">
              Upload your first contract to get started with AI analysis
            </p>
            <Link
              to="/upload"
              className="btn-primary"
            >
              Upload Contract
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 