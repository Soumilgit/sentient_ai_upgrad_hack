'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Bot, 
  User,
  Loader2,
  Settings,
  BookOpen,
  Target,
  Brain
} from 'lucide-react'
import { speechToText } from '@/lib/elevenlabs'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  audioUrl?: string
  confidence?: number
  suggestedActions?: string[]
  relatedTopics?: string[]
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
  courseTitle?: string
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic'
}

export default function Chatbot({ 
  isOpen, 
  onClose, 
  courseTitle, 
  userLevel = 'intermediate',
  learningStyle = 'visual'
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM')
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize chatbot with contextual content
  useEffect(() => {
    if (isOpen && !isInitialized) {
      const generatedContent = localStorage.getItem('generatedConversational')
      if (generatedContent) {
        try {
          const result = JSON.parse(generatedContent)
          if (result.success && result.initialMessage) {
            setMessages([{
              id: '1',
              text: result.initialMessage,
              isUser: false,
              timestamp: new Date(),
              confidence: 0.95,
              suggestedActions: ['Ask a follow-up question', 'Get more details', 'Explore related topics'],
              relatedTopics: [result.topic || 'Learning']
            }])
            // Clear the stored content after using it
            localStorage.removeItem('generatedConversational')
          }
        } catch (error) {
          console.error('Error parsing pre-generated conversational content:', error)
        }
      } else {
        // Fallback to default message
        setMessages([{
          id: '1',
          text: `Hello! I'm your AI learning assistant powered by Gemini and ElevenLabs. I'm here to help you with ${courseTitle || 'your learning journey'}. What specific topic would you like to explore?`,
          isUser: false,
          timestamp: new Date(),
          confidence: 0.9,
          suggestedActions: ['Ask a question', 'Upload a file', 'Get help with a topic'],
          relatedTopics: ['Mathematics', 'Science', 'Programming', 'History']
        }])
      }
      setIsInitialized(true)
    }
  }, [isOpen, isInitialized, courseTitle])

  const voiceOptions = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', personality: 'Calm & Professional' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', personality: 'Confident & Strong' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', personality: 'Gentle & Soft' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', personality: 'Warm & Friendly' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', personality: 'Emotional & Expressive' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputText
    setInputText('')

    // Process conversation with Gemini + ElevenLabs
    await processConversation(messageText)
  }

  const processConversation = async (userMessage: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/conversational-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          voiceId: selectedVoice,
          conversationHistory,
          courseTitle,
          userLevel,
          learningStyle
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Update conversation history
      setConversationHistory(result.conversationHistory)
      
      // Create AI message with metadata
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: result.aiResponse,
        isUser: false,
        timestamp: new Date(),
        confidence: 0.8, // Default confidence
        suggestedActions: result.suggestedActions,
        relatedTopics: result.relatedTopics
      }
      
      setMessages(prev => [...prev, aiMessage])
      
      // Play AI response if not muted and audio is available
      if (!isMuted && result.audioData) {
        playAudioResponse(result.audioData)
      }
      
    } catch (error) {
      console.error('Conversation processing failed:', error)
      
      // Fallback response
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Could you please try again or rephrase your question?",
        isUser: false,
        timestamp: new Date(),
        confidence: 0.1
      }
      
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const playAudioResponse = async (audioData: string) => {
    try {
      setIsSpeaking(true)
      
      // Convert base64 to audio blob
      const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        
        // Clean up audio URL after playing
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

  const handleVoiceInput = async () => {
    try {
      setIsListening(true)
      const transcript = await speechToText()
      
      // Create user message and process immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        text: transcript,
        isUser: true,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])
      await processConversation(transcript)
    } catch (error) {
      console.error('Speech recognition error:', error)
      alert('Speech recognition not available. Please type your message.')
    } finally {
      setIsListening(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
            className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Learning Assistant</h3>
                  <p className="text-sm text-gray-500">
                    {courseTitle || 'General Learning'} • {userLevel} • {learningStyle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-gray-500" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-gray-50 border-b border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">🎙️ AI Voice</label>
                      <select 
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      >
                        {voiceOptions.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name} - {voice.personality}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">🧠 AI Personality</label>
                      <div className="text-sm text-gray-600">
                        Powered by Gemini AI with context engineering
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      
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
                      
                      {/* Suggested Actions */}
                      {!message.isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Suggested actions:</div>
                          <div className="flex flex-wrap gap-1">
                            {message.suggestedActions.map((action, index) => (
                              <span
                                key={index}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Related Topics */}
                      {!message.isUser && message.relatedTopics && message.relatedTopics.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Related topics:</div>
                          <div className="flex flex-wrap gap-1">
                            {message.relatedTopics.map((topic, index) => (
                              <span
                                key={index}
                                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
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
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">Gemini AI is processing...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or use voice input..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleVoiceInput}
                    disabled={isListening || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
                    ) : (
                      <Mic className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audio element for playback */}
            <audio
              ref={audioRef}
              onEnded={() => setIsSpeaking(false)}
              onError={() => setIsSpeaking(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
