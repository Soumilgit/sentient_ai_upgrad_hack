'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Target, 
  Loader2,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  Play,
  Download,
  FileText
} from 'lucide-react'

interface LessonPlanningPopupProps {
  isOpen: boolean
  onClose: () => void
}

interface LessonPlan {
  title: string
  description: string
  learningObjectives: string[]
  prerequisites: string[]
  materials: string[]
  lessonStructure: {
    phase: string
    duration: string
    activities: string[]
    description: string
  }[]
  assessments: {
    type: string
    description: string
    method: string
  }[]
  differentiation: {
    forStrugglingStudents: string
    forAdvancedStudents: string
  }
  estimatedDuration: string
  gradeLevel: string
}

export default function LessonPlanningPopup({ isOpen, onClose }: LessonPlanningPopupProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null)
  const [prompt, setPrompt] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [duration, setDuration] = useState('60')
  const [learningStyle, setLearningStyle] = useState('visual')

  const generateLessonPlan = async () => {
    if (!prompt.trim()) {
      alert('Please enter a lesson topic!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai-features/lesson-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          subject: subject.trim() || 'General',
          gradeLevel: gradeLevel.trim() || 'Middle School',
          duration: parseInt(duration),
          learningStyle,
          includeAudio: true
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLessonPlan(result)
        } else {
          alert('Failed to generate lesson plan. Please try again.')
        }
      } else {
        alert('Failed to generate lesson plan. Please try again.')
      }
    } catch (error) {
      console.error('Error generating lesson plan:', error)
      alert('Error generating lesson plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadLessonPlan = () => {
    if (!lessonPlan) return

    const content = `
# ${lessonPlan.title}

## Description
${lessonPlan.description}

## Learning Objectives
${lessonPlan.learningObjectives.map(obj => `- ${obj}`).join('\n')}

## Prerequisites
${lessonPlan.prerequisites.map(req => `- ${req}`).join('\n')}

## Materials Needed
${lessonPlan.materials.map(material => `- ${material}`).join('\n')}

## Lesson Structure
${lessonPlan.lessonStructure.map(phase => `
### ${phase.phase} (${phase.duration})
${phase.description}

Activities:
${phase.activities.map(activity => `- ${activity}`).join('\n')}
`).join('\n')}

## Assessments
${lessonPlan.assessments.map(assessment => `
### ${assessment.type}
**Description:** ${assessment.description}
**Method:** ${assessment.method}
`).join('\n')}

## Differentiation
**For Struggling Students:** ${lessonPlan.differentiation.forStrugglingStudents}
**For Advanced Students:** ${lessonPlan.differentiation.forAdvancedStudents}

## Duration: ${lessonPlan.estimatedDuration}
## Grade Level: ${lessonPlan.gradeLevel}
    `.trim()

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lessonPlan.title.replace(/[^a-z0-9]/gi, '_')}_lesson_plan.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
            className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                Customized Lesson Planning
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Input Section */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Topic *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Teach 6th graders about integers and number types with hands-on activities'"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Math, Science"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="e.g., 6th Grade"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Style
                  </label>
                  <select
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateLessonPlan}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Lesson Plan...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Generate Personalized Lesson Plan
                  </>
                )}
              </button>
            </div>

            {/* Generated Lesson Plan Display */}
            {lessonPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {lessonPlan.title}
                  </h3>
                  <button
                    onClick={downloadLessonPlan}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Description
                      </h4>
                      <p className="text-gray-700 text-sm">{lessonPlan.description}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Learning Objectives
                      </h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        {lessonPlan.learningObjectives.map((obj, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-600" />
                        Materials Needed
                      </h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        {lessonPlan.materials.map((material, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-600 mt-1">•</span>
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        Lesson Structure
                      </h4>
                      <div className="space-y-3">
                        {lessonPlan.lessonStructure.map((phase, index) => (
                          <div key={index} className="border-l-2 border-purple-200 pl-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 text-sm">{phase.phase}</span>
                              <span className="text-purple-600 text-xs">{phase.duration}</span>
                            </div>
                            <p className="text-gray-600 text-xs mb-2">{phase.description}</p>
                            <div className="text-xs text-gray-500">
                              Activities: {phase.activities.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        Assessment & Differentiation
                      </h4>
                      <div className="space-y-2 text-sm">
                        {lessonPlan.assessments.map((assessment, index) => (
                          <div key={index}>
                            <span className="font-medium text-gray-900">{assessment.type}:</span>
                            <span className="text-gray-700 ml-1">{assessment.method}</span>
                          </div>
                        ))}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="mb-2">
                            <span className="font-medium text-gray-900">For Struggling Students:</span>
                            <p className="text-gray-700 text-xs mt-1">{lessonPlan.differentiation.forStrugglingStudents}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">For Advanced Students:</span>
                            <p className="text-gray-700 text-xs mt-1">{lessonPlan.differentiation.forAdvancedStudents}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3">
                  <span>Duration: {lessonPlan.estimatedDuration}</span>
                  <span>Grade Level: {lessonPlan.gradeLevel}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
