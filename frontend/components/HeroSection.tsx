'use client'

import { useRef, useEffect, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/Button'

interface Ripple {
  x: number
  y: number
  id: number
}

export default function HeroSection(): JSX.Element {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)
  const lastRippleTimeRef = useRef(0)

  useEffect(() => {
    // Initialize audio element
    if (typeof window !== 'undefined') {
      // URL encode the file path to handle spaces
      const audioPath = encodeURI('/Images/Blue Wren Audio.mp3')
      audioRef.current = new Audio(audioPath)
      audioRef.current.volume = 0.6
      audioRef.current.loop = false
      audioRef.current.preload = 'auto'
      
      // Load the audio (load() is synchronous, doesn't return a promise)
      try {
        audioRef.current.load()
      } catch (error) {
        console.error('Error loading audio:', error)
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleMouseEnter = (): void => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error: Error) => {
        // Browser autoplay policy - audio will only play after user interaction
        // This error is expected on first hover before any click/tap interaction
        // Once user has interacted with the page, audio will play on hover
        if (error.name !== 'NotAllowedError') {
          console.error('Error playing audio:', error)
        }
      })
    }
  }

  const handleMouseLeave = (): void => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    // Clear ripples when mouse leaves
    setRipples([])
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!videoContainerRef.current) return

    // Throttle ripple creation (max 1 every 100ms to be more visible)
    const now = Date.now()
    if (now - lastRippleTimeRef.current < 100) return
    lastRippleTimeRef.current = now

    const rect = videoContainerRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Create ripple effect
    const newRipple: Ripple = {
      x,
      y,
      id: rippleIdRef.current++,
    }

    setRipples((prev) => [...prev, newRipple])

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 1000)
  }

  return (
    <section 
      ref={videoContainerRef}
      className="relative bg-primary overflow-hidden min-h-[80vh] flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
      >
        <source src="/Images/hero wren.mp4" type="video/mp4" />
      </video>
      
      {/* Ripple effects container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[5] overflow-hidden">
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full bg-white/60 animate-ripple"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3)',
            }}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-primary/40 z-[1] pointer-events-none"></div>
      <Container className="relative z-10 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 text-balance drop-shadow-lg">
            Marketing guidance that feels human, not corporate
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 text-balance drop-shadow-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" variant="primary" className="!bg-white !text-primary hover:!bg-primary hover:!text-white">
              Get Started
            </Button>
            <Button href="/how-we-work" variant="outline" className="!border-2 !border-white !text-white hover:!bg-white hover:!text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}

