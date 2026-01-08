'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'fade' | 'left' | 'right'
}

export default function AnimateOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: AnimateOnScrollProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
    
    if (isInViewport) {
      // If already visible, show immediately (with delay if specified)
      setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          // Unobserve after showing to prevent re-triggering
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [delay])

  const getDirectionClasses = (): string => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'opacity-0 translate-y-8'
        case 'down':
          return 'opacity-0 -translate-y-8'
        case 'left':
          return 'opacity-0 -translate-x-8'
        case 'right':
          return 'opacity-0 translate-x-8'
        case 'fade':
        default:
          return 'opacity-0'
      }
    }
    
    switch (direction) {
      case 'up':
        return 'animate-fade-in-up'
      case 'down':
        return 'animate-fade-in-down'
      case 'left':
        return 'animate-slide-in-left'
      case 'right':
        return 'animate-slide-in-right'
      case 'fade':
      default:
        return 'animate-fade-in'
    }
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  )
}

