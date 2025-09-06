'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  RotateCcw, 
  Shuffle, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  Target,
  Tag,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: string
  subject: string
  tags: string[]
}

interface FlashcardGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

export default function FlashcardGenerator({ isOpen, onClose }: FlashcardGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [count, setCount] = useState(5)
  const [subject, setSubject] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const generateFlashcards = async () => {
    // Check if there's pre-generated content from the unified prompt
    const generatedContent = localStorage.getItem('generatedFlashcards')
    if (generatedContent) {
      try {
        const result = JSON.parse(generatedContent)
        if (result.success && result.flashcards && Array.isArray(result.flashcards)) {
          setFlashcards(result.flashcards)
          setTopic(result.topic || 'Generated Content')
          setSubject(result.subject || 'General')
          setCurrentIndex(0)
          setIsFlipped(false)
          setShowAnswer(false)
          console.log(`Successfully loaded ${result.flashcards.length} pre-generated flashcards`)
          // Clear the stored content after using it
          localStorage.removeItem('generatedFlashcards')
          return
        }
      } catch (error) {
        console.error('Error parsing pre-generated flashcards:', error)
      }
    }

    // Fallback to manual generation if no pre-generated content
    if (!topic.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          count,
          subject: subject.trim() || 'General'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Flashcard generation result:', result)
        
        if (result.success && result.flashcards && Array.isArray(result.flashcards)) {
          setFlashcards(result.flashcards)
          setCurrentIndex(0)
          setIsFlipped(false)
          setShowAnswer(false)
          console.log(`Successfully generated ${result.flashcards.length} flashcards`)
        } else {
          console.error('Invalid response format:', result)
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to generate flashcards:', errorData)
      }
    } catch (error) {
      console.error('Error generating flashcards:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const shuffleFlashcards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setFlashcards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowAnswer(false)
  }

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const flipCard = () => {
    console.log('Flipping card:', { isFlipped, currentCard: currentCard?.back })
    setIsFlipped(!isFlipped)
    setShowAnswer(!showAnswer)
  }

  const resetGenerator = () => {
    setTopic('')
    setSubject('')
    setCount(5)
    setDifficulty('intermediate')
    setFlashcards([])
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowAnswer(false)
  }

  const currentCard = flashcards[currentIndex]
  
  // Debug logging
  console.log('Current card data:', { 
    currentIndex, 
    totalCards: flashcards.length, 
    currentCard,
    isFlipped 
  })

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
        className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Flashcard Generator</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {flashcards.length === 0 ? (
          // Generator Form
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning, World War II, Photosynthesis"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Computer Science, History, Biology"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Cards (1-20)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 20))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={generateFlashcards}
                disabled={!topic.trim() || isGenerating}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Generate Flashcards
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Flashcard Display
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {topic} Flashcards
                </h3>
                <p className="text-sm text-gray-600">
                  {currentIndex + 1} of {flashcards.length} cards
                </p>
                {flashcards.length > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ {flashcards.length} flashcards generated successfully
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={shuffleFlashcards}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Shuffle cards"
                >
                  <Shuffle className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={resetGenerator}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Generate new set"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              />
            </div>

            {/* Flashcard */}
            <div className="flex justify-center">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1 
                }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl h-64 cursor-pointer"
                onClick={flipCard}
              >
                <div className="relative w-full h-full">
                  {/* Front */}
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div
                        key="front"
                        initial={{ opacity: 0, rotateY: 0 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-8 h-full flex flex-col justify-center items-center text-center shadow-lg">
                          <BookOpen className="w-12 h-12 mb-4 opacity-80" />
                          <h4 className="text-xl font-semibold mb-2">Question</h4>
                          <p className="text-lg leading-relaxed">{currentCard?.front}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {currentCard?.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-xl p-8 h-full flex flex-col justify-center items-center text-center shadow-lg">
                          <CheckCircle className="w-12 h-12 mb-4 opacity-80" />
                          <h4 className="text-xl font-semibold mb-2">Answer</h4>
                          <p className="text-lg leading-relaxed">{currentCard?.back}</p>
                          <div className="mt-4 flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {currentCard?.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {currentCard?.subject}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={flipCard}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                {isFlipped ? 'Show Question' : 'Show Answer'}
              </button>

              <button
                onClick={nextCard}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
