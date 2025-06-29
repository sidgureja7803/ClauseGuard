import React, { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Brain,
  FileText,
  Shield,
  Edit3,
  BarChart3,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentStep {
  stepId: string
  stepType: 'extraction' | 'risk_tagging' | 'clause_suggestion' | 'summary' | 'prioritization'
  stepName: string
  startTime: string
  endTime: string
  agentDecision: string
  reasoning: string
  tokensUsed: number
  confidence: number
  input?: any
  output?: any
}

interface AgentAuditTrailProps {
  steps: AgentStep[]
  className?: string
  showDetails?: boolean
}

const AgentAuditTrail: React.FC<AgentAuditTrailProps> = ({
  steps = [],
  className = '',
  showDetails = false
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [showAllDetails, setShowAllDetails] = useState(showDetails)

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'prioritization':
        return <Brain className="h-5 w-5 text-purple-600" />
      case 'extraction':
        return <FileText className="h-5 w-5 text-blue-600" />
      case 'risk_tagging':
        return <Shield className="h-5 w-5 text-orange-600" />
      case 'clause_suggestion':
        return <Edit3 className="h-5 w-5 text-green-600" />
      case 'summary':
        return <BarChart3 className="h-5 w-5 text-indigo-600" />
      default:
        return <Zap className="h-5 w-5 text-gray-600" />
    }
  }

  const getStepColor = (stepType: string) => {
    switch (stepType) {
      case 'prioritization': return 'bg-purple-50 border-purple-200'
      case 'extraction': return 'bg-blue-50 border-blue-200'
      case 'risk_tagging': return 'bg-orange-50 border-orange-200'
      case 'clause_suggestion': return 'bg-green-50 border-green-200'
      case 'summary': return 'bg-indigo-50 border-indigo-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = end.getTime() - start.getTime()
    return `${duration}ms`
  }

  const totalTokens = steps.reduce((sum, step) => sum + step.tokensUsed, 0)
  const avgConfidence = steps.length > 0 
    ? steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length 
    : 0

  if (steps.length === 0) {
    return (
      <div className={cn('bg-gray-50 rounded-xl p-6 text-center', className)}>
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agent Steps Available</h3>
        <p className="text-gray-600">The agent audit trail will appear here once analysis begins.</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border', className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Agent Decision Trail</h3>
              <p className="text-gray-600">Step-by-step analysis decisions</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showAllDetails ? 'Hide Details' : 'Show All Details'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{steps.length}</div>
            <div className="text-sm text-gray-600">Steps Executed</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{totalTokens}</div>
            <div className="text-sm text-gray-600">Tokens Used</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{Math.round(avgConfidence * 100)}%</div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-6 space-y-4">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.stepId) || showAllDetails
          
          return (
            <div
              key={step.stepId}
              className={cn(
                'border rounded-lg transition-all duration-200',
                getStepColor(step.stepType)
              )}
            >
              {/* Step Header */}
              <div 
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleStepExpansion(step.stepId)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-bold text-gray-700">
                      {index + 1}
                    </span>
                    {getStepIcon(step.stepType)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.stepName}</h4>
                      <p className="text-sm text-gray-600">{step.agentDecision}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    getConfidenceColor(step.confidence)
                  )}>
                    {Math.round(step.confidence * 100)}%
                  </span>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(step.startTime, step.endTime)}
                  </div>
                  
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Step Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 bg-white/50">
                  <div className="mt-4 space-y-3">
                    {/* Reasoning */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Agent Reasoning</h5>
                      <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
                        {step.reasoning}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Performance</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tokens Used:</span>
                            <span className="font-medium">{step.tokensUsed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <span className="font-medium">{Math.round(step.confidence * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{formatDuration(step.startTime, step.endTime)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Timestamps</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Started:</span>
                            <span className="font-medium">{new Date(step.startTime).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium">{new Date(step.endTime).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input/Output Preview */}
                    {(step.input || step.output) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {step.input && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Input Preview</h5>
                            <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                              {typeof step.input === 'string' 
                                ? step.input.substring(0, 100) + '...'
                                : JSON.stringify(step.input).substring(0, 100) + '...'
                              }
                            </div>
                          </div>
                        )}
                        
                        {step.output && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Output Preview</h5>
                            <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                              {typeof step.output === 'string'
                                ? step.output.substring(0, 100) + '...'
                                : JSON.stringify(step.output).substring(0, 100) + '...'
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Analysis completed with {steps.length} agent decisions</span>
          <div className="flex items-center space-x-4">
            <span>Total tokens: {totalTokens}</span>
            <span>Avg confidence: {Math.round(avgConfidence * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentAuditTrail 