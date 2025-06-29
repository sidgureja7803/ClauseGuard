import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import LoadingSpinner from './LoadingSpinner'

interface AgentStep {
  stepId: string
  stepType: string
  stepName: string
  agentDecision: string
  reasoning: string
  confidence: number
  startTime: string
  endTime: string
}

interface AgentChatProps {
  agentSteps: AgentStep[]
  analysisResult?: any
  onFeedback?: (stepId: string, feedback: string) => void
  className?: string
}

interface ChatMessage {
  id: string
  type: 'agent' | 'user' | 'system'
  content: string
  timestamp: Date
  stepId?: string
  confidence?: number
}

const AgentChatInterface: React.FC<AgentChatProps> = ({
  agentSteps = [],
  analysisResult,
  onFeedback,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Convert agent steps to chat messages
    const chatMessages: ChatMessage[] = []

    // Welcome message
    chatMessages.push({
      id: 'welcome',
      type: 'system',
      content: '🤖 ClauseGuard AI Agent is analyzing your contract...',
      timestamp: new Date()
    })

    // Convert each agent step to a chat message
    agentSteps.forEach((step, index) => {
      chatMessages.push({
        id: step.stepId,
        type: 'agent',
        content: `**${step.stepName}**: ${step.agentDecision}`,
        timestamp: new Date(step.startTime),
        stepId: step.stepId,
        confidence: step.confidence
      })

      // Add reasoning as a follow-up message
      if (step.reasoning) {
        chatMessages.push({
          id: `${step.stepId}_reasoning`,
          type: 'agent',
          content: `💭 *Reasoning*: ${step.reasoning}`,
          timestamp: new Date(step.startTime),
          stepId: step.stepId
        })
      }
    })

    // Final analysis message
    if (analysisResult) {
      chatMessages.push({
        id: 'final_result',
        type: 'agent',
        content: `✅ **Analysis Complete!** 
        
Risk Level: **${analysisResult.overallRisk?.toUpperCase()}**
Confidence: **${Math.round((analysisResult.confidence || 0.8) * 100)}%**
Clauses Analyzed: **${analysisResult.clauses?.length || 0}**

${analysisResult.summary}`,
        timestamp: new Date(),
        confidence: analysisResult.confidence
      })
    }

    setMessages(chatMessages)
  }, [agentSteps, analysisResult])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: userInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsTyping(true)

    // Simulate agent response (in production, call agent API)
    setTimeout(() => {
      const agentResponse: ChatMessage = {
        id: `agent_${Date.now()}`,
        type: 'agent',
        content: `I understand your question: "${userInput}". Based on the analysis I performed, let me provide more details about the specific aspects you're interested in.`,
        timestamp: new Date(),
        confidence: 0.85
      }

      setMessages(prev => [...prev, agentResponse])
      setIsTyping(false)
    }, 2000)
  }

  const handleFeedback = (stepId: string, feedback: 'helpful' | 'not_helpful') => {
    if (onFeedback) {
      onFeedback(stepId, feedback)
    }

    // Add feedback acknowledgment
    const feedbackMessage: ChatMessage = {
      id: `feedback_${Date.now()}`,
      type: 'system',
      content: `Thank you for your feedback! I'll use this to improve future analyses.`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, feedbackMessage])
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'prioritization': return '🧠'
      case 'extraction': return '📄'
      case 'risk_tagging': return '⚠️'
      case 'clause_suggestion': return '✏️'
      case 'summary': return '📋'
      default: return '🔍'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('flex flex-col h-96 bg-white rounded-xl shadow-sm border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">ClauseGuard AI Agent</h3>
            <p className="text-sm text-gray-500">Contract Analysis Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-gray-500">AI-Powered</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start space-x-3',
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.type !== 'user' && (
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
                message.type === 'agent' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              )}>
                {message.type === 'agent' ? <Bot className="h-4 w-4" /> : '🔔'}
              </div>
            )}
            
            <div className={cn(
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
              message.type === 'user' 
                ? 'bg-blue-500 text-white ml-auto'
                : message.type === 'agent'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            )}>
              <div className="text-sm whitespace-pre-line">
                {message.content}
              </div>
              
              {message.confidence && (
                <div className="mt-2 flex items-center justify-between">
                  <span className={cn('text-xs', getConfidenceColor(message.confidence))}>
                    Confidence: {Math.round(message.confidence * 100)}%
                  </span>
                  
                  {message.stepId && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFeedback(message.stepId!, 'helpful')}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        title="Helpful"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.stepId!, 'not_helpful')}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Not helpful"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-600">Agent is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask the agent about your contract analysis..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isTyping}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ask questions about the analysis or provide feedback to help the agent learn
        </p>
      </div>
    </div>
  )
}

export default AgentChatInterface 