'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Plus, BookOpen, Zap, MessageCircle, Gamepad2, Clock, Target, 
  Loader2, Brain
} from 'lucide-react'
import FlashcardGenerator from './FlashcardGenerator'
import GamificationAssignment from './GamificationAssignment'
import UnifiedLearningPrompt from './UnifiedLearningPrompt'

interface CourseManagementPopupProps {
  isOpen: boolean
  onClose: () => void
  learningModules: any[]
  onOpenChatbot?: (courseTitle?: string) => void
  onGeneralChat?: (message: string, mediaFiles?: any[]) => void
}

export default function CourseManagementPopup({ isOpen, onClose, learningModules, onOpenChatbot, onGeneralChat }: CourseManagementPopupProps) {
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false)
  const [isGamificationOpen, setIsGamificationOpen] = useState(false)
  const [isUnifiedPromptOpen, setIsUnifiedPromptOpen] = useState(false)
  const [unifiedContent, setUnifiedContent] = useState<any>(null)
  const [isGeneratingUnified, setIsGeneratingUnified] = useState(false)

  const handleUnifiedLearning = async (prompt: string, learningType: 'flashcards' | 'gamification' | 'conversational' | 'all') => {
    setIsGeneratingUnified(true)
    try {
      const response = await fetch('/api/centralized-learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          learningType,
          difficulty: 'medium',
          subject: 'General',
          studentLevel: 'intermediate'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setUnifiedContent(result)
        
        // Open appropriate tools based on learning type with generated content
        if (learningType === 'flashcards' || learningType === 'all') {
          // Pass the generated flashcards content
          if (result.flashcards) {
            // Store the flashcards data for the component to use
            localStorage.setItem('generatedFlashcards', JSON.stringify(result.flashcards))
          }
          setIsFlashcardOpen(true)
        }
        if (learningType === 'gamification' || learningType === 'all') {
          // Pass the generated gamification content
          if (result.gamification) {
            localStorage.setItem('generatedGamification', JSON.stringify(result.gamification))
          }
          setIsGamificationOpen(true)
        }
        if (learningType === 'conversational' || learningType === 'all') {
          // Pass the generated conversational content
          if (result.conversational) {
            localStorage.setItem('generatedConversational', JSON.stringify(result.conversational))
          }
          // Open conversational learning with context
          onOpenChatbot && onOpenChatbot()
        }
      } else {
        console.error('Failed to generate unified content')
      }
    } catch (error) {
      console.error('Error generating unified content:', error)
    } finally {
      setIsGeneratingUnified(false)
    }
  }

  const courseSections = [
    {
      title: "Flashcards",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Interactive flashcard system for quick review"
    },
    {
      title: "Gamification",
      icon: Gamepad2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Points, badges, and achievements to motivate learning"
    },
    {
      title: "Conversational Learning",
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "AI-powered chat-based learning experience"
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Course</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Unified Learning Prompt */}
            <div className="mb-8">
              <UnifiedLearningPrompt
                onGenerateContent={handleUnifiedLearning}
                isGenerating={isGeneratingUnified}
              />
            </div>

            {/* Course Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {courseSections.map((section, index) => (
                <div key={index} className={`${section.bgColor} rounded-lg p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      </div>
                      
                  {section.title === "Flashcards" ? (
                    <div>
                      <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                      <button 
                        onClick={() => setIsFlashcardOpen(true)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                      >
                        <Zap className="w-4 h-4" />
                        Generate Flashcards
                          </button>
                      </div>
                  ) : section.title === "Gamification" ? (
                    <div>
                      <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                      <button 
                        onClick={() => setIsGamificationOpen(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                      >
                        <Gamepad2 className="w-4 h-4" />
                        Start Assignment
                  </button>
                </div>
                  ) : section.title === "Conversational Learning" ? (
                    <div>
                      <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                      <button 
                        onClick={() => onOpenChatbot && onOpenChatbot()}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Start Chat
                  </button>
                </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                      <button className={`${section.color} hover:opacity-80 transition-opacity text-sm font-medium`}>
                        Coming Soon
                  </button>
                </div>
              )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to create a new course?</h3>
                  <p className="text-sm text-gray-600">Use our AI-powered course creation tools to build engaging learning experiences.</p>
                </div>
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Flashcard Generator */}
      <FlashcardGenerator
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
      />
      
      {/* Gamification Assignment */}
      <GamificationAssignment
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
      />
    </AnimatePresence>
  )
}
