'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  BookOpen, 
  Loader2,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Play,
  Eye,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ContentGenerationPopupProps {
  isOpen: boolean
  onClose: () => void
}

interface GeneratedContent {
  title: string
  description: string
  quizzes: {
    multipleChoice: any[]
    trueFalse: any[]
    fillInBlank: any[]
    shortAnswer: any[]
    essay: any[]
  }
  exercises: any[]
  visualSuggestions: any[]
  videoSuggestions: any[]
  generatedMedia: {
    type: 'image' | 'video'
    url: string
    name: string
    description: string
    status: 'generating' | 'completed' | 'failed'
  }[]
}

export default function ContentGenerationPopup({ isOpen, onClose }: ContentGenerationPopupProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [prompt, setPrompt] = useState('')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [contentType, setContentType] = useState('comprehensive')
  const [includeImages, setIncludeImages] = useState(true)
  const [includeVideos, setIncludeVideos] = useState(true)
  const [generationProgress, setGenerationProgress] = useState('')

  const generateContent = async () => {
    if (!prompt.trim()) {
      alert('Please enter a content topic!')
      return
    }

    setIsGenerating(true)
    setGenerationProgress('Generating educational content...')
    
    try {
      const response = await fetch('/api/ai-features/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          subject: subject.trim() || 'General',
          difficulty,
          contentType,
          includeImages,
          includeVideos,
          includeMedia: includeImages || includeVideos
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setContent({
            title: result.title,
            description: result.description,
            quizzes: result.quizzes || { multipleChoice: [], trueFalse: [], fillInBlank: [], shortAnswer: [], essay: [] },
            exercises: result.exercises || [],
            visualSuggestions: result.visualSuggestions || [],
            videoSuggestions: result.videoSuggestions || [],
            generatedMedia: result.files || []
          })
          setGenerationProgress('Content generation completed!')
        } else {
          alert('Failed to generate content. Please try again.')
        }
      } else {
        alert('Failed to generate content. Please try again.')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Error generating content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadFile = async (file: any) => {
    try {
      const response = await fetch(file.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download file')
    }
  }

  const downloadAllContent = () => {
    if (!content) return

    const contentText = `
# ${content.title}

${content.description}

## Multiple Choice Questions
${content.quizzes.multipleChoice.map((q, i) => `
${i + 1}. ${q.question}
${q.options.map((opt: string, j: number) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}
Answer: ${String.fromCharCode(65 + q.correctAnswer)}
Explanation: ${q.explanation}
`).join('\n')}

## True/False Questions
${content.quizzes.trueFalse.map((q, i) => `
${i + 1}. ${q.question}
Answer: ${q.correctAnswer ? 'True' : 'False'}
Explanation: ${q.explanation}
`).join('\n')}

## Fill in the Blank
${content.quizzes.fillInBlank.map((q, i) => `
${i + 1}. ${q.question}
Answer: ${q.correctAnswer}
Explanation: ${q.explanation}
`).join('\n')}

## Exercises
${content.exercises.map((ex, i) => `
### Exercise ${i + 1}: ${ex.type}
${ex.description}
Instructions: ${ex.instructions}
Solution: ${ex.solution}
`).join('\n')}
    `.trim()

    const blob = new Blob([contentText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '_')}_content.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
            className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-green-600" />
                Content Generation
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Input Section */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Topic *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Create comprehensive content about photosynthesis for high school students with interactive exercises'"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Biology, Chemistry"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="comprehensive">Comprehensive Package</option>
                    <option value="quiz-focused">Quiz Focused</option>
                    <option value="exercise-focused">Exercise Focused</option>
                    <option value="media-rich">Media Rich</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Generate Images</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeVideos}
                    onChange={(e) => setIncludeVideos(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Generate Videos</span>
                </label>
              </div>

              <button
                onClick={generateContent}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {generationProgress}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate Content & Media
                  </>
                )}
              </button>
            </div>

            {/* Generated Content Display */}
            {content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {content.title}
                  </h3>
                  <button
                    onClick={downloadAllContent}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                </div>

                <p className="text-gray-700 mb-6">{content.description}</p>

                {/* Generated Media */}
                {content.generatedMedia.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-green-600" />
                      Generated Media
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.generatedMedia.map((media, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            {media.type === 'image' ? (
                              <ImageIcon className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Video className="w-5 h-5 text-purple-600" />
                            )}
                            <span className="font-medium text-sm text-gray-900">{media.name}</span>
                            {media.status === 'completed' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {media.status === 'failed' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>

                          {media.status === 'completed' && (
                            <>
                              {media.type === 'image' && (
                                <img
                                  src={media.url}
                                  alt={media.description}
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                              )}
                              {media.type === 'video' && (
                                <video
                                  controls
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                >
                                  <source src={media.url} type="video/mp4" />
                                </video>
                              )}
                              <div className="space-y-2">
                                <button
                                  onClick={() => downloadFile(media)}
                                  className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                                {media.type === 'video' && (
                                  <button
                                    onClick={() => window.open(media.url, '_blank')}
                                    className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                  >
                                    <Play className="w-4 h-4" />
                                    Open
                                  </button>
                                )}
                              </div>
                            </>
                          )}

                          {media.status === 'generating' && (
                            <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            </div>
                          )}

                          {media.status === 'failed' && (
                            <div className="flex items-center justify-center h-32 bg-red-50 rounded-lg">
                              <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Multiple Choice Questions</h4>
                    <div className="space-y-3">
                      {content.quizzes.multipleChoice.slice(0, 3).map((q, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-gray-900 mb-1">{q.question}</p>
                          <div className="text-gray-600 text-xs space-y-1">
                            {q.options.map((opt: string, i: number) => (
                              <div key={i} className={i === q.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Exercises</h4>
                    <div className="space-y-3">
                      {content.exercises.slice(0, 3).map((ex, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-gray-900">{ex.type}</p>
                          <p className="text-gray-600 text-xs mt-1">{ex.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
