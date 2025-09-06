'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  CheckCircle, 
  Brain,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import QuestionCard from '@/components/QuestionCard'
import ProgressBar from '@/components/ProgressBar'

interface LearningContent {
  content: string
  questions: Array<{
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>
  nextSteps: string[]
  estimatedDuration: number
}

interface UserAnswer {
  questionId: string
  answer: number
  timeSpent: number
}

export default function LearnModulePage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  const [currentStep, setCurrentStep] = useState<'content' | 'questions' | 'complete'>('content')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Simulate loading learning content
    setTimeout(() => {
      setLearningContent({
        content: `# Introduction to Machine Learning

Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.

## Key Concepts

**Supervised Learning**: Learning with labeled examples. The algorithm learns from input-output pairs to make predictions on new data.

**Unsupervised Learning**: Finding hidden patterns in data without labeled examples. Common techniques include clustering and dimensionality reduction.

**Reinforcement Learning**: Learning through interaction with an environment, receiving rewards or penalties for actions.

## Real-World Applications

- **Recommendation Systems**: Netflix, Amazon, Spotify
- **Image Recognition**: Medical diagnosis, autonomous vehicles
- **Natural Language Processing**: Chatbots, translation services
- **Financial Services**: Fraud detection, algorithmic trading

## Getting Started

To begin your ML journey, you'll need to understand:
1. Basic statistics and probability
2. Programming fundamentals (Python recommended)
3. Data manipulation and visualization
4. Linear algebra basics

The field is constantly evolving, making it an exciting area for continuous learning and innovation.`,
        questions: [
          {
            id: 'q1',
            question: 'What is the main difference between supervised and unsupervised learning?',
            options: [
              'Supervised learning uses labeled data, unsupervised learning finds patterns without labels',
              'Supervised learning is faster than unsupervised learning',
              'Unsupervised learning requires more computational power',
              'There is no difference between the two approaches'
            ],
            correctAnswer: 0,
            explanation: 'Supervised learning learns from labeled examples (input-output pairs), while unsupervised learning discovers hidden patterns in data without labeled examples.'
          },
          {
            id: 'q2',
            question: 'Which of the following is NOT a common application of machine learning?',
            options: [
              'Recommendation systems',
              'Image recognition',
              'Manual data entry',
              'Fraud detection'
            ],
            correctAnswer: 2,
            explanation: 'Manual data entry is a traditional human task, not an application of machine learning. ML applications include recommendation systems, image recognition, and fraud detection.'
          },
          {
            id: 'q3',
            question: 'What programming language is most commonly recommended for machine learning?',
            options: [
              'Java',
              'Python',
              'C++',
              'JavaScript'
            ],
            correctAnswer: 1,
            explanation: 'Python is the most popular language for machine learning due to its extensive libraries (scikit-learn, TensorFlow, PyTorch) and ease of use.'
          }
        ],
        nextSteps: [
          'Learn Python basics for data science',
          'Explore scikit-learn library',
          'Practice with real datasets',
          'Study linear algebra fundamentals'
        ],
        estimatedDuration: 15
      })
      setIsLoading(false)
    }, 1500)
  }, [moduleId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (!isPaused && currentStep !== 'complete') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPaused, currentStep])

  const handleAnswer = (questionId: string, answer: number, timeSpent: number) => {
    setUserAnswers(prev => [...prev, { questionId, answer, timeSpent }])
  }

  const handleNextQuestion = () => {
    if (learningContent && currentQuestionIndex < learningContent.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setCurrentStep('complete')
    }
  }

  const handleStartQuestions = () => {
    setCurrentStep('questions')
  }

  const handleRestart = () => {
    setCurrentStep('content')
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSessionTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateScore = () => {
    if (!learningContent) return 0
    const correctAnswers = userAnswers.filter(answer => {
      const question = learningContent.questions.find(q => q.id === answer.questionId)
      return question && answer.answer === question.correctAnswer
    }).length
    return Math.round((correctAnswers / learningContent.questions.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized content...</p>
        </div>
      </div>
    )
  }

  if (!learningContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Content not found</p>
          <button 
            onClick={() => router.back()}
            className="btn btn-primary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Learning Module</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(sessionTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{learningContent.estimatedDuration} min estimated</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
            >
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: learningContent.content.replace(/\n/g, '<br/>') }} />
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Ready to test your understanding?
                  </div>
                  <button
                    onClick={handleStartQuestions}
                    className="btn btn-primary px-6 py-2 rounded-lg font-medium"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'questions' && learningContent && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <ProgressBar
                  progress={currentQuestionIndex + 1}
                  total={learningContent.questions.length}
                  showPercentage={false}
                  showCount={true}
                />
              </div>
              
              <QuestionCard
                question={learningContent.questions[currentQuestionIndex]}
                onAnswer={handleAnswer}
                onNext={handleNextQuestion}
                isLastQuestion={currentQuestionIndex === learningContent.questions.length - 1}
              />
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Congratulations!
              </h2>
              
              <p className="text-gray-600 mb-6">
                You've completed the learning module successfully.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {calculateScore()}%
                  </div>
                  <div className="text-sm text-blue-800">Quiz Score</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {formatTime(sessionTime)}
                  </div>
                  <div className="text-sm text-purple-800">Time Spent</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {userAnswers.length}
                  </div>
                  <div className="text-sm text-green-800">Questions Answered</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-2">
                  {learningContent.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Review Again
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-primary px-6 py-2 rounded-lg font-medium"
                >
                  Continue Learning
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
