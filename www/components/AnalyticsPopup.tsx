'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Users, Clock, Target, BarChart3 } from 'lucide-react'

interface AnalyticsPopupProps {
  isOpen: boolean
  onClose: () => void
  userStats: any
}

export default function AnalyticsPopup({ isOpen, onClose, userStats }: AnalyticsPopupProps) {
  const analyticsData = [
    {
      title: "Learning Progress",
      value: `${userStats.completedModules}/${userStats.totalModules}`,
      percentage: Math.round((userStats.completedModules / userStats.totalModules) * 100),
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Average Score",
      value: `${userStats.averageScore}%`,
      percentage: userStats.averageScore,
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Total Study Time",
      value: `${userStats.totalTime} min`,
      percentage: Math.min(100, (userStats.totalTime / 500) * 100),
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Learning Streak",
      value: `${userStats.streak} days`,
      percentage: Math.min(100, (userStats.streak / 30) * 100),
      icon: BarChart3,
      color: "text-orange-600"
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
            className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Learning Analytics</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsData.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.color === 'text-blue-600' ? 'bg-blue-500' :
                        item.color === 'text-green-600' ? 'bg-green-500' :
                        item.color === 'text-purple-600' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.percentage}% of target</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Learning Insights</h3>
              <p className="text-blue-800 text-sm">
                You're making great progress! Your {userStats.streak}-day streak shows consistent learning habits. 
                Consider focusing on the remaining modules to complete your learning journey.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
