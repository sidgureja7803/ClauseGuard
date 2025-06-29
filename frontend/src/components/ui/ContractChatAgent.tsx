import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Bot, User, FileText, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import IBMBadge from './IBMBadge'

// Extend window interface for Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>
      }
    }
  }
}

interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  suggestions?: string[]
  contractRef?: string
  isLoading?: boolean
}

interface ContractChatAgentProps {
  contractId?: string
  contractTitle?: string
  onClose?: () => void
}

const ContractChatAgent: React.FC<ContractChatAgentProps> = ({
  contractId,
  contractTitle = "Contract Analysis",
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: `Hello! I'm your AI contract assistant powered by IBM Granite. I'm ready to help you analyze and understand your "${contractTitle}". What would you like to know?`,
      timestamp: new Date(),
      suggestions: [
        "What are the main risks in this contract?",
        "Explain the liability clauses",
        "What are the payment terms?",
        "Are there any unusual clauses?"
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string>(`chat_${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get auth token helper
  const getAuthToken = async (): Promise<string> => {
    try {
      if (window.Clerk?.session?.getToken) {
        return await window.Clerk.session.getToken()
      }
    } catch (error) {
      console.warn('Could not get auth token:', error)
    }
    return ''
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsTyping(true)

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'agent',
      content: 'Analyzing your question with IBM Granite AI...',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // Get auth token
      const authToken = await getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      // For first message, start new analysis
      if (messages.length === 1) {
        const analysisResponse = await fetch('/api/contract-agent/analyze', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contractText: `Sample contract content for analysis. User question: ${currentInput}`,
            userGoal: currentInput,
            sessionId
          })
        })

        if (!analysisResponse.ok) {
          throw new Error(`Analysis failed: ${analysisResponse.statusText}`)
        }

        const analysisResult = await analysisResponse.json()
        
        // Remove loading message and add real response
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isLoading)
          return [...withoutLoading, {
            id: (Date.now() + 2).toString(),
            type: 'agent',
            content: analysisResult.data?.result?.summary || analysisResult.data?.response || 'Analysis completed. How can I help you understand this contract better?',
            timestamp: new Date(),
            suggestions: [
              "Tell me about specific risks",
              "How can I improve this contract?",
              "What should I negotiate?",
              "Are there any red flags?"
            ],
            contractRef: contractTitle
          }]
        })
      } else {
        // Continue existing conversation
        const continueResponse = await fetch('/api/contract-agent/continue', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
            followUpQuestion: currentInput
          })
        })

        if (!continueResponse.ok) {
          throw new Error(`Continue conversation failed: ${continueResponse.statusText}`)
        }

        const continueResult = await continueResponse.json()
        
        // Remove loading message and add real response
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isLoading)
          return [...withoutLoading, {
            id: (Date.now() + 2).toString(),
            type: 'agent',
            content: continueResult.data?.response || 'I understand your question. Let me provide more details.',
            timestamp: new Date(),
            suggestions: generateSuggestions(currentInput),
            contractRef: contractTitle
          }]
        })
      }

    } catch (error) {
      console.error('Chat API error:', error)
      
      // Remove loading message and add error fallback
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        return [...withoutLoading, {
          id: (Date.now() + 2).toString(),
          type: 'agent',
          content: `I'm having trouble connecting to the AI service right now. This might be because:\n\n• The IBM Granite AI service needs to be configured\n• Network connectivity issues\n• API rate limits\n\nPlease try again in a moment, or contact support if the issue persists.`,
          timestamp: new Date(),
          suggestions: [
            "Try asking again",
            "Check system status",
            "Contact support"
          ]
        }]
      })
    } finally {
      setIsTyping(false)
    }
  }

  const generateSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase()
    
    if (input.includes('risk') || input.includes('danger') || input.includes('problem')) {
      return [
        "How can I mitigate these risks?",
        "What's the likelihood of these risks?",
        "Show me specific risky clauses",
        "Compare to industry standards"
      ]
    } else if (input.includes('liability') || input.includes('damage')) {
      return [
        "What's a reasonable liability cap?",
        "How to negotiate mutual liability?",
        "Examples of better liability clauses",
        "Industry standard liability terms"
      ]
    } else if (input.includes('payment') || input.includes('money') || input.includes('fee')) {
      return [
        "Calculate total payment costs",
        "Negotiate better payment terms",
        "Industry standard payment periods",
        "What about late payment penalties?"
      ]
    } else {
      return [
        "Tell me more about this",
        "What are the implications?",
        "How should I respond?",
        "What are my options?"
      ]
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="h-8 w-8 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Contract AI Assistant</h3>
              <p className="text-blue-100 text-sm">Analyzing: {contractTitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <IBMBadge variant="small" className="bg-white/20 text-white border-white/30" />
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn(
            "flex items-start space-x-3",
            message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
            )}>
              {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4",
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-900'
            )}>
              {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Analyzing with IBM Granite AI...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
              
              {message.suggestions && !message.isLoading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Suggested follow-ups:
                  </div>
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-sm bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-xl p-3 transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              <div className={cn(
                "text-xs mt-2 opacity-70",
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about this contract..."
            disabled={isTyping}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors duration-200"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
          <Sparkles className="h-3 w-3 mr-1" />
          Powered by IBM Granite AI • Enterprise-grade contract analysis
        </div>
      </div>
    </div>
  )
}

export default ContractChatAgent 