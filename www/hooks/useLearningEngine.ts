'use client'

import { useState, useEffect, useCallback } from 'react'
import { LearningEngine } from '@/lib/learning-engine'
import { User, LearningModule, LearningAnalytics } from '@/types'

interface UseLearningEngineProps {
  userId: string
}

export function useLearningEngine({ userId }: UseLearningEngineProps) {
  const [learningEngine, setLearningEngine] = useState<LearningEngine | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initEngine = async () => {
      try {
        setIsLoading(true)
        const engine = new LearningEngine({
          userId,
          sessionTimeout: 30, // 30 minutes
          maxContentLength: 2000,
          engagementThreshold: 0.7
        })
        
        setLearningEngine(engine)
        
        // Initialize user if needed
        const userData = await engine.initializeUser({
          id: userId,
          email: 'user@example.com',
          name: 'Learning User'
        })
        
        setUser(userData)
        
        // Load analytics
        const userAnalytics = await engine.getLearningAnalytics()
        setAnalytics(userAnalytics)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize learning engine')
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      initEngine()
    }
  }, [userId])

  const startLearningSession = useCallback(async (moduleId: string, sessionType: 'micro_learning' | 'assessment' | 'review' = 'micro_learning') => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    return await learningEngine.startLearningSession(moduleId, sessionType)
  }, [learningEngine])

  const endLearningSession = useCallback(async () => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    await learningEngine.endLearningSession()
  }, [learningEngine])

  const recordInteraction = useCallback(async (
    interactionType: 'click' | 'scroll' | 'answer' | 'pause' | 'resume',
    data: Record<string, any>
  ) => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    await learningEngine.recordInteraction(interactionType, data)
  }, [learningEngine])

  const generateContent = useCallback(async (
    topic: string,
    difficultyLevel: number,
    learningStyle: string
  ) => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    return await learningEngine.generatePersonalizedContent(topic, difficultyLevel, learningStyle)
  }, [learningEngine])

  const assessLearning = useCallback(async (
    answers: Array<{ questionId: string; answer: number; timeSpent: number }>,
    content: string
  ) => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    return await learningEngine.assessLearningOutcome(answers, content)
  }, [learningEngine])

  const analyzeEngagement = useCallback(async () => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    return await learningEngine.analyzeSessionEngagement()
  }, [learningEngine])

  const getRecommendation = useCallback(async () => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    return await learningEngine.getNextLearningRecommendation()
  }, [learningEngine])

  const updateProgress = useCallback(async (
    moduleId: string,
    progressPercentage: number,
    timeSpent: number,
    competenceScore: number,
    engagementScore: number
  ) => {
    if (!learningEngine) throw new Error('Learning engine not initialized')
    await learningEngine.updateUserProgress(moduleId, progressPercentage, timeSpent, competenceScore, engagementScore)
  }, [learningEngine])

  const refreshAnalytics = useCallback(async () => {
    if (!learningEngine) return
    
    try {
      const userAnalytics = await learningEngine.getLearningAnalytics()
      setAnalytics(userAnalytics)
    } catch (err) {
      console.error('Failed to refresh analytics:', err)
    }
  }, [learningEngine])

  return {
    learningEngine,
    user,
    analytics,
    isLoading,
    error,
    startLearningSession,
    endLearningSession,
    recordInteraction,
    generateContent,
    assessLearning,
    analyzeEngagement,
    getRecommendation,
    updateProgress,
    refreshAnalytics
  }
}
