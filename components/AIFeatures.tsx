'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  FileText, 
  Target, 
  BookOpen, 
  Bot, 
  ChevronUp, 
  ChevronDown,
  Loader2,
  Play,
  Download,
  Image as ImageIcon,
  Video,
  FileImage,
  FileVideo
} from 'lucide-react'

interface AIFeaturesProps {
  isOpen: boolean
  onClose: () => void
}

interface GeneratedContent {
  type: 'ppt' | 'lesson' | 'content' | 'tutor'
  title: string
  description: string
  content: any
  files?: {
    type: 'image' | 'video' | 'document'
    url: string
    name: string
  }[]
}

export default function AIFeatures({ isOpen, onClose }: AIFeaturesProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [prompt, setPrompt] = useState('')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('medium')

  const features = [
    {
      id: 'ppt',
      title: 'PPT Creation',
      description: 'Generate presentations from course content',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'lesson',
      title: 'Customized Lesson Planning',
      description: 'AI-powered personalized learning paths',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'content',
      title: 'Content Generation',
      description: 'Create quizzes, exercises, and materials',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'tutor',
      title: 'AI Tutor',
      description: '24/7 intelligent learning assistant',
      icon: Bot,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  const handleFeatureClick = async (featureId: string) => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first!')
      return
    }

    setActiveFeature(featureId)
    setIsGenerating(true)

    try {
      const response = await fetch(`/api/ai-features/${featureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          subject: subject.trim() || 'General',
          difficulty,
          featureType: featureId
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setGeneratedContent({
          type: featureId as any,
          title: result.title || `${features.find(f => f.id === featureId)?.title} Result`,
          description: result.description || 'Generated content',
          content: result,
          files: result.files || []
        })
      } else {
        console.error('Failed to generate content')
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
      if (file.type === 'video' && file.url) {
        // For videos, fetch the blob first
        const response = await fetch(file.url)
        const blob = await response.blob()
        const objectURL = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = objectURL
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(objectURL), 100)
      } else {
        // For other files, direct download
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file. Please try again.')
    }
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
                <Bot className="w-8 h-8 text-purple-600" />
                AI Features
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Input Section */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to create?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create... (e.g., 'Create a lesson plan about photosynthesis for 5th graders')"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Science, Math, History"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Features Grid */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                  {features.map((feature) => (
                    <motion.div
                      key={feature.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-lg`}
                      onClick={() => handleFeatureClick(feature.id)}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                        <h3 className={`text-lg font-semibold ${feature.color}`}>
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        {feature.description}
                      </p>
                      <button
                        className={`w-full ${feature.color} hover:opacity-80 transition-opacity text-sm font-medium py-2 px-4 rounded-lg border ${feature.borderColor} bg-white`}
                        disabled={isGenerating}
                      >
                        {isGenerating && activeFeature === feature.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </div>
                        ) : (
                          'Generate'
                        )}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Content Display */}
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {generatedContent.title}
                  </h3>
                  <button
                    onClick={() => setGeneratedContent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Content Display */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {JSON.stringify(generatedContent.content, null, 2)}
                    </pre>
                  </div>

                  {/* Files Display */}
                  {generatedContent.files && generatedContent.files.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Generated Files</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedContent.files.map((file, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              {file.type === 'image' ? (
                                <ImageIcon className="w-6 h-6 text-green-600" />
                              ) : file.type === 'video' ? (
                                <Video className="w-6 h-6 text-blue-600" />
                              ) : (
                                <FileText className="w-6 h-6 text-gray-600" />
                              )}
                              <span className="font-medium text-gray-900">{file.name}</span>
                            </div>
                            
                            {/* Preview for videos */}
                            {file.type === 'video' && file.url && (
                              <div className="mb-3">
                                <video
                                  controls
                                  className="w-full h-32 object-cover rounded-lg bg-gray-100"
                                  poster="/placeholder-video.jpg"
                                >
                                  <source src={file.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                            
                            {/* Preview for images */}
                            {file.type === 'image' && file.url && (
                              <div className="mb-3">
                                <img
                                  src={file.url}
                                  alt={file.description || file.name}
                                  className="w-full h-32 object-cover rounded-lg bg-gray-100"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-image.jpg'
                                  }}
                                />
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <button
                                onClick={() => downloadFile(file)}
                                className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                              
                              {file.type === 'video' && (
                                <button
                                  onClick={() => window.open(file.url, '_blank')}
                                  className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Play className="w-4 h-4" />
                                  Open Video
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
