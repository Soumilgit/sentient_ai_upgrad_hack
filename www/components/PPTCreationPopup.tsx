'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  FileText, 
  Loader2,
  Download,
  Eye,
  Clock,
  Users,
  Presentation,
  Image as ImageIcon,
  Play,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface PPTCreationPopupProps {
  isOpen: boolean
  onClose: () => void
}

interface Slide {
  slideNumber: number
  title: string
  content: string
  keyPoints: string[]
  visualSuggestions: string
  interactiveElements: string
}

interface PPTPresentation {
  title: string
  description: string
  slides: Slide[]
  totalSlides: number
  estimatedDuration: string
  targetAudience: string
}

export default function PPTCreationPopup({ isOpen, onClose }: PPTCreationPopupProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [presentation, setPresentation] = useState<PPTPresentation | null>(null)
  const [prompt, setPrompt] = useState('')
  const [subject, setSubject] = useState('')
  const [audience, setAudience] = useState('students')
  const [duration, setDuration] = useState('30')
  const [style, setStyle] = useState('educational')
  const [currentSlide, setCurrentSlide] = useState(0)

  const generatePresentation = async () => {
    if (!prompt.trim()) {
      alert('Please enter a presentation topic!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai-features/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          subject: subject.trim() || 'General',
          difficulty: audience === 'students' ? 'intermediate' : 'advanced',
          featureType: 'ppt',
          audience,
          duration: parseInt(duration),
          style
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPresentation(result)
          setCurrentSlide(0)
        } else {
          alert('Failed to generate presentation. Please try again.')
        }
      } else {
        alert('Failed to generate presentation. Please try again.')
      }
    } catch (error) {
      console.error('Error generating presentation:', error)
      alert('Error generating presentation. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPresentation = () => {
    if (!presentation) return

    const content = `
# ${presentation.title}

${presentation.description}

**Target Audience:** ${presentation.targetAudience}
**Estimated Duration:** ${presentation.estimatedDuration}
**Total Slides:** ${presentation.totalSlides}

---

${presentation.slides.map(slide => `
## Slide ${slide.slideNumber}: ${slide.title}

### Content
${slide.content}

### Key Points
${slide.keyPoints.map(point => `- ${point}`).join('\n')}

### Visual Suggestions
${slide.visualSuggestions}

### Interactive Elements
${slide.interactiveElements}

---
`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_presentation.md`
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
                <FileText className="w-8 h-8 text-purple-600" />
                PPT Creation
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {!presentation ? (
              /* Input Section */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Presentation Topic *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Create a presentation about renewable energy sources for high school students'"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Science, Business"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="students">Students</option>
                      <option value="professionals">Professionals</option>
                      <option value="general">General Audience</option>
                      <option value="children">Children</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="educational">Educational</option>
                      <option value="corporate">Corporate</option>
                      <option value="creative">Creative</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={generatePresentation}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Presentation...
                    </>
                  ) : (
                    <>
                      <Presentation className="w-5 h-5" />
                      Generate PowerPoint Presentation
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Presentation Display */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{presentation.title}</h3>
                  <button
                    onClick={downloadPresentation}
                    className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Slide Navigation */}
                  <div className="lg:col-span-1">
                    <h4 className="font-semibold text-gray-900 mb-3">Slides</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {presentation.slides.map((slide, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-full p-3 text-left rounded-lg border transition-colors ${
                            currentSlide === index 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Slide {slide.slideNumber}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {slide.title}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        {presentation.estimatedDuration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Users className="w-4 h-4" />
                        {presentation.targetAudience}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {presentation.totalSlides} slides
                      </div>
                    </div>
                  </div>

                  {/* Slide Content */}
                  <div className="lg:col-span-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Slide {presentation.slides[currentSlide]?.slideNumber}: {presentation.slides[currentSlide]?.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                            disabled={currentSlide === 0}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-600">
                            {currentSlide + 1} / {presentation.slides.length}
                          </span>
                          <button
                            onClick={() => setCurrentSlide(Math.min(presentation.slides.length - 1, currentSlide + 1))}
                            disabled={currentSlide === presentation.slides.length - 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Main Content */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Content</h5>
                          <p className="text-blue-800 text-sm whitespace-pre-wrap">
                            {presentation.slides[currentSlide]?.content}
                          </p>
                        </div>

                        {/* Key Points */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-green-900 mb-2">Key Points</h5>
                          <ul className="space-y-1">
                            {presentation.slides[currentSlide]?.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                                <span className="text-green-600 mt-1">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Visual Suggestions */}
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Visual Suggestions
                            </h5>
                            <p className="text-purple-800 text-sm">
                              {presentation.slides[currentSlide]?.visualSuggestions}
                            </p>
                          </div>

                          {/* Interactive Elements */}
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h5 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              Interactive Elements
                            </h5>
                            <p className="text-orange-800 text-sm">
                              {presentation.slides[currentSlide]?.interactiveElements}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
