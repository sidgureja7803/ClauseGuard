import React, { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipStep {
  id: string
  title: string
  content: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    text: string
    onClick: () => void
  }
}

interface OnboardingTooltipsProps {
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
}

const OnboardingTooltips: React.FC<OnboardingTooltipsProps> = ({
  isActive,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const steps: TooltipStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ClauseGuard! 🎉',
      content: 'Let us show you how to get the most out of our AI-powered contract analysis platform.',
      target: 'nav',
      position: 'bottom'
    },
    {
      id: 'upload',
      title: 'Upload Contracts',
      content: 'Click here to upload your contracts in PDF, DOCX, or TXT format. Our AI will analyze them instantly.',
      target: 'upload-button',
      position: 'bottom'
    },
    {
      id: 'analysis',
      title: 'AI Analysis Results',
      content: 'View detailed risk assessments, summaries, and smart recommendations powered by IBM Granite AI.',
      target: 'analysis-section',
      position: 'top'
    },
    {
      id: 'history',
      title: 'Track Your Progress',
      content: 'Access all your previous analyses and track contract patterns over time.',
      target: 'history-link',
      position: 'bottom'
    },
    {
      id: 'settings',
      title: 'Customize Experience',
      content: 'Adjust preferences, notification settings, and team collaboration options.',
      target: 'settings-link',
      position: 'bottom'
    }
  ]

  useEffect(() => {
    if (isActive) {
      setIsVisible(true)
    }
  }, [isActive])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    onSkip()
  }

  const getTooltipPosition = (position: string, target: string) => {
    const element = document.querySelector(`[data-tour="${target}"]`)
    if (!element) return { top: 0, left: 0 }

    const rect = element.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 200

    switch (position) {
      case 'bottom':
        return {
          top: rect.bottom + 10,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        }
      case 'top':
        return {
          top: rect.top - tooltipHeight - 10,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        }
      case 'right':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.right + 10
        }
      case 'left':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.left - tooltipWidth - 10
        }
      default:
        return { top: rect.bottom + 10, left: rect.left }
    }
  }

  if (!isActive || !isVisible || currentStep >= steps.length) return null

  const step = steps[currentStep]
  const position = getTooltipPosition(step.position, step.target)

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" />
      
      {/* Spotlight */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div 
          className="absolute bg-white/10 rounded-xl border-2 border-blue-400 shadow-lg animate-pulse"
          style={{
            ...(() => {
              const element = document.querySelector(`[data-tour="${step.target}"]`)
              if (!element) return {}
              const rect = element.getBoundingClientRect()
              return {
                top: rect.top - 4,
                left: rect.left - 4,
                width: rect.width + 8,
                height: rect.height + 8
              }
            })()
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in"
        style={{
          top: Math.max(10, Math.min(position.top, window.innerHeight - 250)),
          left: Math.max(10, Math.min(position.left, window.innerWidth - 330))
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{step.title}</h3>
            <button
              onClick={handleSkip}
              className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 mb-4">{step.content}</p>
          
          {step.action && (
            <button
              onClick={step.action.onClick}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-xl transition-colors duration-200 mb-4"
            >
              {step.action.text}
            </button>
          )}

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center px-4 py-2 rounded-xl font-medium transition-colors duration-200",
                currentStep === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OnboardingTooltips 