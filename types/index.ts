export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  competence_level?: number
  engagement_score?: number
}

export interface LearningModule {
  id: string
  title: string
  description: string
  content: string
  difficulty_level: number
  estimated_duration: number
  prerequisites: string[]
  learning_objectives: string[]
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  module_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_percentage: number
  time_spent: number
  last_accessed: string
  competence_score: number
  engagement_score: number
  created_at: string
  updated_at: string
}

export interface LearningSession {
  id: string
  user_id: string
  module_id: string
  session_type: 'micro_learning' | 'assessment' | 'review'
  duration: number
  interactions: Interaction[]
  competence_gained: number
  engagement_level: number
  completed_at: string
  created_at: string
}

export interface Interaction {
  id: string
  session_id: string
  interaction_type: 'click' | 'scroll' | 'answer' | 'pause' | 'resume'
  timestamp: number
  data: Record<string, any>
  created_at: string
}

export interface CompetenceProfile {
  id: string
  user_id: string
  skill_area: string
  current_level: number
  confidence_score: number
  last_assessed: string
  learning_velocity: number
  created_at: string
  updated_at: string
}

export interface LearningContent {
  content: string
  questions: LearningQuestion[]
  nextSteps: string[]
  estimatedDuration: number
}

export interface LearningQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface LearningAnalytics {
  totalModulesCompleted: number
  averageCompetenceScore: number
  averageEngagementScore: number
  totalLearningTime: number
  learningStreak: number
}

export interface EngagementAnalysis {
  engagementScore: number
  attentionPatterns: string[]
  recommendations: string[]
}

export interface LearningPathRecommendation {
  nextModule: string
  difficultyAdjustment: number
  learningStyleAdjustment: string
  estimatedTime: number
  reasoning: string
}
