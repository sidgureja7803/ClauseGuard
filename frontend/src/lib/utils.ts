import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getRiskColor = (risk: 'safe' | 'review' | 'risky') => {
  switch (risk) {
    case 'safe':
      return 'text-green-700 bg-green-100'
    case 'review':
      return 'text-yellow-700 bg-yellow-100'
    case 'risky':
      return 'text-red-700 bg-red-100'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}

export const getRiskIcon = (risk: 'safe' | 'review' | 'risky') => {
  switch (risk) {
    case 'safe':
      return '✅'
    case 'review':
      return '🟠'
    case 'risky':
      return '🔴'
    default:
      return '⚪'
  }
} 