'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Brain, 
  Zap,
  Play,
  CheckCircle,
  Star,
  Plus,
  Search,
  MessageSquare,
  FileText,
  Presentation,
  GraduationCap,
  Users,
  Settings,
  User
} from 'lucide-react'
import LearningCard from '@/components/LearningCard'
import ProgressBar from '@/components/ProgressBar'
import UserSelector from '@/components/UserSelector'
import Sidebar from '@/components/Sidebar'
import AnalyticsPopup from '@/components/AnalyticsPopup'
import CourseManagementPopup from '@/components/CourseManagementPopup'
import Chatbot from '@/components/Chatbot'
import PPTCreationPopup from '@/components/PPTCreationPopup'
import LessonPlanningPopup from '@/components/LessonPlanningPopup'
import ContentGenerationPopup from '@/components/ContentGenerationPopup'
import AITutorPopup from '@/components/AITutorPopup'
import { supabase } from '@/lib/supabase'

interface LearningModule {
  id: string
  title: string
  description: string
  difficulty_level: number
  estimated_duration: number
  progress?: number
  isCompleted?: boolean
  isActive?: boolean
  image?: string
}

interface UserStats {
  totalModules: number
  completedModules: number
  averageScore: number
  totalTime: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats>({
    totalModules: 0,
    completedModules: 0,
    averageScore: 0,
    totalTime: 0
  })

  const [learningModules, setLearningModules] = useState<LearningModule[]>([])
  const [filteredModules, setFilteredModules] = useState<LearningModule[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [isCourseManagementOpen, setIsCourseManagementOpen] = useState(false)
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [isPPTCreationOpen, setIsPPTCreationOpen] = useState(false)
  const [isLessonPlanningOpen, setIsLessonPlanningOpen] = useState(false)
  const [isContentGenerationOpen, setIsContentGenerationOpen] = useState(false)
  const [isAITutorOpen, setIsAITutorOpen] = useState(false)
  const [selectedCourseForChat, setSelectedCourseForChat] = useState<string | undefined>()

  // Comprehensive dummy modules for demo (hardcoded)
  const dummyModules: LearningModule[] = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      description: 'Discover the fundamentals of ML algorithms, supervised vs unsupervised learning, and real-world applications in recommendation systems, image recognition, and natural language processing.',
      difficulty_level: 2,
      estimated_duration: 15,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '2',
      title: 'Climate Change & Sustainability',
      description: 'Understand climate science, greenhouse gas effects, renewable energy solutions, carbon footprint reduction, and sustainable business practices for environmental protection.',
      difficulty_level: 3,
      estimated_duration: 20,
      progress: 75,
      isCompleted: false,
      isActive: true,
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '3',
      title: 'Data Structures and Algorithms',
      description: 'Master essential data structures (arrays, stacks, queues, trees, graphs), Big O notation, sorting/searching algorithms, and problem-solving strategies for technical interviews and efficient programming.',
      difficulty_level: 4,
      estimated_duration: 12,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '4',
      title: 'Digital Marketing Fundamentals',
      description: 'Learn modern digital marketing strategies including SEO optimization, social media marketing, content creation, email campaigns, and Google Analytics for business growth.',
      difficulty_level: 3,
      estimated_duration: 18,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '5',
      title: 'Cybersecurity Essentials',
      description: 'Protect systems and data from cyber threats with modern security practices, encryption methods, network security, incident response, and ethical hacking principles.',
      difficulty_level: 4,
      estimated_duration: 14,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '6',
      title: 'Financial Literacy & Investment',
      description: 'Master personal finance management, investment strategies, stock market analysis, retirement planning, risk assessment, and wealth building principles for financial independence.',
      difficulty_level: 5,
      estimated_duration: 25,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '7',
      title: 'Python Programming Basics',
      description: 'Start your programming journey with Python fundamentals, variables, functions, loops, data types, and basic problem-solving techniques for beginners.',
      difficulty_level: 1,
      estimated_duration: 22,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '8',
      title: 'Web Development Fundamentals',
      description: 'Learn HTML5, CSS3, and JavaScript basics to build responsive websites, understand DOM manipulation, and create interactive user interfaces for modern web applications.',
      difficulty_level: 2,
      estimated_duration: 30,
      progress: 45,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '9',
      title: 'Advanced React Development',
      description: 'Deep dive into React hooks, context API, performance optimization, testing strategies, and modern development patterns for building scalable applications.',
      difficulty_level: 4,
      estimated_duration: 35,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '10',
      title: 'UX/UI Design Principles',
      description: 'Understand user experience design, interface design principles, wireframing, prototyping, user research methods, and design thinking for creating intuitive products.',
      difficulty_level: 3,
      estimated_duration: 28,
      progress: 60,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '11',
      title: 'Blockchain & Cryptocurrency',
      description: 'Explore blockchain technology, cryptocurrency fundamentals, smart contracts, DeFi protocols, NFTs, and the future of decentralized finance systems.',
      difficulty_level: 5,
      estimated_duration: 40,
      progress: 0,
      isCompleted: false,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop&crop=center'
    },
    {
      id: '12',
      title: 'Project Management Essentials',
      description: 'Master project management methodologies including Agile, Scrum, risk management, team leadership, resource planning, and delivery optimization techniques.',
      difficulty_level: 3,
      estimated_duration: 26,
      progress: 100,
      isCompleted: true,
      isActive: false,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop&crop=center'
    }
  ]

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Refresh data when returning to dashboard (e.g., from completing a module)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh completion status and recalculate stats when tab becomes visible
        loadDashboardData()
      }
    }

    // Also listen for focus events to catch when user returns from another tab/window
    const handleFocus = () => {
      loadDashboardData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Filter modules based on selected difficulty
  useEffect(() => {
    if (selectedDifficulty === 'all') {
      setFilteredModules(learningModules)
    } else {
      const filtered = learningModules.filter(module => 
        module.difficulty_level === parseInt(selectedDifficulty)
      )
      setFilteredModules(filtered)
    }
  }, [learningModules, selectedDifficulty])

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDifficulty(event.target.value)
  }

  // Calculate cumulative score based on completed modules
  const calculateCumulativeScore = (completedModules: LearningModule[]) => {
    if (completedModules.length === 0) return 0
    
    // Each module has 2 questions, so total possible correct answers = completedModules * 2
    const totalPossibleAnswers = completedModules.length * 2
    
    // Simulate quiz performance from localStorage or generate based on completion
    let totalCorrectAnswers = 0
    
    completedModules.forEach(module => {
      // Check if we have stored quiz results for this module
      const quizResults = localStorage.getItem(`quiz_results_${module.id}`)
      if (quizResults) {
        try {
          const results = JSON.parse(quizResults)
          totalCorrectAnswers += results.correctAnswers || 0
        } catch (error) {
          // If no stored results, simulate based on difficulty and generate realistic performance
          // Easier modules (level 1-2) have higher success rates
          const successRate = module.difficulty_level <= 2 ? 0.85 : 
                             module.difficulty_level <= 3 ? 0.75 : 
                             module.difficulty_level <= 4 ? 0.65 : 0.55
          
          // Generate 1-2 correct answers based on success rate
          const correctForThisModule = Math.random() < successRate ? 
            (Math.random() < 0.8 ? 2 : 1) : 1 // At least 1 correct (since module was completed)
          totalCorrectAnswers += correctForThisModule
          
          // Store the simulated results
          localStorage.setItem(`quiz_results_${module.id}`, JSON.stringify({
            correctAnswers: correctForThisModule,
            totalQuestions: 2
          }))
        }
      } else {
        // Generate realistic performance for first time
        const successRate = module.difficulty_level <= 2 ? 0.85 : 
                           module.difficulty_level <= 3 ? 0.75 : 
                           module.difficulty_level <= 4 ? 0.65 : 0.55
        
        const correctForThisModule = Math.random() < successRate ? 
          (Math.random() < 0.8 ? 2 : 1) : 1
        totalCorrectAnswers += correctForThisModule
        
        localStorage.setItem(`quiz_results_${module.id}`, JSON.stringify({
          correctAnswers: correctForThisModule,
          totalQuestions: 2
        }))
      }
    })
    
    // Calculate percentage
    const percentage = Math.round((totalCorrectAnswers / totalPossibleAnswers) * 100)
    return percentage
  }

  const loadDashboardData = async (userId?: string) => {
    try {
      setIsLoading(true)
      console.log('🔄 Loading dashboard data...')

      // Use dummy data for demo
      const defaultUser = {
        id: 'demo-user',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        learning_style: 'visual',
        competence_level: 3.2,
        engagement_score: 0.85
      }
      setCurrentUser(defaultUser)

      // Load completed modules from localStorage
      let completedModules = []
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]')
        }
      } catch (error) {
        console.warn('Could not access localStorage:', error)
        completedModules = []
      }
      
      // Use dummy modules with completion status
      const modulesWithCompletion = dummyModules.map(module => ({
        ...module,
        isCompleted: completedModules.includes(module.id),
        progress: completedModules.includes(module.id) ? 100 : module.progress
      }))
      
      setLearningModules(modulesWithCompletion)

      // Calculate stats from updated modules data
      const completedCount = modulesWithCompletion.filter(m => m.isCompleted).length
      const completedModulesList = modulesWithCompletion.filter(m => m.isCompleted)
      
      // Calculate total time from completed modules' estimated durations
      const totalTime = completedModulesList
        .reduce((sum, module) => sum + module.estimated_duration, 0)
      
      // Calculate cumulative score based on quiz performance
      const averageScore = calculateCumulativeScore(completedModulesList)

      const stats = {
        totalModules: modulesWithCompletion.length,
        completedModules: completedCount,
        averageScore,
        totalTime
      }

      console.log('✅ Using dummy data for demo:', stats)
      setUserStats(stats)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModuleClick = (moduleId: string) => {
    // Set the module as active
    setLearningModules(prev => 
      prev.map(module => ({
        ...module,
        isActive: module.id === moduleId
      }))
    )
    
    // Navigate to the module page
    router.push(`/learn/${moduleId}`)
  }

  const handleUserChange = (user: any) => {
    // Update current user and recalculate stats
    setCurrentUser(user)
    
    // Simulate different progress for different users
    const userModules = dummyModules.map(module => {
      if (user.id === 'demo-user-1') {
        // Alex Johnson - some progress
        return {
          ...module,
          progress: module.id === '2' ? 75 : module.id === '3' ? 100 : 0,
          isCompleted: module.id === '3',
          isActive: module.id === '2'
        }
      } else if (user.id === 'demo-user-2') {
        // Sarah Chen - more progress
        return {
          ...module,
          progress: module.id === '1' ? 100 : module.id === '2' ? 100 : module.id === '3' ? 60 : 0,
          isCompleted: module.id === '1' || module.id === '2',
          isActive: module.id === '3'
        }
      } else if (user.id === 'demo-user-3') {
        // Mike Rodriguez - expert level
        return {
          ...module,
          progress: module.id === '1' ? 100 : module.id === '2' ? 100 : module.id === '3' ? 100 : module.id === '4' ? 80 : 0,
          isCompleted: module.id === '1' || module.id === '2' || module.id === '3',
          isActive: module.id === '4'
        }
      }
      return module
    })
    
    setLearningModules(userModules)
    
    // Update stats based on user
    const completedCount = userModules.filter(m => m.isCompleted).length
    const completedModulesList = userModules.filter(m => m.isCompleted)
    
    // Calculate total time from completed modules' estimated durations
    const totalTime = completedModulesList
      .reduce((sum, module) => sum + module.estimated_duration, 0)
    
    // Calculate cumulative score based on quiz performance
    const averageScore = calculateCumulativeScore(completedModulesList)
    
    setUserStats({
      totalModules: dummyModules.length,
      completedModules: completedCount,
      averageScore,
      totalTime
    })
  }

  const handleOpenChatbot = (courseTitle?: string) => {
    setSelectedCourseForChat(courseTitle)
    setIsChatbotOpen(true)
  }

  const handleGeneralChat = (message: string, mediaFiles?: any[]) => {
    console.log('General chat received:', message, mediaFiles)
    // Open chatbot with general context
    setSelectedCourseForChat(undefined)
    setIsChatbotOpen(true)
    
    // You can add additional logic here to pre-populate the chatbot with the message
    // For now, it will open the chatbot and the user can ask their question
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Modules Completed',
      value: userStats.completedModules,
      total: userStats.totalModules,
      color: 'text-blue-600'
    },
    {
      icon: Target,
      label: 'Quiz Score',
      value: userStats.averageScore,
      suffix: '%',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Total Time',
      value: userStats.totalTime,
      suffix: ' min',
      color: 'text-purple-600'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        currentUser={currentUser}
        onAnalyticsClick={() => setIsAnalyticsOpen(true)}
        onChatHistoryClick={() => setIsChatHistoryOpen(true)}
        onPPTCreationClick={() => setIsPPTCreationOpen(true)}
        onLessonPlanningClick={() => setIsLessonPlanningOpen(true)}
        onContentGenerationClick={() => setIsContentGenerationOpen(true)}
        onAITutorClick={() => setIsAITutorOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Learning Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back{currentUser ? `, ${currentUser.name}` : ''}! Ready to continue your learning journey?
                </p>
                {currentUser && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Learning Style: {currentUser.learning_style}</span>
                    <span>•</span>
                    <span>Competence Level: {currentUser.competence_level}/5</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <UserSelector 
                  currentUser={currentUser}
                  onUserChange={handleUserChange}
                />
                <div className="text-right">
                  <div className="text-sm text-gray-500">Quiz Score</div>
                  <div className="text-2xl font-bold text-green-600">{userStats.averageScore}%</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-sm text-gray-500">{stat.suffix}</span>
                    )}
                  </div>
                  {stat.total && (
                    <div className="text-xs text-gray-500 mt-1">
                      of {stat.total} total
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Learning Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Learning Progress</h2>
            <span className="text-sm text-gray-500">
              {userStats.completedModules} of {userStats.totalModules} modules completed
            </span>
          </div>
          <ProgressBar
            progress={userStats.completedModules}
            total={userStats.totalModules}
            showPercentage={true}
            showCount={true}
          />
        </div>

        {/* Add New Course Section */}
        

        {/* Greeting Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hey sentient, how's it going?</h2>
          <p className="text-gray-600">Ready to dive into your learning journey today?</p>
        </div>

        {/* Add New Course Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group cursor-pointer"
            onClick={() => setIsCourseManagementOpen(true)}
          >
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-8 h-32 flex items-center justify-center border-2 border-dashed border-purple-400 hover:border-purple-300 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                  <Plus className="w-6 h-6 text-purple-300" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-purple-200">
                    Add New Course
                  </h3>
                  <p className="text-purple-300 text-sm opacity-80">
                    Create a new learning module to expand your curriculum
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Learning Modules */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Learning Modules</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter by difficulty</span>
              <select 
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
              >
                <option value="all">All Levels</option>
                <option value="1">Beginner</option>
                <option value="2">Easy</option>
                <option value="3">Intermediate</option>
                <option value="4">Advanced</option>
                <option value="5">Expert</option>
              </select>
            </div>
          </div>

          {/* Learning Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.length > 0 ? (
              filteredModules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="cursor-pointer"
                  onClick={() => handleModuleClick(module.id)}
                >
                  <LearningCard
                    title={module.title}
                    description={module.description}
                    difficulty={module.difficulty_level}
                    duration={module.estimated_duration}
                    progress={module.progress}
                    isCompleted={module.isCompleted}
                    isActive={module.isActive}
                    image={module.image}
                    onClick={() => handleModuleClick(module.id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
                <p className="text-gray-500">
                  No learning modules match the selected difficulty level. Try selecting a different filter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready for your next lesson?</h3>
              <p className="text-blue-100">
                Continue where you left off or explore new topics
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
              </button>
              <button className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-2 rounded-lg font-medium transition-all duration-300">
                Browse Topics
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Popups */}
      <AnalyticsPopup 
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        userStats={userStats}
      />
      
      <CourseManagementPopup 
        isOpen={isCourseManagementOpen}
        onClose={() => setIsCourseManagementOpen(false)}
        learningModules={learningModules}
        onOpenChatbot={handleOpenChatbot}
        onGeneralChat={handleGeneralChat}
      />
      
      <Chatbot 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        courseTitle={selectedCourseForChat}
        userLevel={currentUser?.competence_level > 4 ? 'advanced' : currentUser?.competence_level > 2 ? 'intermediate' : 'beginner'}
        learningStyle={currentUser?.learning_style || 'visual'}
      />
      
      <PPTCreationPopup 
        isOpen={isPPTCreationOpen}
        onClose={() => setIsPPTCreationOpen(false)}
      />
      
      <LessonPlanningPopup 
        isOpen={isLessonPlanningOpen}
        onClose={() => setIsLessonPlanningOpen(false)}
      />
      
      <ContentGenerationPopup 
        isOpen={isContentGenerationOpen}
        onClose={() => setIsContentGenerationOpen(false)}
      />
      
      <AITutorPopup 
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
      />
    </div>
  )
}
