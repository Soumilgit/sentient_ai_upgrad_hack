import { useState, useEffect } from 'react'
import { mockUsers, MockUser } from '@/data/mockData'

export const useAuth = () => {
  const [user, setUser] = useState<MockUser | null>(null)

  useEffect(() => {
    // Simulate getting current user - using the teacher role for demo
    setUser(mockUsers[0]) // Sarah Chen - teacher
  }, [])

  return { user, setUser }
}
