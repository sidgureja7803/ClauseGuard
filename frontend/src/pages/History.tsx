import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Eye
} from 'lucide-react'
import { ContractAnalysis } from '@/types'
import { formatDate, getRiskColor, getRiskIcon } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const History = () => {
  const [analyses, setAnalyses] = useState<ContractAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')
  const [riskFilter, setRiskFilter] = useState<'all' | 'safe' | 'review' | 'risky'>('all')

  useEffect(() => {
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      setAnalyses([
        {
          id: '1',
          userId: 'user1',
          fileName: 'Service Agreement Q4 2024.pdf',
          fileUrl: '',
          uploadDate: new Date().toISOString(),
          fileType: 'pdf',
          status: 'completed',
          analysis: {
            summary: 'Contract contains standard service terms with 2 high-risk clauses requiring attention.',
            clauses: [],
            overallRisk: 'review',
            confidence: 0.87
          }
        },
        {
          id: '2',
          userId: 'user1',
          fileName: 'Employment Contract - John Smith.docx',
          fileUrl: '',
          uploadDate: new Date(Date.now() - 86400000).toISOString(),
          fileType: 'docx',
          status: 'completed',
          analysis: {
            summary: 'Standard employment contract with competitive terms and fair conditions.',
            clauses: [],
            overallRisk: 'safe',
            confidence: 0.92
          }
        },
        {
          id: '3',
          userId: 'user1',
          fileName: 'Vendor Agreement - TechCorp.pdf',
          fileUrl: '',
          uploadDate: new Date(Date.now() - 172800000).toISOString(),
          fileType: 'pdf',
          status: 'completed',
          analysis: {
            summary: 'Multiple high-risk clauses identified including unfavorable termination and liability terms.',
            clauses: [],
            overallRisk: 'risky',
            confidence: 0.94
          }
        },
        {
          id: '4',
          userId: 'user1',
          fileName: 'NDA Template.txt',
          fileUrl: '',
          uploadDate: new Date(Date.now() - 259200000).toISOString(),
          fileType: 'txt',
          status: 'processing',
        },
        {
          id: '5',
          userId: 'user1',
          fileName: 'Partnership Agreement.pdf',
          fileUrl: '',
          uploadDate: new Date(Date.now() - 432000000).toISOString(),
          fileType: 'pdf',
          status: 'failed',
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter
    const matchesRisk = riskFilter === 'all' || analysis.analysis?.overallRisk === riskFilter
    
    return matchesSearch && matchesStatus && matchesRisk
  })

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