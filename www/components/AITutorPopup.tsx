'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Bot, 
  Loader2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Lightbulb,
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface AITutorPopupProps {
  isOpen: boolean
  onClose: () => void
}

interface TutorSession {
  title: string
  description: string
  greeting: string
  learningObjectives: string[]
  explanation: {
    introduction: string
    mainContent: string
    examples: string[]
    analogies: string[]
  }
  practiceProblems: {
    problem: string
    solution: string
    hints: string[]
  }[]
  misconceptions: {
    misconception: string
    correction: string
  }[]
  nextSteps: string[]
  encouragement: string
  estimatedSessionTime: string
  audio?: {
    base64: string
    duration: number
    voice: string
  }
}

export default function AITutorPopup({ isOpen, onClose }: AITutorPopupProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [session, setSession] = useState<TutorSession | null>(null)
  const [prompt, setPrompt] = useState('')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [learningStyle, setLearningStyle] = useState('visual')
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  const generateTutorSession = async () => {
    if (!prompt.trim()) {
      alert('Please enter a learning topic!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai-features/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          subject: subject.trim() || 'General',
          difficulty,
          learningStyle,
          includeAudio: true
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSession(result)
          setCurrentStep(0)
        } else {
          alert('Failed to generate tutoring session. Please try again.')
        }
      } else {
        alert('Failed to generate tutoring session. Please try again.')
      }
    } catch (error) {
      console.error('Error generating tutor session:', error)
      alert('Error generating tutoring session. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const playAudio = async () => {
    if (!session?.audio || isMuted) return

    try {
      setIsPlayingAudio(true)
      
      const audioBuffer = Uint8Array.from(atob(session.audio.base64), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setIsPlayingAudio(false)
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlayingAudio(false)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlayingAudio(false)
  }

  const tutorSteps = session ? [
    {
      title: "Welcome & Objectives",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-900">{session.greeting}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Learning Objectives
            </h4>
            <ul className="space-y-1">
              {session.learningObjectives.map((obj, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Core Explanation",
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Introduction</h4>
            <p className="text-purple-800 text-sm">{session.explanation.introduction}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Main Content</h4>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{session.explanation.mainContent}</p>
          </div>
        </div>
      )
    },
    {
      title: "Examples & Analogies",
      content: (
        <div className="space-y-4">
          {session.explanation.examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Examples
              </h4>
              <div className="space-y-2">
                {session.explanation.examples.map((example, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-yellow-900 text-sm">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {session.explanation.analogies.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Analogies</h4>
              <div className="space-y-2">
                {session.explanation.analogies.map((analogy, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-900 text-sm">{analogy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Practice Problems",
      content: (
        <div className="space-y-4">
          {session.practiceProblems.map((problem, index) => (
            <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Problem {index + 1}</h4>
              <p className="text-gray-700 mb-3">{problem.problem}</p>
              
              <details className="mb-3">
                <summary className="cursor-pointer text-blue-600 font-medium text-sm">Show Hints</summary>
                <ul className="mt-2 space-y-1">
                  {problem.hints.map((hint, hintIndex) => (
                    <li key={hintIndex} className="text-sm text-gray-600 ml-4">
                      • {hint}
                    </li>
                  ))}
                </ul>
              </details>
              
              <details>
                <summary className="cursor-pointer text-green-600 font-medium text-sm">Show Solution</summary>
                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-900 text-sm whitespace-pre-wrap">{problem.solution}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Common Misconceptions",
      content: (
        <div className="space-y-4">
          {session.misconceptions.map((misconception, index) => (
            <div key={index} className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Misconception #{index + 1}</h4>
              <p className="text-red-800 mb-2 text-sm">❌ {misconception.misconception}</p>
              <p className="text-green-800 text-sm">✅ {misconception.correction}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Next Steps & Encouragement",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
            <ul className="space-y-1">
              {session.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
            <p className="text-purple-900 font-medium">{session.encouragement}</p>
          </div>
        </div>
      )
    }
  ] : []

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
            className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Bot className="w-8 h-8 text-orange-600" />
                AI Tutor
              </h2>
              <div className="flex items-center gap-2">
                {session?.audio && (
                  <>
                    <button
                      onClick={isMuted ? () => setIsMuted(false) : () => setIsMuted(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5 text-gray-500" /> : <Volume2 className="w-5 h-5 text-orange-600" />}
                    </button>
                    <button
                      onClick={isPlayingAudio ? stopAudio : playAudio}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5 text-orange-600" /> : <Play className="w-5 h-5 text-orange-600" />}
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {!session ? (
              /* Input Section */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to learn? *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'I want to understand how photosynthesis works and why it's important for life on Earth'"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Biology, Math"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Style
                    </label>
                    <select
                      value={learningStyle}
                      onChange={(e) => setLearningStyle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={generateTutorSession}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Your Personal Tutor Session...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      Start AI Tutoring Session
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Tutor Session Display */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    {session.estimatedSessionTime}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{currentStep + 1} of {tutorSteps.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / tutorSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Step Content */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 rounded-lg p-6 mb-6"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {tutorSteps[currentStep]?.title}
                  </h4>
                  {tutorSteps[currentStep]?.content}
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {tutorSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentStep ? 'bg-orange-500' : 
                          index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentStep(Math.min(tutorSteps.length - 1, currentStep + 1))}
                    disabled={currentStep === tutorSteps.length - 1}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Audio Element */}
            <audio ref={audioRef} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
