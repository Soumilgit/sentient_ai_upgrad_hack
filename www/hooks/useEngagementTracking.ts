'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface EngagementMetrics {
  scrollDepth: number
  timeOnPage: number
  clickCount: number
  pauseCount: number
  focusTime: number
  interactionRate: number
}

interface UseEngagementTrackingProps {
  onEngagementChange?: (metrics: EngagementMetrics) => void
  trackInterval?: number // in milliseconds
}

export function useEngagementTracking({
  onEngagementChange,
  trackInterval = 5000 // 5 seconds
}: UseEngagementTrackingProps = {}) {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    scrollDepth: 0,
    timeOnPage: 0,
    clickCount: 0,
    pauseCount: 0,
    focusTime: 0,
    interactionRate: 0
  })

  const [isTracking, setIsTracking] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [isUserActive, setIsUserActive] = useState(true)
  
  const startTime = useRef<number>(Date.now())
  const lastActivityTime = useRef<number>(Date.now())
  const scrollMax = useRef<number>(0)
  const interactionCount = useRef<number>(0)
  const pauseStartTime = useRef<number | null>(null)
  const focusStartTime = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Track scroll depth
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercentage = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0
    
    scrollMax.current = Math.max(scrollMax.current, scrollPercentage)
    
    setMetrics(prev => ({
      ...prev,
      scrollDepth: scrollMax.current
    }))
  }, [])

  // Track clicks
  const handleClick = useCallback(() => {
    interactionCount.current += 1
    lastActivityTime.current = Date.now()
    setIsUserActive(true)
    
    setMetrics(prev => ({
      ...prev,
      clickCount: interactionCount.current
    }))
  }, [])

  // Track keyboard activity
  const handleKeyPress = useCallback(() => {
    lastActivityTime.current = Date.now()
    setIsUserActive(true)
  }, [])

  // Track mouse movement
  const handleMouseMove = useCallback(() => {
    lastActivityTime.current = Date.now()
    setIsUserActive(true)
  }, [])

  // Track page visibility changes
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden
    setIsPageVisible(isVisible)
    
    if (isVisible) {
      focusStartTime.current = Date.now()
    } else {
      if (focusStartTime.current) {
        const focusDuration = Date.now() - focusStartTime.current
        setMetrics(prev => ({
          ...prev,
          focusTime: prev.focusTime + focusDuration
        }))
        focusStartTime.current = null
      }
    }
  }, [])

  // Track user activity
  useEffect(() => {
    if (!isTracking) return

    const checkActivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityTime.current
      
      // Consider user inactive after 30 seconds of no activity
      if (timeSinceLastActivity > 30000 && isUserActive) {
        setIsUserActive(false)
        pauseStartTime.current = now
      } else if (timeSinceLastActivity <= 30000 && !isUserActive && pauseStartTime.current) {
        // User became active again
        const pauseDuration = now - pauseStartTime.current
        setMetrics(prev => ({
          ...prev,
          pauseCount: prev.pauseCount + 1
        }))
        pauseStartTime.current = null
        setIsUserActive(true)
      }
    }

    const interval = setInterval(checkActivity, 1000)
    return () => clearInterval(interval)
  }, [isTracking, isUserActive])

  // Update metrics periodically
  useEffect(() => {
    if (!isTracking) return

    const updateMetrics = () => {
      const now = Date.now()
      const totalTime = now - startTime.current
      const activeTime = isUserActive && isPageVisible ? totalTime : metrics.focusTime
      const interactionRate = totalTime > 0 ? (interactionCount.current / (totalTime / 1000)) * 60 : 0 // interactions per minute

      setMetrics(prev => ({
        ...prev,
        timeOnPage: Math.floor(totalTime / 1000), // in seconds
        focusTime: activeTime,
        interactionRate
      }))

      // Call the callback if provided
      if (onEngagementChange) {
        onEngagementChange({
          scrollDepth: prev.scrollDepth,
          timeOnPage: Math.floor(totalTime / 1000),
          clickCount: interactionCount.current,
          pauseCount: prev.pauseCount,
          focusTime: activeTime,
          interactionRate
        })
      }
    }

    intervalRef.current = setInterval(updateMetrics, trackInterval)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTracking, isUserActive, isPageVisible, onEngagementChange, trackInterval, metrics.focusTime])

  // Start tracking
  const startTracking = useCallback(() => {
    setIsTracking(true)
    startTime.current = Date.now()
    lastActivityTime.current = Date.now()
    scrollMax.current = 0
    interactionCount.current = 0
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('click', handleClick, { passive: true })
    window.addEventListener('keydown', handleKeyPress, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }, [handleScroll, handleClick, handleKeyPress, handleMouseMove, handleVisibilityChange])

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false)
    
    // Remove event listeners
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('click', handleClick)
    window.removeEventListener('keydown', handleKeyPress)
    window.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [handleScroll, handleClick, handleKeyPress, handleMouseMove, handleVisibilityChange])

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      scrollDepth: 0,
      timeOnPage: 0,
      clickCount: 0,
      pauseCount: 0,
      focusTime: 0,
      interactionRate: 0
    })
    startTime.current = Date.now()
    lastActivityTime.current = Date.now()
    scrollMax.current = 0
    interactionCount.current = 0
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [stopTracking])

  return {
    metrics,
    isTracking,
    isUserActive,
    isPageVisible,
    startTracking,
    stopTracking,
    resetMetrics
  }
}
