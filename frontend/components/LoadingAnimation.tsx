'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingAnimation(): JSX.Element | null {
  const [shouldShow, setShouldShow] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark as mounted
    setMounted(true)

    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if loader has been shown in this session
    const hasShownLoader = sessionStorage.getItem('loaderShown')
    
    if (hasShownLoader === 'true') {
      // Already shown, don't show again
      setShouldShow(false)
      return
    }

    // Mark as shown immediately to prevent multiple instances
    sessionStorage.setItem('loaderShown', 'true')
    
    // Show the loader
    setShouldShow(true)
    
    // Start fade out after 5 seconds
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 5000)

    // Remove from DOM after fade out completes
    const hideTimer = setTimeout(() => {
      setShouldShow(false)
    }, 5500) // 5000ms + 500ms fade out duration

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  // Don't render anything until mounted (prevents SSR/hydration issues)
  if (!mounted || !shouldShow) return null

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="animate-fade-in">
        <Image
          src="/Images/logo.png"
          alt="Splendid Wren Marketing"
          width={300}
          height={133}
          className="h-auto w-auto max-w-[300px]"
          priority
        />
      </div>
    </div>
  )
}
