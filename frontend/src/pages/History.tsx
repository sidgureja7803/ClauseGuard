import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  Eye
} from 'lucide-react'
import { ContractAnalysis } from '@/types'
import { formatDate, getRiskColor, getRiskIcon } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { analysisAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const History = () => {
  const [analyses, setAnalyses] = useState<ContractAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')
  const [riskFilter, setRiskFilter] = useState<'all' | 'safe' | 'review' | 'risky'>('all')

  // Debounce search term to prevent too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    const fetchAnalysisHistory = async () => {
      try {
        setLoading(true)
        console.log('Fetching analysis history from API...')
        
        const response = await analysisAPI.getHistory({
          page: 1,
          limit: 50, // Get more results
          status: statusFilter === 'all' ? undefined : statusFilter,
          riskLevel: riskFilter === 'all' ? undefined : riskFilter,
          search: debouncedSearchTerm || undefined
        })
        
        console.log('Analysis history response:', response)
        
        if (response.data && response.data.analyses) {
          setAnalyses(response.data.analyses)
        } else {
          console.warn('No analyses data in response:', response)
          setAnalyses([])
        }
      } catch (error) {
        console.error('Failed to fetch analysis history:', error)
        toast.error('Failed to load analysis history')
        setAnalyses([])
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysisHistory()
  }, [statusFilter, riskFilter, debouncedSearchTerm])

  // Since we're now filtering on the API side, we can just use all analyses
  const filteredAnalyses = analyses

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="text-gray-600 mt-1">
            View and manage your past contract analyses
          </p>
        </div>
        <Link
          to="/upload"
          className="btn-primary mt-4 sm:mt-0"
        >
          Upload New Contract
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Risk Levels</option>
            <option value="safe">Safe</option>
            <option value="review">Needs Review</option>
            <option value="risky">Risky</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredAnalyses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {analysis.fileName}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(analysis.uploadDate)}</span>
                        </div>
                        <span className="text-sm text-gray-500 capitalize">
                          {analysis.fileType.toUpperCase()}
                        </span>
                      </div>
                      {analysis.analysis && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {analysis.analysis.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Risk Level */}
                    {analysis.analysis && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(analysis.analysis.overallRisk)}`}>
                        {getRiskIcon(analysis.analysis.overallRisk)} {analysis.analysis.overallRisk === 'safe' ? 'Safe' : analysis.analysis.overallRisk === 'review' ? 'Needs Review' : 'Risky'}
                      </span>
                    )}
                    
                    {/* Status */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      analysis.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : analysis.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {analysis.status}
                    </span>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {analysis.status === 'completed' && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || riskFilter !== 'all'
                ? 'No matching contracts found'
                : 'No contracts analyzed yet'
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || riskFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Upload your first contract to get started with AI analysis'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && riskFilter === 'all') && (
              <Link to="/upload" className="btn-primary">
                Upload Contract
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default History 