'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Plus, BookOpen, Zap, MessageCircle, Gamepad2, Clock, Target, 
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2, Brain,
  Paperclip, Image as ImageIcon, Video, Music, FileText, File
} from 'lucide-react'

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

            {/* Inline AI Chat Interface */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Learning Assistant</h3>
                <p className="text-sm text-gray-600">Ask questions, upload files, or get help with your learning journey</p>
              </div>
              
              {/* Attached Files Preview */}
              <AnimatePresence>
                {attachedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group"
                        >
                          {file.type === 'image' && file.preview ? (
                            <div className="relative">
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                onClick={() => removeFile(file.id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-300 min-w-[120px]">
                              <div className="text-gray-500">
                                {getFileIcon(file.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFile(file.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Bar */}
              <div className="relative">
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  {/* Left Side - Plus Button */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Input Field */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about your courses, upload files, or get learning help..."
                    className="w-full pl-12 pr-24 py-4 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                    disabled={isProcessing}
                  />

                  {/* Right Side - Action Buttons */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={handleVoiceInput}
                      disabled={isListening || isProcessing}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-gray-100 hover:bg-gray-200 text-gray-600"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleSendMessage}
                      disabled={(!inputText.trim() && attachedFiles.length === 0) || isProcessing}
                      className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => {
                            fileInputRef.current?.click()
                            setShowDropdown(false)
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors text-white"
                        >
                          <Paperclip className="w-5 h-5" />
                          <span>Add photos & files</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Chat Messages - Fixed Height with Scroll */}
              <div className="mt-4 h-64 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <div className="text-4xl mb-2">💬</div>
                    <p>Start a conversation by typing or speaking...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.isUser 
                              ? 'bg-blue-500' 
                              : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}>
                            {message.isUser ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className={`px-4 py-2 rounded-lg ${
                            message.isUser
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.text}</p>
                            
                            {/* Media Files Display */}
                            {message.mediaFiles && message.mediaFiles.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-600 mb-1">Attached files:</div>
                                <div className="flex flex-wrap gap-1">
                                  {message.mediaFiles.map((file, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                    >
                                      {file.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* AI Message Metadata */}
                            {!message.isUser && message.confidence && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  <Brain className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                    Confidence: {Math.round(message.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <p className={`text-xs mt-1 ${
                              message.isUser ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Processing Indicator */}
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                              <span className="text-sm text-gray-500">Gemini AI is processing...</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
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
                      {section.courses && section.courses.length > 0 ? (
                        section.courses.map((course) => (
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
      
      {/* Audio Element */}
      <audio ref={audioRef} />
    </AnimatePresence>
  )
}
