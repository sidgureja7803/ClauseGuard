import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  isLoading?: boolean
  glow?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  glow = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-primary-500/20',
    secondary: 'bg-white hover:bg-gray-50 text-primary-600 border-2 border-primary-200 hover:border-primary-300 shadow-md hover:shadow-lg focus:ring-primary-500/20',
    ghost: 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:ring-gray-500/20',
    outline: 'bg-transparent border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500/20',
    gradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500/20'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }
  
  const glowClasses = glow ? 'animate-pulse-glow' : ''
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        glowClasses,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      
      {Icon && iconPosition === 'left' && !isLoading && (
        <Icon className={cn('h-5 w-5', children ? 'mr-2' : '')} />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !isLoading && (
        <Icon className={cn('h-5 w-5', children ? 'ml-2' : '', 'group-hover:translate-x-1 transition-transform duration-300')} />
      )}
    </button>
  )
}

export default Button 