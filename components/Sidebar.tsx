'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  MessageSquare, 
  Bot, 
  FileText, 
  Target, 
  BookOpen, 
  Gamepad2, 
  MessageCircle,
  X,
  User,
  CreditCard,
  Users
} from 'lucide-react'
import Link from 'next/link'
import CommunityForum from './CommunityForum'

interface SidebarProps {
  currentUser: any
  onAnalyticsClick: () => void
  onChatHistoryClick: () => void
  onPPTCreationClick: () => void
  onLessonPlanningClick: () => void
  onContentGenerationClick: () => void
  onAITutorClick: () => void
}

export default function Sidebar({ 
  currentUser, 
  onAnalyticsClick, 
  onChatHistoryClick, 
  onPPTCreationClick,
  onLessonPlanningClick,
  onContentGenerationClick,
  onAITutorClick 
}: SidebarProps) {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)

  const chatHistory = [
    { id: 1, title: "Machine Learning Basics Discussion", timestamp: "2 hours ago", unread: 3 },
    { id: 2, title: "React Hooks Q&A", timestamp: "1 day ago", unread: 0 },
    { id: 3, title: "Database Design Help", timestamp: "2 days ago", unread: 1 },
    { id: 4, title: "Algorithm Optimization", timestamp: "3 days ago", unread: 0 },
    { id: 5, title: "API Security Best Practices", timestamp: "1 week ago", unread: 2 }
  ]

  const aiFeatures = [
    { icon: FileText, title: "PPT Creation", description: "Generate presentations from course content", onClick: onPPTCreationClick },
    { icon: Target, title: "Customized Lesson Planning", description: "AI-powered personalized learning paths", onClick: onLessonPlanningClick },
    { icon: BookOpen, title: "Content Generation", description: "Create quizzes, exercises, and materials", onClick: onContentGenerationClick },
    { icon: Bot, title: "AI Tutor", description: "24/7 intelligent learning assistant", onClick: onAITutorClick }
  ]

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search channels..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MessageSquare className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Overview Section - Fixed (no expand/collapse) */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 mb-3">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Overview</span>
        </div>

        <div className="space-y-1">
          <button
            onClick={onAnalyticsClick}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Analytics Dashboard</span>
          </button>
          
          <Link
            href="/pricing"
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <CreditCard className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Upgrade Plans</span>
          </Link>
        </div>
      </div>

      {/* Chat History Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">CHAT HISTORY</h3>
        <div className="space-y-1">
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={onChatHistoryClick}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">{chat.title}</div>
                  <div className="text-xs text-gray-500">{chat.timestamp}</div>
                </div>
              </div>
              {chat.unread > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {chat.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* AI Features Section */}
      <div className="p-4 border-t border-gray-200 flex-1">
        <button
          onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">AI Features</span>
          </div>
          <motion.div
            animate={{ rotate: isFeaturesOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isFeaturesOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-2"
            >
              {aiFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={feature.onClick}
                >
                  <div className="flex items-start gap-3">
                    <feature.icon className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{feature.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Community Forum Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setIsCommunityOpen(true)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200"
        >
          <Users className="w-5 h-5 text-blue-600" />
          <div className="flex-1 text-left">
            <div className="font-medium text-gray-700">Community Forum</div>
            <div className="text-xs text-gray-500">Connect with educators</div>
          </div>
          <div className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            12
          </div>
        </button>
      </div>

      {/* Community Forum Modal */}
      <CommunityForum 
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />

      {/* User Profile */}
      {currentUser && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{currentUser.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}