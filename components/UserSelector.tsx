'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, ChevronDown, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  name: string
  email: string
  learning_style: string
  competence_level: number
  engagement_score: number
}

interface UserSelectorProps {
  currentUser: UserData | null
  onUserChange: (user: UserData) => void
}

export default function UserSelector({ currentUser, onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      console.log('🔄 Loading users for selector...')
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')

      if (error) {
        console.error('❌ Error loading users:', error)
        // Create demo users if RLS blocks access
        const demoUsers = [
          {
            id: 'demo-user-1',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            learning_style: 'visual',
            competence_level: 3.2,
            engagement_score: 0.85
          },
          {
            id: 'demo-user-2',
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            learning_style: 'auditory',
            competence_level: 2.8,
            engagement_score: 0.92
          },
          {
            id: 'demo-user-3',
            name: 'Mike Rodriguez',
            email: 'mike@example.com',
            learning_style: 'kinesthetic',
            competence_level: 4.1,
            engagement_score: 0.78
          }
        ]
        setUsers(demoUsers)
        return
      }

      console.log('✅ Users loaded for selector:', data?.length || 0, 'users')
      setUsers(data || [])
    } catch (error) {
      console.error('❌ Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: UserData) => {
    onUserChange(user)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <User className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">
          {currentUser ? currentUser.name : 'Select User'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.learning_style} • Level {user.competence_level}/5
                </div>
              </div>
              {currentUser?.id === user.id && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
