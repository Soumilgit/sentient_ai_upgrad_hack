import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary'
  children: React.ReactNode
}

export const Badge = ({ className = '', variant = 'default', children, ...props }: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 border border-blue-200',
    outline: 'border border-gray-300 text-gray-700 bg-white',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200'
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
