'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Lightbulb } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuestionCardProps {
  question: Question
  onAnswer: (questionId: string, answer: number, timeSpent: number) => void
  onNext: () => void
  isLastQuestion?: boolean
}

export default function QuestionCard({
  question,
  onAnswer,
  onNext,
  isLastQuestion = false
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    // Record the answer after a brief delay
    setTimeout(() => {
      onAnswer(question.id, answerIndex, timeSpent)
    }, 100)
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    setTimeSpent(0)
    onNext()
  }

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return `option-button ${selectedAnswer === index ? 'selected' : ''}`
    }
    
    if (index === question.correctAnswer) {
      return 'option-button correct'
    }
    
    if (selectedAnswer === index && index !== question.correctAnswer) {
      return 'option-button incorrect'
    }
    
    return 'option-button'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="question-card">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Question {question.id}
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
          {question.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={getOptionClass(index)}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <div className="flex items-center justify-between">
                <span className="text-left">{option}</span>
                {showResult && index === question.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {showResult && selectedAnswer === index && index !== question.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        <AnimatePresence>
          {showResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={handleNext}
              className="w-full btn btn-primary py-3 rounded-lg font-medium"
            >
              {isLastQuestion ? 'Complete Lesson' : 'Next Question'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
