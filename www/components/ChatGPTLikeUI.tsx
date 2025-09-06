'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Mic, 
  Volume2, 
  Send, 
  X, 
  Paperclip, 
  BookOpen, 
  Image as ImageIcon, 
  Lightbulb, 
  Search,
  FileText,
  Video,
  Music,
  File,
  Loader2
} from 'lucide-react'

interface MediaFile {
  id: string
  file: File
  type: 'image' | 'video' | 'audio' | 'document'
  preview?: string
  name: string
  size: number
}

interface ChatGPTLikeUIProps {
  onSendMessage: (message: string, mediaFiles?: MediaFile[]) => void
  isProcessing?: boolean
  placeholder?: string
}

export default function ChatGPTLikeUI({ 
  onSendMessage, 
  isProcessing = false,
  placeholder = "Ask anything"
}: ChatGPTLikeUIProps) {
  const [inputText, setInputText] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<MediaFile[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [])

  const getFileType = (mimeType: string): MediaFile['type'] => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const handleSendMessage = () => {
    if (!inputText.trim() && attachedFiles.length === 0) return
    
    onSendMessage(inputText, attachedFiles)
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

  const handleTextToSpeech = async () => {
    if (!inputText.trim()) return

    try {
      setIsSpeaking(true)
      
      const response = await fetch('/api/general-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: inputText,
          mediaFiles: attachedFiles.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          })),
          conversationHistory: []
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.audioData) {
          const audioBuffer = Uint8Array.from(atob(result.audioData), c => c.charCodeAt(0))
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
        }
      }
    } catch (error) {
      console.error('Text-to-speech error:', error)
      setIsSpeaking(false)
    }
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

  return (
    <div className="w-full">
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

      {/* Main Input Area */}
      <div className="relative">
        {/* Input Bar */}
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className={`relative bg-white border-2 rounded-2xl transition-all duration-300 ${
            isHovered 
              ? 'border-blue-300 shadow-lg shadow-blue-100' 
              : 'border-gray-200 shadow-sm'
          }`}
        >
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
            placeholder={placeholder}
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
              onClick={handleTextToSpeech}
              disabled={!inputText.trim() || isSpeaking || isProcessing}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isSpeaking 
                  ? 'bg-blue-500 text-white animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Volume2 className="w-4 h-4" />
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
        </motion.div>

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
                
                <button
                  onClick={() => {
                    onSendMessage("I want to study and learn about a specific topic")
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors text-white"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Study and learn</span>
                </button>
                
                <button
                  onClick={() => {
                    onSendMessage("Help me create an image or visual content")
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors text-white"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Create image</span>
                </button>
                
                <button
                  onClick={() => {
                    onSendMessage("I need to think about this problem more deeply")
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors text-white"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span>Think longer</span>
                </button>
                
                <button
                  onClick={() => {
                    onSendMessage("I need deep research on this topic")
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors text-white"
                >
                  <Search className="w-5 h-5" />
                  <span>Deep research</span>
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

      {/* Audio Element */}
      <audio ref={audioRef} />
    </div>
  )
}
