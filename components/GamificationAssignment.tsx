'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Play, Pause, RotateCcw, Trophy, Star, Zap, Target, 
  Clock, CheckCircle, XCircle, Lightbulb, Gamepad2,
  Crown, Award, Flame, Rocket, Brain, BookOpen
} from 'lucide-react'
import { StudentScoringAlgorithm, StudentAnswer, ScoringSession, ScoringResult } from '../lib/scoring-algorithm'

interface GamifiedAssignment {
  id: string
  title: string
  description: string
  questions: GamifiedQuestion[]
  rewards: AssignmentRewards
  difficulty: string
  estimatedTime: number
  subject: string
  learningObjectives: string[]
  gamificationElements: GamificationElements
}

interface GamifiedQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'interactive'
  options?: string[]
  correctAnswer: string | number
  explanation: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  hints: string[]
  mediaUrl?: string
  interactiveElements?: InteractiveElement[]
}

interface AssignmentRewards {
  basePoints: number
  bonusPoints: number
  badges: string[]
  achievements: string[]
  streakMultiplier: number
}

interface GamificationElements {
  theme: string
  character: string
  powerUps: string[]
  challenges: string[]
  socialFeatures: string[]
}

interface InteractiveElement {
  type: 'drag_drop' | 'matching' | 'sequence' | 'simulation'
  data: any
  points: number
}

interface GamificationAssignmentProps {
  isOpen: boolean
  onClose: () => void
}

export default function GamificationAssignment({ isOpen, onClose }: GamificationAssignmentProps) {
  const [assignment, setAssignment] = useState<GamifiedAssignment | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({})
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [usedHints, setUsedHints] = useState<Set<string>>(new Set())
  const [powerUps, setPowerUps] = useState<string[]>(['hint', 'time_freeze', 'double_points'])
  const [usedPowerUps, setUsedPowerUps] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [badges, setBadges] = useState<string[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scoringAlgorithm = useRef(new StudentScoringAlgorithm())

  // Timer effect
  useEffect(() => {
    if (isPlaying && sessionStartTime) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000))
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, sessionStartTime])

  const generateAssignment = async () => {
    // Check if there's pre-generated content from the unified prompt
    const generatedContent = localStorage.getItem('generatedGamification')
    if (generatedContent) {
      try {
        const result = JSON.parse(generatedContent)
        if (result.success && result.assignment) {
          setAssignment(result.assignment)
          setCurrentQuestionIndex(0)
          setUserAnswers({})
          setShowResults(false)
          setTimeSpent(0)
          setStreak(0)
          setTotalScore(0)
          setBadges([])
          setUsedHints(new Set())
          setUsedPowerUps(new Set())
          console.log('Successfully loaded pre-generated assignment:', result.assignment.title)
          // Clear the stored content after using it
          localStorage.removeItem('generatedGamification')
          return
        }
      } catch (error) {
        console.error('Error parsing pre-generated gamification:', error)
      }
    }

    // Fallback to manual generation if no pre-generated content
    setIsGenerating(true)
    try {
      const response = await fetch('/api/gamification/generate-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'Machine Learning',
          difficulty: 'medium',
          subject: 'Computer Science',
          studentLevel: 'intermediate'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setAssignment(result.assignment)
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setShowResults(false)
        setTimeSpent(0)
        setStreak(0)
        setTotalScore(0)
        setBadges([])
        setUsedHints(new Set())
        setUsedPowerUps(new Set())
        console.log('Generated assignment:', result.assignment)
      } else {
        console.error('Failed to generate assignment')
      }
    } catch (error) {
      console.error('Error generating assignment:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const startAssignment = () => {
    setIsPlaying(true)
    setSessionStartTime(new Date())
  }

  const pauseAssignment = () => {
    setIsPlaying(false)
  }

  const submitAnswer = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }))
    
    // Check if answer is correct
    const currentQuestion = assignment?.questions[currentQuestionIndex]
    if (currentQuestion) {
      const isCorrect = answer === currentQuestion.correctAnswer
      if (isCorrect) {
        setStreak(prev => prev + 1)
        setTotalScore(prev => prev + currentQuestion.points)
      } else {
        setStreak(0)
      }
    }

    // Move to next question or show results
    if (assignment && currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowHint(false)
    } else {
      finishAssignment()
    }
  }

  const finishAssignment = () => {
    setIsPlaying(false)
    setShowResults(true)
    
    if (assignment) {
      // Calculate final score using the scoring algorithm
      const answers: StudentAnswer[] = assignment.questions.map((q, index) => ({
        questionId: q.id,
        isCorrect: userAnswers[q.id] === q.correctAnswer,
        timeSpent: timeSpent / assignment.questions.length, // Average time per question
        difficulty: q.difficulty,
        subject: assignment.subject,
        timestamp: new Date()
      }))

      const session: ScoringSession = {
        sessionId: assignment.id,
        studentId: 'current-user',
        answers,
        totalTimeSpent: timeSpent,
        sessionStartTime: sessionStartTime || new Date(),
        sessionEndTime: new Date()
      }

      const result = scoringAlgorithm.current.calculateScore(session)
      setScoringResult(result)
      
      // Award badges based on performance
      const newBadges: string[] = []
      if (result.accuracy >= 0.9) newBadges.push('Perfectionist')
      if (result.currentStreak >= 5) newBadges.push('Streak Master')
      if (result.totalScore >= 200) newBadges.push('High Scorer')
      if (timeSpent < 300) newBadges.push('Speed Demon') // Less than 5 minutes
      
      setBadges(prev => [...prev, ...newBadges])
    }
  }

  const usePowerUp = (powerUp: string) => {
    if (usedPowerUps.has(powerUp)) return
    
    setUsedPowerUps(prev => new Set([...prev, powerUp]))
    
    switch (powerUp) {
      case 'hint':
        setShowHint(true)
        break
      case 'time_freeze':
        // Implement time freeze logic
        break
      case 'double_points':
        // Implement double points logic
        break
    }
  }

  const resetAssignment = () => {
    setAssignment(null)
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowResults(false)
    setIsPlaying(false)
    setTimeSpent(0)
    setSessionStartTime(null)
    setScoringResult(null)
    setStreak(0)
    setTotalScore(0)
    setBadges([])
    setUsedHints(new Set())
    setUsedPowerUps(new Set())
  }

  const currentQuestion = assignment?.questions[currentQuestionIndex]

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gamified Assignment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!assignment ? (
          // Assignment Generator
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8">
              <Gamepad2 className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Gamified Assignment</h3>
              <p className="text-gray-600 mb-6">
                Generate an interactive, gamified assignment with points, badges, and achievements!
              </p>
              <button
                onClick={generateAssignment}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Generate Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        ) : showResults ? (
          // Results Screen
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Assignment Complete!</h3>
              <p className="text-gray-600">Great job on your learning journey!</p>
            </div>

            {scoringResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{scoringResult.totalScore}</div>
                  <div className="text-sm opacity-90">Total Score</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-xl p-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{Math.round(scoringResult.accuracy * 100)}%</div>
                  <div className="text-sm opacity-90">Accuracy</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 text-center">
                  <Flame className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{scoringResult.currentStreak}</div>
                  <div className="text-sm opacity-90">Best Streak</div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4">🏆 Badges Earned</h4>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {scoringResult && (
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-2">💬 Motivational Message</h4>
                <p className="text-gray-700">{scoringResult.motivationalMessage}</p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={resetAssignment}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                New Assignment
              </button>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          // Assignment Playing Screen
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {assignment.questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Flame className="w-4 h-4" />
                  {streak} streak
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4" />
                  {totalScore} pts
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / assignment.questions.length) * 100}%` }}
              />
            </div>

            {/* Power-ups */}
            <div className="flex gap-2">
              {powerUps.map((powerUp) => (
                <button
                  key={powerUp}
                  onClick={() => usePowerUp(powerUp)}
                  disabled={usedPowerUps.has(powerUp)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    usedPowerUps.has(powerUp)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  }`}
                >
                  {powerUp.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {/* Question */}
            {currentQuestion && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex-1">
                    {currentQuestion.question}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {currentQuestion.points} pts
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>

                {/* Hint */}
                {showHint && currentQuestion.hints.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800">Hint:</h5>
                        <p className="text-yellow-700">{currentQuestion.hints[0]}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => submitAnswer(currentQuestion.id, index)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-medium text-gray-700">{option}</span>
                      </button>
                    ))
                  )}
                  
                  {currentQuestion.type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => submitAnswer(currentQuestion.id, true)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                      >
                        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <span className="font-medium text-gray-700">True</span>
                      </button>
                      <button
                        onClick={() => submitAnswer(currentQuestion.id, false)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center"
                      >
                        <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                        <span className="font-medium text-gray-700">False</span>
                      </button>
                    </div>
                  )}

                  {(currentQuestion.type === 'fill_blank' || currentQuestion.type === 'subjective') && (
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          value={userAnswers[currentQuestion.id] || ''}
                          onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                          placeholder="Type your answer here..."
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                        />
                      </div>
                      <button
                        onClick={() => submitAnswer(currentQuestion.id, userAnswers[currentQuestion.id] || '')}
                        disabled={!userAnswers[currentQuestion.id]?.trim()}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between">
              <button
                onClick={pauseAssignment}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
              
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
