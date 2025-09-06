'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  total: number
  showPercentage?: boolean
  showCount?: boolean
  className?: string
  animated?: boolean
}

export default function ProgressBar({
  progress,
  total,
  showPercentage = true,
  showCount = false,
  className = '',
  animated = true
}: ProgressBarProps) {
  const percentage = Math.min((progress / total) * 100, 100)

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Info */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          {showCount && (
            <span className="text-sm text-gray-500">
              {progress} of {total}
            </span>
          )}
        </div>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: "easeOut" } : { duration: 0 }}
        />
      </div>

      {/* Progress Steps (Optional) */}
      {total <= 10 && (
        <div className="flex justify-between mt-2">
          {Array.from({ length: total }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index < progress
                  ? 'bg-blue-500'
                  : index === progress
                  ? 'bg-blue-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
