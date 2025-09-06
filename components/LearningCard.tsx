'use client'

import { motion } from 'framer-motion'
import { Clock, Target, Star, Play } from 'lucide-react'

interface LearningCardProps {
  title: string
  description: string
  difficulty: number
  duration: number
  progress?: number
  isCompleted?: boolean
  isActive?: boolean
  image?: string
  onClick?: () => void
}

export default function LearningCard({
  title,
  description,
  difficulty,
  duration,
  progress = 0,
  isCompleted = false,
  isActive = false,
  image,
  onClick
}: LearningCardProps) {
  const difficultyColors = [
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800'
  ]

  const difficultyLabels = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert']

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        learning-card cursor-pointer relative overflow-hidden
        ${isActive ? 'active' : ''}
        ${isCompleted ? 'opacity-75' : ''}
      `}
      onClick={onClick}
    >
      {/* Progress Bar */}
      {progress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white fill-current" />
          </div>
        </div>
      )}

      {/* Course Image */}
      {image && (
        <div className="h-32 w-full overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-2 ml-4">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[difficulty - 1]}`}>
              {difficultyLabels[difficulty - 1]}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>Level {difficulty}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="text-green-600 font-medium text-sm">
                Completed
              </span>
            ) : progress > 0 ? (
              <span className="text-blue-600 font-medium text-sm">
                {Math.round(progress)}% Complete
              </span>
            ) : (
              <span className="text-gray-500 text-sm">
                Not Started
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium text-sm">
              {isCompleted ? 'Review' : 'Start'}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}
