'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Hash,
  Send,
  Smile,
  Paperclip,
  Search,
  MoreVertical,
  Phone,
  Video,
  Bot,
  X
} from 'lucide-react'
import { mockUsers } from '@/data/mockData'
import { useGroqBot } from '@/components/community/GroqBot'
import { PresentationGenerator } from '@/components/community/PresentationGenerator'

interface CommunityForumProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommunityForum({ isOpen, onClose }: CommunityForumProps) {
  const { user } = useAuth()
  const [selectedChannel, setSelectedChannel] = useState('general')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'Hey everyone! Just wanted to share that our new AI tutoring program is showing amazing results. Students are improving by 25% in math scores! 🎉',
      author: mockUsers[2],
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      channel: 'general'
    },
    {
      id: '2',
      content: 'That sounds fantastic! Can you share more details about the implementation?',
      author: mockUsers[1],
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      channel: 'general'
    },
    {
      id: '3',
      content: 'Of course! We started with personalized learning paths and the AI adapts to each student\'s pace. The engagement levels have increased dramatically.',
      author: mockUsers[2],
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      channel: 'general'
    },
    {
      id: '4',
      content: 'This is exactly what we need at our school. How can we get started?',
      author: mockUsers[3],
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      channel: 'general'
    },
    {
      id: '5',
      content: '@sentient How can I help my students improve their reading comprehension skills?',
      author: mockUsers[1],
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      channel: 'general'
    },
    {
      id: '6',
      content: 'Great question! Here are some effective strategies to help students improve their reading comprehension:\n\n1. **Pre-reading activities**: Have students preview the text by looking at headings, pictures, and key vocabulary\n2. **Active reading techniques**: Teach students to highlight, underline, or take notes while reading\n3. **Question-answer relationships**: Help students understand different types of questions (literal, inferential, evaluative)\n4. **Summarization practice**: Have students write brief summaries of what they\'ve read\n5. **Discussion groups**: Encourage peer discussions about the text\n6. **Vocabulary building**: Focus on context clues and word roots\n\nRemember to start with texts that are slightly challenging but not overwhelming, and gradually increase difficulty as students improve. Would you like me to elaborate on any of these strategies?',
      author: {
        id: 'sentient-bot',
        name: 'Sentient Assistant',
        role: 'ai_assistant',
        avatar: null,
      },
      timestamp: new Date(Date.now() - 30 * 1000),
      channel: 'general'
    },
    // Lesson Planning Channel Messages
    {
      id: '7',
      content: 'I need help creating a lesson plan for teaching photosynthesis to 8th graders. Any suggestions for engaging activities?',
      author: mockUsers[1],
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      channel: 'lesson-planning'
    },
    {
      id: '8',
      content: 'For photosynthesis, I recommend starting with a hands-on experiment using spinach leaves and light. Students can see the oxygen bubbles form! Also, try the "Photosynthesis Rap" - kids love it! 🎵',
      author: mockUsers[2],
      timestamp: new Date(Date.now() - 40 * 60 * 1000),
      channel: 'lesson-planning'
    },
    {
      id: '9',
      content: 'Has anyone used the new AI presentation generator? I created a 10-slide presentation on World War II in just 2 minutes!',
      author: mockUsers[3],
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      channel: 'lesson-planning'
    },
    {
      id: '10',
      content: 'Yes! The presentation generator is amazing. I used it for my chemistry class on the periodic table. The slides were well-structured and included great visuals.',
      author: mockUsers[1],
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      channel: 'lesson-planning'
    }
  ])

  const channels = {
    supreme_admin: [
      { id: 'general', label: 'general', icon: Hash, count: 45, description: 'General discussions' },
      { id: 'announcements', label: 'announcements', icon: Hash, count: 12, description: 'Important updates' },
      { id: 'teachers', label: 'teachers', icon: Hash, count: 156, description: 'Teacher discussions' },
      { id: 'students', label: 'students', icon: Hash, count: 2341, description: 'Student community' },
    ],
    school_admin: [
      { id: 'general', label: 'general', icon: Hash, count: 23, description: 'School discussions' },
      { id: 'faculty', label: 'faculty', icon: Hash, count: 32, description: 'Faculty discussions' },
      { id: 'students', label: 'students', icon: Hash, count: 450, description: 'Student discussions' },
    ],
    teacher: [
      { id: 'general', label: 'general', icon: Hash, count: 89, description: 'Teacher discussions' },
      { id: 'my-classes', label: 'my-classes', icon: Hash, count: 156, description: 'Class discussions' },
      { id: 'ai-assistant', label: 'ai-assistant', icon: Bot, count: 89, description: 'AI teaching support' },
      { id: 'lesson-planning', label: 'lesson-planning', icon: Hash, count: 45, description: 'Lesson planning' },
      { id: 'assessment', label: 'assessment', icon: Hash, count: 32, description: 'Assessment strategies' },
      { id: 'resources', label: 'resources', icon: Hash, count: 67, description: 'Teaching resources' },
      { id: 'professional-dev', label: 'professional-dev', icon: Hash, count: 23, description: 'Professional development' },
    ],
    student: [
      { id: 'general', label: 'general', icon: Hash, count: 34, description: 'Study discussions' },
      { id: 'homework-help', label: 'homework-help', icon: Hash, count: 28, description: 'Get help with homework' },
      { id: 'ai-assistant', label: 'ai-assistant', icon: Bot, count: 156, description: 'AI-powered help' },
      { id: 'study-groups', label: 'study-groups', icon: Hash, count: 42, description: 'Study groups' },
      { id: 'exam-prep', label: 'exam-prep', icon: Hash, count: 67, description: 'Exam preparation' },
      { id: 'career-guidance', label: 'career-guidance', icon: Hash, count: 23, description: 'Career guidance' },
      { id: 'projects', label: 'projects', icon: Hash, count: 89, description: 'Project discussions' },
      { id: 'resources', label: 'resources', icon: Hash, count: 134, description: 'Learning resources' },
      { id: 'tech-talk', label: 'tech-talk', icon: Hash, count: 45, description: 'Technology discussions' },
      { id: 'campus-life', label: 'campus-life', icon: Hash, count: 78, description: 'Campus activities' },
    ]
  }

  const currentChannels = user ? channels[user.role as keyof typeof channels] : channels.student

  // Initialize Groq bot
  const { processMessage: processGroqMessage, isProcessing, error } = useGroqBot(
    (message: any) => {
      setMessages(prev => [...prev, message])
    },
    selectedChannel
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      author: user || mockUsers[3],
      timestamp: new Date(),
      channel: selectedChannel
    }

    setMessages(prev => [...prev, message])
    
    // Check if message contains @sentient tag and process it
    const sentientTagRegex = /@sentient\b/i
    if (sentientTagRegex.test(newMessage)) {
      try {
        await processGroqMessage(newMessage)
      } catch (error) {
        console.error('Error processing Sentient message:', error)
      }
    }
    
    setNewMessage('')
  }

  const filteredMessages = messages.filter(message => message.channel === selectedChannel)
  const selectedChannelInfo = currentChannels.find(ch => ch.id === selectedChannel)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Community</h2>
              <p className="text-sm text-gray-600">Connect with educators</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search channels..."
                className="pl-10 bg-white border-gray-200"
              />
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Channels
              </h3>
              <div className="space-y-1">
                {currentChannels.map((channel) => {
                  const Icon = channel.icon
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                        selectedChannel === channel.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{channel.label}</span>
                      <span className="text-xs text-gray-400">{channel.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs">
                  {user?.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 border-b bg-white px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <h1 className="font-semibold text-gray-900">{selectedChannelInfo?.label}</h1>
                <p className="text-sm text-gray-500">{selectedChannelInfo?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {/* Presentation Generator for Lesson Planning Channel */}
              {selectedChannel === 'lesson-planning' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <PresentationGenerator 
                    onPresentationGenerated={() => {
                      // Add a message about the generated presentation
                      const presentationMessage = {
                        id: `presentation_${Date.now()}`,
                        content: `🎉 I just generated a presentation using the AI tool! Check it out in the presentation generator above.`,
                        author: user || mockUsers[3],
                        timestamp: new Date(),
                        channel: selectedChannel
                      }
                      setMessages(prev => [...prev, presentationMessage])
                    }}
                  />
                </motion.div>
              )}
              
              {filteredMessages.map((message, index) => {
                const showAvatar = index === 0 || filteredMessages[index - 1].author.id !== message.author.id
                const isConsecutive = index > 0 && filteredMessages[index - 1].author.id === message.author.id
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                  >
                    <div className="w-10 flex-shrink-0">
                      {showAvatar && (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.author.avatar || undefined} alt={message.author.name} />
                          <AvatarFallback className={`text-sm ${message.author.role === 'ai_assistant' ? 'bg-purple-100 text-purple-600' : ''}`}>
                            {message.author.role === 'ai_assistant' ? (
                              <Bot className="h-5 w-5" />
                            ) : (
                              message.author.name.split(' ').map((n: string) => n[0]).join('')
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold ${message.author.role === 'ai_assistant' ? 'text-purple-600' : 'text-gray-900'}`}>
                            {message.author.name}
                          </span>
                          <Badge 
                            variant={message.author.role === 'ai_assistant' ? 'default' : 'outline'} 
                            className={`text-xs capitalize ${message.author.role === 'ai_assistant' ? 'bg-purple-100 text-purple-700 border-purple-200' : ''}`}
                          >
                            {message.author.role === 'ai_assistant' ? 'AI Assistant' : message.author.role.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${selectedChannelInfo?.label} (use @sentient for AI help)`}
                    className="pr-20 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                  <span>💡 Tip: Type @sentient followed by your question to get AI assistance</span>
                  {isProcessing && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <div className="animate-spin h-3 w-3 border border-purple-600 border-t-transparent rounded-full"></div>
                      <span>AI thinking...</span>
                    </div>
                  )}
                  {error && (
                    <div className="text-red-500">
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}