import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload as UploadIcon, File, AlertCircle, CheckCircle, Brain, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AgentChatInterface from '@/components/ui/AgentChatInterface'
import AgentAuditTrail from '@/components/ui/AgentAuditTrail'

const AgentUpload = () => {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [agentSteps, setAgentSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleUpload = async () => {
    if (!uploadedFile) return

    setUploading(true)
    setAnalyzing(true)
    setCurrentStep('Uploading file...')

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch('/api/agent/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      console.log('Agent analysis result:', result)
      
      setAnalysisResult(result.analysis)
      setAgentSteps(result.analysis.agentAuditTrail || [])
      
      // Store analysis in sessionStorage for dashboard
      sessionStorage.setItem('latestAnalysis', JSON.stringify(result))
      
      toast.success('Contract analyzed successfully with AI Agent!')
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const handleFeedback = async (stepId: string, feedback: string) => {
    try {
      await fetch('/api/feedback/suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          analysisId: analysisResult?.id,
          suggestionId: stepId,
          feedbackType: feedback
        })
      })

      toast.success('Feedback submitted! The agent will learn from this.')
    } catch (error) {
      console.error('Feedback error:', error)
      toast.error('Failed to submit feedback')
    }
  }

  if (analyzing && analysisResult) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Agent Analysis Complete</h1>
              <p className="text-gray-600">Your contract has been analyzed by ClauseGuard's AI Agent</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Chat Interface */}
          <AgentChatInterface
            agentSteps={agentSteps}
            analysisResult={analysisResult}
            onFeedback={handleFeedback}
            className="h-96"
          />

          {/* Agent Audit Trail */}
          <AgentAuditTrail
            steps={agentSteps}
            className="h-96 overflow-hidden"
          />
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Analysis Summary</h3>
                <p className="text-gray-600">File: {uploadedFile?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                analysisResult.overallRisk === 'safe' 
                  ? 'bg-green-100 text-green-800'
                  : analysisResult.overallRisk === 'review'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Risk: {analysisResult.overallRisk?.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{Math.round((analysisResult.confidence || 0.8) * 100)}%</div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysisResult.clauses?.length || 0}</div>
              <div className="text-sm text-gray-600">Clauses Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{agentSteps.length}</div>
              <div className="text-sm text-gray-600">Agent Steps</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border">
            <p className="text-gray-700">{analysisResult.summary}</p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Full Analysis on Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (analyzing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full animate-pulse">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI Agent is Analyzing Your Contract
            </h2>
            <p className="text-gray-600">
              Our intelligent agent is performing a comprehensive multi-step analysis...
            </p>
          </div>
          
          <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">File uploaded successfully</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">Text extraction completed</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">AI Agent deciding analysis strategy...</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">Extracting key contract clauses</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">Performing risk assessment with IBM Granite</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">Generating improvement suggestions</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">Creating comprehensive summary</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">Powered by ClauseGuard AI Agent</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Multi-step analysis with autonomous decision making
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            This usually takes 45-90 seconds depending on contract complexity
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agent Contract Analysis</h1>
        <p className="text-gray-600">
          Upload your contract for intelligent, multi-step analysis by our AI agent
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-50 text-purple-800 rounded-full text-sm">
          <Brain className="h-4 w-4 mr-2" />
          Powered by ClauseGuard AI Agent v2.0
        </div>
      </div>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center mb-4">
            <UploadIcon className="h-16 w-16 text-gray-400" />
            <Brain className="h-12 w-12 text-purple-500 ml-2" />
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-purple-600">
                Drop your contract here for AI analysis
              </p>
              <p className="text-gray-500 mt-1">
                Our agent will intelligently analyze every aspect
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & drop your contract for AI Agent analysis
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse files
              </p>
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors">
                Choose File for AI Analysis
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>Supported formats: PDF, DOCX, TXT</p>
            <p>Maximum file size: 10MB</p>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">AI Agent Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Autonomous decision making</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Multi-step analysis workflow</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Learning from your feedback</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Complete audit trail</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <File className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{uploadedFile.name}</h3>
                <p className="text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI analysis
                </p>
              </div>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">AI Agent Analysis Process:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Intelligent prioritization</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Clause extraction</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Risk assessment</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Improvement suggestions</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Starting AI Analysis...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Start AI Agent Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentUpload 