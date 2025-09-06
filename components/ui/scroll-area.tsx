import React from 'react'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ScrollArea = ({ className = '', children, ...props }: ScrollAreaProps) => {
  return (
    <div className={`overflow-auto ${className}`} {...props}>
      {children}
    </div>
  )
}
