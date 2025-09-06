'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Brain, Target, Zap, CheckCircle } from 'lucide-react'
import QuestionCard from '@/components/QuestionCard'
import ProgressBar from '@/components/ProgressBar'

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'learning' | 'questions' | 'complete'>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Array<{ questionId: string; answer: number; timeSpent: number }>>([])
  const [sessionTime, setSessionTime] = useState(0)

  const demoContent = {
    title: "Introduction to Machine Learning",
    content: `# Welcome to the Micro Learning Engine Demo!

This is a **personalized micro-learning experience** that adapts to your competence and engagement levels in real-time.

## How It Works

1. **AI-Powered Content**: Our system generates personalized content based on your learning style and current competence level
2. **Real-time Adaptation**: Content adjusts based on your engagement patterns and interaction data
3. **Competence Tracking**: Continuous assessment of your learning progress
4. **Micro-Learning Focus**: Short, focused sessions that maximize retention

## Key Features

- **Personalized Content**: Generated using Groq's Llama model
- **Engagement Analysis**: Powered by Google's Gemini AI
- **Progress Tracking**: Real-time analytics and competence scoring
- **Adaptive Learning**: Content difficulty adjusts based on performance

Ready to experience the future of learning?`,
    questions: [
      {
        id: 'demo-q1',
        question: 'What is the main advantage of micro-learning over traditional learning methods?',
        options: [
          'It requires more time to complete',
          'It maximizes retention through focused, short sessions',
          'It is more expensive to implement',
          'It only works for certain subjects'
        ],
        correctAnswer: 1,
        explanation: 'Micro-learning maximizes retention by delivering content in short, focused sessions that prevent cognitive overload and maintain learner engagement.'
      },
      {
        id: 'demo-q2',
        question: 'How does the AI system adapt content to individual learners?',
        options: [
          'By using only demographic data',
          'By analyzing competence level, learning style, and engagement patterns',
          'By asking learners to fill out surveys',
          'By using a one-size-fits-all approach'
        ],
        correctAnswer: 1,
        explanation: 'The AI system analyzes multiple factors including competence level, learning style preferences, and real-time engagement patterns to personalize the learning experience.'
      }
    ]
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === 'learning' || currentStep === 'questions') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentStep])

  const handleAnswer = (questionId: string, answer: number, timeSpent: number) => {
    setUserAnswers(prev => [...prev, { questionId, answer, timeSpent }])
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < demoContent.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setCurrentStep('complete')
    }
  }

  const handleStartDemo = () => {
    setCurrentStep('learning')
  }

  const handleStartQuiz = () => {
    setCurrentStep('questions')
  }

  const calculateScore = () => {
    const correctAnswers = userAnswers.filter(answer => {
      const question = demoContent.questions.find(q => q.id === answer.questionId)
      return question && answer.answer === question.correctAnswer
    }).length
    return Math.round((correctAnswers / demoContent.questions.length) * 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Micro Learning Engine Demo</h1>
              <p className="text-gray-600">Experience personalized AI-powered learning</p>
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(sessionTime)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try Our Micro Learning Engine
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience how AI-powered personalization can transform your learning journey. 
              This demo showcases our adaptive micro-learning technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Personalized Content</h3>
                <p className="text-sm text-gray-600">AI-generated content tailored to your learning style</p>
              </div>
              <div className="text-center p-4">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Real-time Adaptation</h3>
                <p className="text-sm text-gray-600">Content adjusts based on your engagement patterns</p>
              </div>
              <div className="text-center p-4">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Competence Tracking</h3>
                <p className="text-sm text-gray-600">Continuous assessment of your learning progress</p>
              </div>
            </div>

            <button
              onClick={handleStartDemo}
              className="btn btn-primary px-8 py-3 rounded-lg text-lg font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Demo
            </button>
          </motion.div>
        )}

        {currentStep === 'learning' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: demoContent.content.replace(/\n/g, '<br/>') }} />
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Ready to test your understanding?
                </div>
                <button
                  onClick={handleStartQuiz}
                  className="btn btn-primary px-6 py-2 rounded-lg font-medium"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'questions' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <ProgressBar
                progress={currentQuestionIndex + 1}
                total={demoContent.questions.length}
                showPercentage={false}
                showCount={true}
              />
            </div>
            
            <QuestionCard
              question={demoContent.questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              onNext={handleNextQuestion}
              isLastQuestion={currentQuestionIndex === demoContent.questions.length - 1}
            />
          </motion.div>
        )}

        {currentStep === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Demo Complete!
            </h2>
            
            <p className="text-gray-600 mb-6">
              You've experienced our micro-learning engine. Here's how you performed:
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

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You Experienced</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">AI-Generated Content</div>
                    <div className="text-sm text-gray-600">Personalized learning material</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">Real-time Assessment</div>
                    <div className="text-sm text-gray-600">Instant feedback and scoring</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">Engagement Tracking</div>
                    <div className="text-sm text-gray-600">Monitoring learning patterns</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-gray-900">Adaptive Learning</div>
                    <div className="text-sm text-gray-600">Content adjusts to your needs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentStep('intro')
                  setCurrentQuestionIndex(0)
                  setUserAnswers([])
                  setSessionTime(0)
                }}
                className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
              >
                Try Again
              </button>
              <a
                href="/dashboard"
                className="btn btn-primary px-6 py-2 rounded-lg font-medium"
              >
                Explore Full Platform
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
