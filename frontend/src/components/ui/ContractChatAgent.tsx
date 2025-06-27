import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Bot, User, FileText, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import IBMBadge from './IBMBadge'

interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  suggestions?: string[]
  contractRef?: string
}

interface ContractChatAgentProps {
  contractId?: string
  contractTitle?: string
  onClose?: () => void
}

const ContractChatAgent: React.FC<ContractChatAgentProps> = ({
  contractId,
  contractTitle = "Software License Agreement",
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: `Hello! I'm your AI contract assistant powered by IBM Granite. I've analyzed your "${contractTitle}" and I'm ready to answer any questions you have about it. What would you like to know?`,
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const predefinedResponses = {
    "risk": {
      content: "I've identified several key risks in this contract:\n\n**High Risk:**\n• Unlimited liability clause in Section 5 - This exposes you to potentially unlimited damages\n• Broad liability exclusion in Section 2 - May be unenforceable in some jurisdictions\n\n**Medium Risk:**\n• 90-day payment terms - Longer than industry standard of 30 days\n• Non-exclusive license - Licensor can grant similar licenses to competitors\n\nWould you like me to explain any of these risks in more detail?",
      suggestions: ["Explain unlimited liability", "How to negotiate payment terms", "What makes a clause unenforceable?"]
    },
    "liability": {
      content: "The liability clauses in this contract are quite one-sided:\n\n**Section 2 - Liability Limitation:**\nThe licensor excludes ALL indirect, incidental, and consequential damages. This is extremely broad and may not hold up in court.\n\n**Section 5 - Indemnification:**\nYou (licensee) must indemnify the licensor for ANY claims, with NO reciprocal protection. This creates unlimited liability exposure.\n\n**Recommendation:** Negotiate for mutual indemnification and reasonable liability caps.",
      suggestions: ["What's a reasonable liability cap?", "How to add mutual indemnification", "Examples of enforceable liability clauses"]
    },
    "payment": {
      content: "The payment terms in Section 4 include:\n\n• **90-day payment period** - This is longer than the standard 30 days\n• **2% monthly penalty fee** - This compounds to 24% annually, which is quite high\n• **No early payment discounts** - Missing opportunity for cost savings\n\n**Industry Standard:** Most software licenses have 30-day NET terms with 1-1.5% monthly late fees.\n\n**Suggestion:** Counter-propose 30-day terms with 1.5% monthly penalties and request a 2% early payment discount.",
      suggestions: ["Calculate penalty costs", "Draft payment term counter-proposal", "What are typical software payment terms?"]
    },
    "unusual": {
      content: "I've found several unusual clauses that warrant attention:\n\n**1. Automatic Renewal (Section 3):**\nContract auto-renews with only 30-day notice to terminate - consider longer notice periods\n\n**2. No Source Code Escrow:**\nMissing protection if vendor goes out of business\n\n**3. Unlimited Audit Rights:**\nLicensor can audit your usage anytime with just 10 days notice\n\n**4. Governing Law:**\nSubject to licensor's state law - consider neutral jurisdiction\n\nThese clauses favor the licensor significantly. Would you like strategies to negotiate any of these?",
      suggestions: ["How to negotiate audit rights", "What is source code escrow?", "Propose governing law changes"]
    }
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
    setInputValue('')
    setIsTyping(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simple keyword matching for demo
    const input = inputValue.toLowerCase()
    let response = predefinedResponses.risk // default

    if (input.includes('risk') || input.includes('danger') || input.includes('problem')) {
      response = predefinedResponses.risk
    } else if (input.includes('liability') || input.includes('liable') || input.includes('damage')) {
      response = predefinedResponses.liability
    } else if (input.includes('payment') || input.includes('pay') || input.includes('fee') || input.includes('money')) {
      response = predefinedResponses.payment
    } else if (input.includes('unusual') || input.includes('strange') || input.includes('weird') || input.includes('different')) {
      response = predefinedResponses.unusual
    }

    const agentMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'agent',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
      contractRef: contractTitle
    }

    setIsTyping(false)
    setMessages(prev => [...prev, agentMessage])
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
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.suggestions && (
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

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500">Quick actions:</span>
          <button 
            onClick={() => handleSuggestionClick("Summarize this contract")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors duration-200"
          >
            📄 Summarize
          </button>
          <button 
            onClick={() => handleSuggestionClick("Find all risks")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors duration-200"
          >
            ⚠️ Find Risks
          </button>
          <button 
            onClick={() => handleSuggestionClick("Suggest improvements")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg transition-colors duration-200"
          >
            💡 Improve
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about this contract..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Sparkles className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              "p-3 rounded-2xl transition-all duration-200",
              inputValue.trim() && !isTyping
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
          <MessageSquare className="h-3 w-3 mr-1" />
          Powered by IBM Granite AI • Enterprise-grade contract analysis
        </div>
      </div>
    </div>
  )
}

export default ContractChatAgent 