import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload as UploadIcon, File, AlertCircle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Upload = () => {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const uploadToast = toast.loading('Uploading contract...')

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.dismiss(uploadToast)
      toast.loading('Analyzing contract with AI...', { duration: 8000 })

      // Simulate analysis time
      setTimeout(() => {
        toast.dismiss()
        toast.success('Contract analysis completed!')
        navigate(`/analysis/${response.data.analysisId}`)
      }, 8000)

    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload contract. Please try again.')
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setUploading(false)
    setAnalyzing(false)
  }

  if (analyzing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Your Contract
            </h2>
            <p className="text-gray-600">
              Our AI is reviewing {uploadedFile?.name} for risks and generating insights...
            </p>
          </div>
          
          <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">Document uploaded successfully</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">Extracting text content...</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">Analyzing clauses with IBM Granite AI</span>
            </div>
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-700">Generating risk assessment report</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            This usually takes 30-60 seconds depending on document length
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Contract</h1>
        <p className="text-gray-600">
          Upload your contract document for AI-powered risk analysis
        </p>
      </div>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <UploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-primary-600">
                Drop your contract here
              </p>
              <p className="text-gray-500 mt-1">
                We'll analyze it for risks immediately
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & drop your contract here
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse files
              </p>
              <button className="btn-primary">
                Choose File
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>Supported formats: PDF, DOCX, TXT</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Selected File</h3>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={resetUpload}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Remove
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4" />
                      <span>Analyze Contract</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
            <File className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Clause Analysis</h3>
          <p className="text-sm text-gray-600">
            AI breaks down your contract into individual clauses for detailed review
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="bg-amber-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Risk Detection</h3>
          <p className="text-sm text-gray-600">
            Identify potentially problematic clauses with confidence scores
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Safe Alternatives</h3>
          <p className="text-sm text-gray-600">
            Get AI-generated rewrite suggestions for risky clauses
          </p>
        </div>
      </div>
    </div>
  )
}

export default Upload 