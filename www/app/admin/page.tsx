'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react'

export default function AdminPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [status, setStatus] = useState<{
    initialized: boolean
    message: string
    error?: string
  } | null>(null)

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/admin/init-db')
      const data = await response.json()
      
      setStatus({
        initialized: data.initialized,
        message: data.message,
        error: data.error
      })
    } catch (error) {
      setStatus({
        initialized: false,
        message: 'Failed to check database status',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const initializeDatabase = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch('/api/admin/init-db', {
        method: 'POST'
      })
      const data = await response.json()
      
      setStatus({
        initialized: data.success,
        message: data.message,
        error: data.error
      })
    } catch (error) {
      setStatus({
        initialized: false,
        message: 'Failed to initialize database',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Administration
          </h1>
          <p className="text-gray-600">
            Initialize and manage your Supabase database schema
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Status Check */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Database Status
            </h2>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={checkDatabaseStatus}
                className="btn btn-secondary px-4 py-2 rounded-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </button>
            </div>

            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  status.initialized 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {status.initialized ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    status.initialized ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {status.initialized ? 'Database Ready' : 'Database Not Initialized'}
                  </span>
                </div>
                <p className={`text-sm ${
                  status.initialized ? 'text-green-700' : 'text-red-700'
                }`}>
                  {status.message}
                </p>
                {status.error && (
                  <p className="text-sm text-red-600 mt-2">
                    Error: {status.error}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Database Initialization */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Initialize Database
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">What this will do:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Create all necessary database tables</li>
                <li>• Set up indexes for better performance</li>
                <li>• Enable Row Level Security (RLS)</li>
                <li>• Create security policies</li>
                <li>• Insert sample learning modules</li>
              </ul>
            </div>

            <button
              onClick={initializeDatabase}
              disabled={isInitializing || status?.initialized}
              className={`btn px-6 py-3 rounded-lg font-medium ${
                isInitializing || status?.initialized
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isInitializing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Initializing Database...
                </>
              ) : status?.initialized ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Database Already Initialized
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Initialize Database
                </>
              )}
            </button>
          </div>

          {/* Environment Check */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-3">Environment Variables Check</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>NEXT_PUBLIC_SUPABASE_URL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  process.env.SUPABASE_SERVICE_ROLE_KEY ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>SUPABASE_SERVICE_ROLE_KEY</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Make sure all environment variables are set in your .env.local file
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
