import React, { useState } from 'react'
import { X, FileText, Brain, CheckCircle, ArrowRight, Cpu, Zap, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import IBMBadge from './IBMBadge'

interface HowItWorksModalProps {
  isOpen: boolean
  onClose: () => void
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      id: 1,
      title: 'Document Upload',
      description: 'Upload your contract in PDF, DOCX, or TXT format. Our secure processor extracts and prepares the text.',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      details: 'Supports multiple formats, OCR for scanned documents, and enterprise-grade security.'
    },
    {
      id: 2,
      title: 'IBM Granite Analysis',
      description: 'Three specialized IBM Granite models analyze your contract using advanced AI.',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      details: 'Granite-8B for summarization, Granite-4B for risk analysis, and Granite-Code for rewrites.'
    },
    {
      id: 3,
      title: 'LangChain Orchestration',
      description: 'LangChain agents coordinate the AI models and maintain context throughout the analysis.',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      details: 'Memory management, tool chaining, and intelligent workflow orchestration.'
    },
    {
      id: 4,
      title: 'Risk Assessment',
      description: 'Get detailed risk analysis with severity levels, explanations, and actionable recommendations.',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      details: 'High, medium, low risk categorization with specific clause-level analysis.'
    },
    {
      id: 5,
      title: 'Smart Recommendations',
      description: 'Receive AI-generated clause rewrites and suggestions to mitigate identified risks.',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      details: 'Safe alternatives, legal best practices, and customizable suggestions.'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">How ClauseGuard Works</h2>
              <p className="text-blue-100">AI-powered contract analysis in 5 simple steps</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-4">
            <IBMBadge variant="large" className="bg-white/20 text-white border-white/30" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Visual Flow Diagram */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-center">AI Analysis Pipeline</h3>
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      'relative flex flex-col items-center cursor-pointer transition-all duration-300',
                      activeStep === index ? 'scale-110' : 'hover:scale-105'
                    )}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className={cn(
                      'w-16 h-16 rounded-full bg-gradient-to-r flex items-center justify-center shadow-lg mb-2',
                      step.color,
                      activeStep === index && 'ring-4 ring-blue-300 ring-opacity-50'
                    )}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className={cn(
                      'text-sm font-medium text-center max-w-20',
                      activeStep === index ? 'text-blue-600' : 'text-gray-600'
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-gray-400 mx-4 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Details */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
                             <div className={cn(
                 'w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg flex-shrink-0',
                 steps[activeStep].color
               )}>
                 {React.createElement(steps[activeStep].icon, { className: "h-6 w-6 text-white" })}
               </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {steps[activeStep].title}
                </h4>
                <p className="text-gray-700 mb-3">
                  {steps[activeStep].description}
                </p>
                <p className="text-sm text-gray-600">
                  {steps[activeStep].details}
                </p>
              </div>
            </div>
          </div>

          {/* IBM Technology Highlight */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <Cpu className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">IBM Granite AI Models</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Granite-8B Instruct</h4>
                <p className="text-sm text-gray-600">Long-context summarization and document understanding</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-purple-600 mb-2">Granite-4B Instruct</h4>
                <p className="text-sm text-gray-600">Risk analysis and clause categorization</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-orange-600 mb-2">Granite-Code</h4>
                <p className="text-sm text-gray-600">Intelligent clause rewriting and suggestions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Enterprise-grade AI analysis powered by IBM Watson X
            </div>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorksModal 