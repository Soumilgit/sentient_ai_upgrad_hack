'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Plus, BookOpen, Zap, MessageCircle, Gamepad2, Clock, Target, 
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2, Brain,
  Paperclip, Image as ImageIcon, Video, Music, FileText, File
} from 'lucide-react'
import ChatGPTLikeUI from './ChatGPTLikeUI'

interface MediaFile {
  id: string
  file: File
  type: 'image' | 'video' | 'audio' | 'document'
  preview?: string
  name: string
  size: number
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  mediaFiles?: MediaFile[]
  confidence?: number
  suggestedActions?: string[]
  relatedTopics?: string[]
}

interface CourseManagementPopupProps {
  isOpen: boolean
  onClose: () => void
  learningModules: any[]
  onOpenChatbot?: (courseTitle?: string) => void
  onGeneralChat?: (message: string, mediaFiles?: any[]) => void
}

export default function CourseManagementPopup({ isOpen, onClose, learningModules, onOpenChatbot, onGeneralChat }: CourseManagementPopupProps) {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<MediaFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // File handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      const mediaFile: MediaFile = {
        id: Date.now().toString() + Math.random(),
        file,
        type: getFileType(file.type),
        name: file.name,
        size: file.size
      }

      // Create preview for images and videos
      if (mediaFile.type === 'image' || mediaFile.type === 'video') {
        const reader = new FileReader()
        reader.onload = (e) => {
          mediaFile.preview = e.target?.result as string
          setAttachedFiles(prev => [...prev, mediaFile])
        }
        reader.readAsDataURL(file)
      } else {
        setAttachedFiles(prev => [...prev, mediaFile])
      }
    })
    
    setShowDropdown(false)
  }

  const getFileType = (mimeType: string): MediaFile['type'] => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  // Chat processing
  const processMessage = async (message: string, mediaFiles?: MediaFile[]) => {
    setIsProcessing(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
      mediaFiles
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/general-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: message,
          mediaFiles: mediaFiles?.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          })) || [],
          conversationHistory
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update conversation history
        setConversationHistory(result.conversationHistory)
        
        // Create AI message
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.aiResponse,
          isUser: false,
          timestamp: new Date(),
          confidence: 0.8,
          suggestedActions: result.suggestedActions,
          relatedTopics: result.relatedTopics
        }
        
        setMessages(prev => [...prev, aiMessage])
        
        // Play audio if not muted and audio is available
        if (!isMuted && result.audioData) {
          playAudioResponse(result.audioData)
        }
      }
    } catch (error) {
      console.error('Message processing failed:', error)
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Could you please try again?",
        isUser: false,
        timestamp: new Date(),
        confidence: 0.1
      }
      
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const playAudioResponse = async (audioData: string) => {
    try {
      setIsSpeaking(true)
      
      const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setIsSpeaking(false)
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsSpeaking(false)
    }
  }

  const handleSendMessage = () => {
    if (!inputText.trim() && attachedFiles.length === 0) return
    
    processMessage(inputText, attachedFiles)
    setInputText('')
    setAttachedFiles([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
    }
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.start()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Music className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
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

            {/* ChatGPT-like UI */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Learning Assistant</h3>
                <p className="text-sm text-gray-600">Ask questions, upload files, or get help with your learning journey</p>
              </div>
              <ChatGPTLikeUI
                onSendMessage={(message, mediaFiles) => {
                  console.log('General chat message:', message, mediaFiles)
                  onGeneralChat?.(message, mediaFiles)
                }}
                placeholder="Ask anything about your courses, upload files, or get learning help..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {courseSections.map((section, index) => (
                <div key={index} className={`${section.bgColor} rounded-lg p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  </div>

                  {section.title === "Your Courses" ? (
                    <div className="space-y-3">
                      {(section as any).courses?.length > 0 ? (
                        (section as any).courses.map((course: any) => (
                          <div key={course.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{course.title}</h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {course.estimated_duration} min
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="w-4 h-4" />
                                    Level {course.difficulty_level}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                {course.isCompleted ? (
                                  <span className="text-green-600 text-sm font-medium">Completed</span>
                                ) : (
                                  <span className="text-blue-600 text-sm font-medium">
                                    {course.progress}% Complete
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No courses yet. Start learning to see your progress here!</p>
                      )}
                    </div>
                  ) : section.title === "Conversational Learning" ? (
                    <div>
                      <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                      <button 
                        onClick={() => onOpenChatbot?.()}
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
                  <h3 className="font-semibold text-gray-900 mb-1">Ready to create a new course?</h3>
                  <p className="text-gray-600 text-sm">Use our AI-powered course creation tools to build engaging learning experiences.</p>
                </div>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}