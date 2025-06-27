import React, { useState, useEffect } from 'react'
import { Search, Plus, Tag, Star, Copy, Download, Filter, BookOpen, Edit3, Trash2, Eye, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SavedClause {
  id: string
  title: string
  content: string
  category: 'liability' | 'payment' | 'termination' | 'intellectual-property' | 'confidentiality' | 'other'
  tags: string[]
  riskLevel: 'low' | 'medium' | 'high'
  isFavorite: boolean
  createdAt: Date
  lastUsed?: Date
  timesUsed: number
  source: 'ai-generated' | 'manual' | 'template'
  originalClause?: string
}

interface ClauseLibraryProps {
  onInsertClause?: (clause: SavedClause) => void
  showInsertButton?: boolean
}

const ClauseLibrary: React.FC<ClauseLibraryProps> = ({ 
  onInsertClause, 
  showInsertButton = false 
}) => {
  const [clauses, setClauses] = useState<SavedClause[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedClause, setSelectedClause] = useState<SavedClause | null>(null)
  const [showAddClause, setShowAddClause] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockClauses: SavedClause[] = [
      {
        id: '1',
        title: 'Mutual Liability Cap',
        content: 'EXCEPT FOR BREACHES OF CONFIDENTIALITY OR DATA PROTECTION OBLIGATIONS, EACH PARTY\'S TOTAL LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID OR PAYABLE UNDER THIS AGREEMENT IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY. This limitation applies regardless of the legal theory under which damages are sought.',
        category: 'liability',
        tags: ['mutual', 'cap', 'fair', 'recommended'],
        riskLevel: 'low',
        isFavorite: true,
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date('2024-06-20'),
        timesUsed: 15,
        source: 'ai-generated',
        originalClause: 'IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY DAMAGES WHATSOEVER...'
      },
      {
        id: '2',
        title: 'Standard Payment Terms',
        content: 'Payment is due within thirty (30) days of invoice date. Late payments shall incur a service charge of one and one-half percent (1.5%) per month. Customer may receive a two percent (2%) early payment discount if payment is received within ten (10) days of invoice date.',
        category: 'payment',
        tags: ['30-day', 'early-discount', 'reasonable-penalty'],
        riskLevel: 'low',
        isFavorite: true,
        createdAt: new Date('2024-02-01'),
        lastUsed: new Date('2024-06-25'),
        timesUsed: 23,
        source: 'template'
      },
      {
        id: '3',
        title: 'Reasonable Termination Notice',
        content: 'Either party may terminate this Agreement without cause by providing ninety (90) days prior written notice to the other party. Upon termination, each party shall return or destroy all Confidential Information of the other party within thirty (30) days.',
        category: 'termination',
        tags: ['90-day-notice', 'mutual', 'data-return'],
        riskLevel: 'low',
        isFavorite: false,
        createdAt: new Date('2024-03-10'),
        timesUsed: 8,
        source: 'ai-generated'
      },
      {
        id: '4',
        title: 'Limited Audit Rights',
        content: 'Licensor may audit Customer\'s use of the Software upon sixty (60) days prior written notice, during normal business hours, and no more than once per calendar year unless a previous audit revealed material non-compliance.',
        category: 'other',
        tags: ['audit', '60-day-notice', 'limited-frequency'],
        riskLevel: 'medium',
        isFavorite: false,
        createdAt: new Date('2024-04-05'),
        timesUsed: 3,
        source: 'manual'
      },
      {
        id: '5',
        title: 'Mutual Indemnification',
        content: 'Each party shall indemnify, defend, and hold harmless the other party from and against any third-party claims arising from: (a) its breach of this Agreement; (b) its negligent acts or omissions; or (c) its violation of applicable laws. This indemnification is subject to the liability limitations set forth in this Agreement.',
        category: 'liability',
        tags: ['mutual', 'indemnification', 'fair', 'capped'],
        riskLevel: 'low',
        isFavorite: true,
        createdAt: new Date('2024-05-12'),
        timesUsed: 12,
        source: 'ai-generated'
      }
    ]

    setClauses(mockClauses)
  }, [])

  const categories = [
    { value: 'all', label: 'All Categories', count: clauses.length },
    { value: 'liability', label: 'Liability', count: clauses.filter(c => c.category === 'liability').length },
    { value: 'payment', label: 'Payment', count: clauses.filter(c => c.category === 'payment').length },
    { value: 'termination', label: 'Termination', count: clauses.filter(c => c.category === 'termination').length },
    { value: 'intellectual-property', label: 'IP Rights', count: clauses.filter(c => c.category === 'intellectual-property').length },
    { value: 'confidentiality', label: 'Confidentiality', count: clauses.filter(c => c.category === 'confidentiality').length },
    { value: 'other', label: 'Other', count: clauses.filter(c => c.category === 'other').length }
  ]

  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clause.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clause.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || clause.category === selectedCategory
    const matchesRiskLevel = selectedRiskLevel === 'all' || clause.riskLevel === selectedRiskLevel
    const matchesFavorites = !showFavoritesOnly || clause.isFavorite

    return matchesSearch && matchesCategory && matchesRiskLevel && matchesFavorites
  })

  const handleToggleFavorite = (clauseId: string) => {
    setClauses(prev => prev.map(clause => 
      clause.id === clauseId 
        ? { ...clause, isFavorite: !clause.isFavorite }
        : clause
    ))
  }

  const handleCopyClause = (clause: SavedClause) => {
    navigator.clipboard.writeText(clause.content)
    // Show toast notification in real app
  }

  const handleUseClause = (clause: SavedClause) => {
    setClauses(prev => prev.map(c => 
      c.id === clause.id 
        ? { ...c, timesUsed: c.timesUsed + 1, lastUsed: new Date() }
        : c
    ))
    
    if (onInsertClause) {
      onInsertClause(clause)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai-generated': return '🤖'
      case 'template': return '📄'
      case 'manual': return '✏️'
      default: return '📝'
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 h-[700px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Clause Library</h2>
              <p className="text-gray-600">Your collection of safe, reusable contract clauses</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddClause(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Clause</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clauses, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} ({cat.count})
                </option>
              ))}
            </select>
            
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
            
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                "p-2 rounded-xl transition-colors duration-200",
                showFavoritesOnly
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Star className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredClauses.length} of {clauses.length} clauses
        </div>
      </div>

      {/* Clause List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{clause.title}</h3>
                    <span className="text-sm">{getSourceIcon(clause.source)}</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      getRiskColor(clause.riskLevel)
                    )}>
                      {clause.riskLevel} risk
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="capitalize">{clause.category.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>Used {clause.timesUsed} times</span>
                    {clause.lastUsed && (
                      <>
                        <span>•</span>
                        <span>Last used {clause.lastUsed.toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {clause.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFavorite(clause.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors duration-200",
                      clause.isFavorite
                        ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                        : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    )}
                  >
                    <Star className={cn("h-4 w-4", clause.isFavorite && "fill-current")} />
                  </button>
                  
                  <button
                    onClick={() => setSelectedClause(clause)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleCopyClause(clause)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  {showInsertButton && (
                    <button
                      onClick={() => handleUseClause(clause)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors duration-200"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Use</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 line-clamp-3">{clause.content}</p>
                {clause.content.length > 200 && (
                  <button
                    onClick={() => setSelectedClause(clause)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                  >
                    Read more →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredClauses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clauses found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedRiskLevel !== 'all' || showFavoritesOnly
                ? "Try adjusting your filters to see more results."
                : "Start building your clause library by adding your first clause."}
            </p>
            <button
              onClick={() => setShowAddClause(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium"
            >
              Add Your First Clause
            </button>
          </div>
        )}
      </div>

      {/* Clause Detail Modal */}
      {selectedClause && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{selectedClause.title}</h3>
                <button
                  onClick={() => setSelectedClause(null)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getRiskColor(selectedClause.riskLevel)
                  )}>
                    {selectedClause.riskLevel} risk
                  </span>
                  <span className="capitalize">{selectedClause.category.replace('-', ' ')}</span>
                  <span>{getSourceIcon(selectedClause.source)} {selectedClause.source.replace('-', ' ')}</span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Clause Content</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedClause.content}</p>
                </div>

                {selectedClause.originalClause && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Original (Risky) Clause</h4>
                    <p className="text-gray-700 text-sm">{selectedClause.originalClause}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopyClause(selectedClause)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                  
                  {showInsertButton && (
                    <button
                      onClick={() => {
                        handleUseClause(selectedClause)
                        setSelectedClause(null)
                      }}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Use This Clause</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClauseLibrary 