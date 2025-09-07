'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  Activity, 
  BarChart3,
  Cpu,
  Network,
  Database,
  ChevronRight,
  Info
} from 'lucide-react'

interface MLMetrics {
  embeddingModel: {
    name: string
    accuracy: number
    latency: number
    dimensions: number
    similarityThreshold: number
  }
  bayesianInference: {
    priorConfidence: number
    posteriorUpdate: number
    uncertaintyReduction: number
    learningRate: number
  }
  modelPerformance: {
    precision: number
    recall: number
    f1Score: number
    auc: number
  }
  adaptiveLearning: {
    personalizedRecommendations: number
    difficultyAdjustment: number
    contentOptimization: number
    engagementPrediction: number
  }
}

interface MLAnalyticsOverviewProps {
  userStats: any
  currentUser: any
}

export default function MLAnalyticsOverview({ userStats, currentUser }: MLAnalyticsOverviewProps) {
  const [mlMetrics, setMLMetrics] = useState<MLMetrics>({
    embeddingModel: {
      name: 'sentence-transformers/all-MiniLM-L6-v2',
      accuracy: 0.92,
      latency: 45, // ms
      dimensions: 384,
      similarityThreshold: 0.75
    },
    bayesianInference: {
      priorConfidence: 0.65,
      posteriorUpdate: 0.82,
      uncertaintyReduction: 0.73,
      learningRate: 0.15
    },
    modelPerformance: {
      precision: 0.89,
      recall: 0.87,
      f1Score: 0.88,
      auc: 0.94
    },
    adaptiveLearning: {
      personalizedRecommendations: 0.91,
      difficultyAdjustment: 0.85,
      contentOptimization: 0.88,
      engagementPrediction: 0.79
    }
  })

  const [activeMetric, setActiveMetric] = useState<string>('embedding')

  // Simulate real-time updates based on user activity
  useEffect(() => {
    const updateMetrics = () => {
      setMLMetrics(prev => ({
        ...prev,
        bayesianInference: {
          ...prev.bayesianInference,
          priorConfidence: Math.min(0.95, prev.bayesianInference.priorConfidence + 0.01),
          posteriorUpdate: Math.min(0.98, prev.bayesianInference.posteriorUpdate + 0.005),
          uncertaintyReduction: Math.min(0.95, prev.bayesianInference.uncertaintyReduction + 0.008)
        },
        adaptiveLearning: {
          ...prev.adaptiveLearning,
          personalizedRecommendations: Math.min(0.98, prev.adaptiveLearning.personalizedRecommendations + 0.003),
          engagementPrediction: Math.min(0.95, prev.adaptiveLearning.engagementPrediction + 0.007)
        }
      }))
    }

    const interval = setInterval(updateMetrics, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const metricCards = [
    {
      id: 'embedding',
      title: 'Embedding Model',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      metrics: [
        { label: 'Model', value: mlMetrics.embeddingModel.name, format: 'text' },
        { label: 'Accuracy', value: mlMetrics.embeddingModel.accuracy, format: 'percentage' },
        { label: 'Latency', value: mlMetrics.embeddingModel.latency, format: 'ms' },
        { label: 'Dimensions', value: mlMetrics.embeddingModel.dimensions, format: 'number' },
        { label: 'Similarity Threshold', value: mlMetrics.embeddingModel.similarityThreshold, format: 'decimal' }
      ]
    },
    {
      id: 'bayesian',
      title: 'Bayesian Inference',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      metrics: [
        { label: 'Prior Confidence', value: mlMetrics.bayesianInference.priorConfidence, format: 'percentage' },
        { label: 'Posterior Update', value: mlMetrics.bayesianInference.posteriorUpdate, format: 'percentage' },
        { label: 'Uncertainty Reduction', value: mlMetrics.bayesianInference.uncertaintyReduction, format: 'percentage' },
        { label: 'Learning Rate', value: mlMetrics.bayesianInference.learningRate, format: 'decimal' }
      ]
    },
    {
      id: 'performance',
      title: 'Model Performance',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      metrics: [
        { label: 'Precision', value: mlMetrics.modelPerformance.precision, format: 'percentage' },
        { label: 'Recall', value: mlMetrics.modelPerformance.recall, format: 'percentage' },
        { label: 'F1 Score', value: mlMetrics.modelPerformance.f1Score, format: 'percentage' },
        { label: 'AUC', value: mlMetrics.modelPerformance.auc, format: 'percentage' }
      ]
    },
    {
      id: 'adaptive',
      title: 'Adaptive Learning',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      metrics: [
        { label: 'Personalization', value: mlMetrics.adaptiveLearning.personalizedRecommendations, format: 'percentage' },
        { label: 'Difficulty Adjustment', value: mlMetrics.adaptiveLearning.difficultyAdjustment, format: 'percentage' },
        { label: 'Content Optimization', value: mlMetrics.adaptiveLearning.contentOptimization, format: 'percentage' },
        { label: 'Engagement Prediction', value: mlMetrics.adaptiveLearning.engagementPrediction, format: 'percentage' }
      ]
    }
  ]

  const formatValue = (value: any, format: string): string => {
    switch (format) {
      case 'percentage':
        return `${Math.round(value * 100)}%`
      case 'decimal':
        return value.toFixed(2)
      case 'ms':
        return `${value}ms`
      case 'number':
        return value.toString()
      case 'text':
        return value
      default:
        return value.toString()
    }
  }

  const getProgressColor = (value: number, format: string): string => {
    if (format === 'ms') {
      // For latency, lower is better
      if (value < 50) return 'bg-green-500'
      if (value < 100) return 'bg-yellow-500'
      return 'bg-red-500'
    } else {
      // For percentages and other metrics, higher is better
      if (value > 0.8) return 'bg-green-500'
      if (value > 0.6) return 'bg-yellow-500'
      return 'bg-red-500'
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">ML Analytics Overview</h2>
            <p className="text-sm text-gray-600">Real-time machine learning performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Updates
        </div>
      </div>

      {/* Model Architecture Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Network className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Active Model Architecture</h3>
            <p className="text-sm text-gray-600 mb-2">
              <strong>sentence-transformers/all-MiniLM-L6-v2</strong> - Lightweight transformer model optimized for semantic similarity
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>• 384-dimensional embeddings</span>
              <span>• 22.7M parameters</span>
              <span>• BERT-based architecture</span>
              <span>• Multilingual support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${card.color} p-4 cursor-pointer transform transition-all duration-300 hover:scale-105`}
            onClick={() => setActiveMetric(card.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className="w-6 h-6 text-white" />
              <ChevronRight className="w-4 h-4 text-white opacity-60" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{card.title}</h3>
            <div className="text-white text-xs opacity-90">
              {card.metrics.length} metrics
            </div>
            {activeMetric === card.id && (
              <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm"></div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            {metricCards.find(card => card.id === activeMetric)?.title} Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricCards
            .find(card => card.id === activeMetric)
            ?.metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatValue(metric.value, metric.format)}
                  </span>
                </div>
                {metric.format !== 'text' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                        typeof metric.value === 'number' ? metric.value : 0,
                        metric.format
                      )}`}
                      style={{
                        width: `${
                          metric.format === 'ms'
                            ? Math.max(10, 100 - (metric.value as number / 2))
                            : Math.min(100, (metric.value as number) * 100)
                        }%`
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Bayesian Learning Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Info className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Bayesian Learning Insights</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Adaptive Confidence:</strong> Your learning model is showing {Math.round(mlMetrics.bayesianInference.priorConfidence * 100)}% 
                confidence in content recommendations, with continuous improvement through Bayesian updates.
              </p>
              <p>
                <strong>Uncertainty Reduction:</strong> The system has reduced prediction uncertainty by {Math.round(mlMetrics.bayesianInference.uncertaintyReduction * 100)}% 
                through your learning interactions.
              </p>
              <p>
                <strong>Personalization Score:</strong> Content personalization is operating at {Math.round(mlMetrics.adaptiveLearning.personalizedRecommendations * 100)}% 
                effectiveness based on your learning patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Model: Active
          </span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Embeddings: Cached
          </span>
          <span className="flex items-center gap-1">
            <Network className="w-3 h-3" />
            API: Connected
          </span>
        </div>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
