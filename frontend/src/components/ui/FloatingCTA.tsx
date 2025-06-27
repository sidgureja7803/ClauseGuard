import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FloatingCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      
      // Show after scrolling 50% of viewport height
      setIsVisible(scrollPosition > windowHeight * 0.5 && !isDismissed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  if (!isVisible || isDismissed) return null

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 transition-all duration-500 transform',
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
    )}>
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        
        {/* Main button */}
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-sm">
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center text-xs transition-colors duration-200"
          >
            <X className="h-3 w-3" />
          </button>
          
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Try ClauseGuard Free</h4>
              <p className="text-xs text-gray-600">Upload your first contract</p>
            </div>
          </div>
          
          <Link
            to="/sign-up"
            className="block w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-center text-sm transition-all duration-300 transform hover:scale-105"
          >
            Get Started Now
          </Link>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}

export default FloatingCTA 