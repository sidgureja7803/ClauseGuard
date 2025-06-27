import React, { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: string
  duration?: number
  className?: string
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  className = ''
}) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Extract numeric value from string (e.g., "10,000+" -> 10000)
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOutCubic * numericValue))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, numericValue, duration])

  // Format the count with original formatting
  const formatCount = (count: number) => {
    if (value.includes(',')) {
      return count.toLocaleString() + value.replace(/[0-9,]/g, '')
    }
    return count + value.replace(/[0-9]/g, '')
  }

  return (
    <span ref={ref} className={className}>
      {formatCount(count)}
    </span>
  )
}

export default AnimatedCounter 