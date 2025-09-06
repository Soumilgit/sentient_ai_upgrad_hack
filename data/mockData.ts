export interface MockUser {
  id: string
  name: string
  role: 'supreme_admin' | 'school_admin' | 'teacher' | 'student' | 'ai_assistant'
  avatar?: string
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    role: 'teacher', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Emily Johnson',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Alex Thompson',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'Dr. Lisa Park',
    role: 'school_admin',
    avatar: 'https://images.unsplash.com/photo-1559209172-e8d2d0c5e3b7?w=150&h=150&fit=crop&crop=face'
  }
]
