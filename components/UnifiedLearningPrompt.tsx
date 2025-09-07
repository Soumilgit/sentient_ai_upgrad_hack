'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Paperclip, 
  Image as ImageIcon, Video, Music, FileText, File,
  Loader2, Brain, Zap, Gamepad2, MessageCircle
} from 'lucide-react'

interface UnifiedLearningPromptProps {
  onGenerateContent: (prompt: string, learningType: 'flashcards' | 'gamification' | 'conversational' | 'all') => void
  isGenerating: boolean
}

interface MediaFile {
  id: string
  file: File
  type: 'image' | 'video' | 'audio' | 'document'
  preview?: string
  textContent?: string
}

export default function UnifiedLearningPrompt({ onGenerateContent, isGenerating }: UnifiedLearningPromptProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedLearningType, setSelectedLearningType] = useState<'flashcards' | 'gamification' | 'conversational' | 'all'>('all')
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<MediaFile[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const handleFileUpload = async (files: FileList) => {
    setIsProcessingFiles(true)
    const newFiles: MediaFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const mediaFile: MediaFile = {
        id: `file-${Date.now()}-${i}`,
        file,
        type: getFileType(file.type)
      }

      // Create preview for images/videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        mediaFile.preview = URL.createObjectURL(file)
      }

      // Extract text content
      try {
        const textContent = await extractTextFromFile(file)
        mediaFile.textContent = textContent
      } catch (error) {
        console.error('Error extracting text:', error)
      }

      newFiles.push(mediaFile)
    }

    setAttachedFiles(prev => [...prev, ...newFiles])
    setIsProcessingFiles(false)
  }

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (file.type === 'application/pdf') {
          // For PDFs, we'll send to server for processing
          resolve('PDF content will be processed by server')
        } else if (file.type.startsWith('text/')) {
          resolve(content)
        } else {
          resolve('File content extracted')
        }
      }
      reader.readAsText(file)
    })
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setPrompt(prev => prev + ' ' + transcript)
      setIsListening(false)
    }

    recognitionRef.current.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.start()
  }

  const handleSubmit = () => {
    if (!prompt.trim() && attachedFiles.length === 0) return

    // Combine prompt with file content
    let fullPrompt = prompt
    if (attachedFiles.length > 0) {
      const fileContent = attachedFiles
        .filter(f => f.textContent)
        .map(f => f.textContent)
        .join('\n\n')
      fullPrompt += `\n\nUploaded content:\n${fileContent}`
    }

    onGenerateContent(fullPrompt, selectedLearningType)
  }

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Music className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Learning Assistant</h2>
        <p className="text-gray-600">Ask questions, upload files, or get help with your learning journey.</p>
      </div>

      {/* Learning Type Selector */}
      <div className="flex justify-center gap-2">
        {[
          { id: 'all', label: 'All Tools', icon: Brain, color: 'purple' },
          { id: 'flashcards', label: 'Flashcards', icon: Zap, color: 'yellow' },
          { id: 'gamification', label: 'Gamification', icon: Gamepad2, color: 'green' },
          { id: 'conversational', label: 'Chat', icon: MessageCircle, color: 'blue' }
        ].map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setSelectedLearningType(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedLearningType === id
                ? `bg-${color}-500 text-white shadow-lg`
                : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Main Input Area */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Prompt Input */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="+ Ask anything about your courses, upload files, or get learning help..."
            className="w-full p-4 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isGenerating}
          />
          
          {/* Action Buttons */}
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Upload files"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`p-2 transition-colors ${
                isListening 
                  ? 'text-red-500 animate-pulse' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Voice input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 transition-colors ${
                isMuted ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() && attachedFiles.length === 0 || isGenerating}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* File Attachments */}
        <AnimatePresence>
          {attachedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              <h4 className="text-sm font-medium text-gray-700">Attached Files:</h4>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border"
                  >
                    {getFileIcon(file.type)}
                    <span className="text-sm text-gray-700 truncate max-w-32">
                      {file.file.name}
                    </span>
                    {file.textContent && (
                      <span className="text-xs text-green-600 font-medium">✓</span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Indicator */}
        {isProcessingFiles && (
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing files and extracting content...
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}
