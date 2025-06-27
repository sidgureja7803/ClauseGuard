import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient' | 'interactive'
  hover?: boolean
  glow?: boolean
  shimmer?: boolean
  className?: string
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = false,
  glow = false,
  shimmer = false,
  className,
  children
}) => {
  const baseClasses = 'rounded-3xl overflow-hidden transition-all duration-500'
  
  const variants = {
    default: 'bg-white border border-gray-200 shadow-lg',
    elevated: 'bg-white shadow-2xl border border-gray-100',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-gray-100 shadow-xl',
    interactive: 'bg-white border border-gray-200 shadow-lg hover:shadow-2xl cursor-pointer'
  }
  
  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-2xl' : ''
  const glowClasses = glow ? 'glow-effect' : ''
  const shimmerClasses = shimmer ? 'premium-card' : ''
  
  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        hoverClasses,
        glowClasses,
        shimmerClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card 