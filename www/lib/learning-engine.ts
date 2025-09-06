import { supabase, User, LearningModule, UserProgress, LearningSession, CompetenceProfile } from './supabase'
import { generateLearningContent, assessCompetence } from './groq'
import { analyzeEngagement, recommendLearningPath, generatePersonalizedContent } from './gemini'

export interface LearningEngineConfig {
  userId: string
  sessionTimeout: number // in minutes
  maxContentLength: number
  engagementThreshold: number
}

export class LearningEngine {
  private config: LearningEngineConfig
  private currentSession: LearningSession | null = null

  constructor(config: LearningEngineConfig) {
    this.config = config
  }

  async initializeUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCurrentCompetence(skillArea: string): Promise<number> {
    const { data, error } = await supabase
      .from('competence_profiles')
      .select('current_level')
      .eq('user_id', this.config.userId)
      .eq('skill_area', skillArea)
      .single()

    if (error || !data) return 0
    return data.current_level
  }

  async updateCompetence(skillArea: string, newLevel: number, confidence: number): Promise<void> {
    const { error } = await supabase
      .from('competence_profiles')
      .upsert({
        user_id: this.config.userId,
        skill_area: skillArea,
        current_level: newLevel,
        confidence_score: confidence,
        last_assessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  }

  async startLearningSession(moduleId: string, sessionType: 'micro_learning' | 'assessment' | 'review'): Promise<LearningSession> {
    const { data: session, error } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: this.config.userId,
        module_id: moduleId,
        session_type: sessionType,
        duration: 0,
        interactions: [],
        competence_gained: 0,
        engagement_level: 0
      })
      .select()
      .single()

    if (error) throw error
    this.currentSession = session
    return session
  }

  async endLearningSession(): Promise<void> {
    if (!this.currentSession) return

    const { error } = await supabase
      .from('learning_sessions')
      .update({
        completed_at: new Date().toISOString(),
        duration: Math.floor((Date.now() - new Date(this.currentSession.created_at).getTime()) / 1000)
      })
      .eq('id', this.currentSession.id)

    if (error) throw error
    this.currentSession = null
  }

  async recordInteraction(
    interactionType: 'click' | 'scroll' | 'answer' | 'pause' | 'resume',
    data: Record<string, any>
  ): Promise<void> {
    if (!this.currentSession) return

    const { error } = await supabase
      .from('interactions')
      .insert({
        session_id: this.currentSession.id,
        interaction_type: interactionType,
        timestamp: Math.floor((Date.now() - new Date(this.currentSession.created_at).getTime()) / 1000),
        data
      })

    if (error) throw error
  }

  async generatePersonalizedContent(
    topic: string,
    difficultyLevel: number,
    learningStyle: string
  ): Promise<{ content: string; questions: any[]; nextSteps: string[]; estimatedDuration: number }> {
    const currentCompetence = await this.getCurrentCompetence(topic)
    
    return await generateLearningContent({
      topic,
      difficultyLevel,
      learningStyle,
      currentCompetence
    })
  }

  async assessLearningOutcome(
    answers: Array<{ questionId: string; answer: number; timeSpent: number }>,
    content: string
  ): Promise<{ competenceScore: number; areasForImprovement: string[] }> {
    return await assessCompetence(answers, content)
  }

  async analyzeSessionEngagement(): Promise<{ engagementScore: number; attentionPatterns: string[]; recommendations: string[] }> {
    if (!this.currentSession) {
      throw new Error('No active session')
    }

    const { data: interactions, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('session_id', this.currentSession.id)
      .order('timestamp')

    if (error) throw error

    return await analyzeEngagement(
      interactions.map(i => ({
        type: i.interaction_type,
        timestamp: i.timestamp,
        data: i.data
      })),
      this.currentSession.duration
    )
  }

  async getNextLearningRecommendation(): Promise<{
    nextModule: string
    difficultyAdjustment: number
    learningStyleAdjustment: string
    estimatedTime: number
    reasoning: string
  }> {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.config.userId)
      .single()

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.config.userId)

    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('engagement_level')
      .eq('user_id', this.config.userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: modules } = await supabase
      .from('learning_modules')
      .select('id, title, difficulty_level, prerequisites')

    return await recommendLearningPath(
      {
        currentCompetence: user?.competence_level || 0,
        learningStyle: user?.learning_style || 'visual',
        engagementHistory: sessions?.map(s => s.engagement_level) || [],
        completedModules: progress?.filter(p => p.status === 'completed').map(p => p.module_id) || []
      },
      modules || []
    )
  }

  async updateUserProgress(
    moduleId: string,
    progressPercentage: number,
    timeSpent: number,
    competenceScore: number,
    engagementScore: number
  ): Promise<void> {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: this.config.userId,
        module_id: moduleId,
        progress_percentage: progressPercentage,
        time_spent: timeSpent,
        last_accessed: new Date().toISOString(),
        competence_score: competenceScore,
        engagement_score: engagementScore,
        status: progressPercentage >= 100 ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  }

  async getLearningAnalytics(): Promise<{
    totalModulesCompleted: number
    averageCompetenceScore: number
    averageEngagementScore: number
    totalLearningTime: number
    learningStreak: number
  }> {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.config.userId)

    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', this.config.userId)

    const completedModules = progress?.filter(p => p.status === 'completed') || []
    const totalLearningTime = sessions?.reduce((sum, s) => sum + s.duration, 0) || 0

    return {
      totalModulesCompleted: completedModules.length,
      averageCompetenceScore: completedModules.reduce((sum, p) => sum + p.competence_score, 0) / Math.max(completedModules.length, 1),
      averageEngagementScore: completedModules.reduce((sum, p) => sum + p.engagement_score, 0) / Math.max(completedModules.length, 1),
      totalLearningTime,
      learningStreak: this.calculateLearningStreak(sessions || [])
    }
  }

  private calculateLearningStreak(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0

    const today = new Date()
    const sessionDates = sessions
      .map(s => new Date(s.created_at).toDateString())
      .sort()
      .reverse()

    let streak = 0
    let currentDate = new Date(today)

    for (const dateStr of sessionDates) {
      const sessionDate = new Date(dateStr)
      const diffTime = currentDate.getTime() - sessionDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 1) {
        streak++
        currentDate = sessionDate
      } else {
        break
      }
    }

    return streak
  }
}
