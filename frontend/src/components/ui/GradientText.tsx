import React from 'react'
import { cn } from '@/lib/utils'

interface GradientTextProps {
  children: React.ReactNode
  gradient?: 'primary' | 'secondary' | 'rainbow' | 'sunset' | 'ocean'
  animated?: boolean
  className?: string
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = 'primary',
  animated = false,
  className
}) => {
  const gradients = {
    primary: 'from-primary-600 via-blue-600 to-purple-600',
    secondary: 'from-purple-600 via-pink-600 to-red-600',
    rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
    sunset: 'from-orange-500 via-pink-500 to-purple-600',
    ocean: 'from-blue-600 via-cyan-500 to-teal-500'
  }

  const animatedClasses = animated ? 'animate-gradient' : ''

  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradients[gradient],
        animatedClasses,
        className
      )}
    >
      {children}
    </span>
  )
}

export default GradientText 