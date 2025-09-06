'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DataDebugger() {
  const [users, setUsers] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('🔍 DataDebugger: Loading all data...')

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')

      if (usersError) {
        console.error('❌ Users error:', usersError)
      } else {
        console.log('✅ Users:', usersData)
        setUsers(usersData || [])
      }

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('learning_modules')
        .select('*')

      if (modulesError) {
        console.error('❌ Modules error:', modulesError)
      } else {
        console.log('✅ Modules:', modulesData)
        setModules(modulesData || [])
      }

      // Load progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')

      if (progressError) {
        console.error('❌ Progress error:', progressError)
      } else {
        console.log('✅ Progress:', progressData)
        setProgress(progressData || [])
      }

    } catch (error) {
      console.error('❌ DataDebugger error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-4 bg-yellow-100 rounded-lg">Loading debug data...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      <h3 className="text-lg font-bold">Data Debugger</h3>
      
      <div>
        <h4 className="font-semibold">Users ({users.length})</h4>
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">Modules ({modules.length})</h4>
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(modules, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">Progress ({progress.length})</h4>
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(progress, null, 2)}
        </pre>
      </div>
    </div>
  )
}
