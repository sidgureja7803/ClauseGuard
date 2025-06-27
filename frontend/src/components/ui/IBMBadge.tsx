import React from 'react'
import { Cpu, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IBMBadgeProps {
  variant?: 'default' | 'small' | 'large'
  className?: string
  showAnimation?: boolean
}

const IBMBadge: React.FC<IBMBadgeProps> = ({ 
  variant = 'default', 
  className = '',
  showAnimation = true 
}) => {
  const variants = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  }

  return (
    <div className={cn(
      'inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full font-medium shadow-lg border border-blue-500/30',
      variants[variant],
      showAnimation && 'hover:scale-105 transition-transform duration-300',
      className
    )}>
      <div className="relative mr-2">
        <Cpu className={cn(
          'text-blue-200',
          variant === 'small' ? 'h-3 w-3' : variant === 'large' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
        {showAnimation && (
          <Sparkles className={cn(
            'absolute -top-1 -right-1 text-yellow-300 animate-pulse',
            variant === 'small' ? 'h-2 w-2' : 'h-3 w-3'
          )} />
        )}
      </div>
      <span className="whitespace-nowrap">
        Powered by <strong>IBM Granite AI</strong>
      </span>
    </div>
  )
}

export default IBMBadge 