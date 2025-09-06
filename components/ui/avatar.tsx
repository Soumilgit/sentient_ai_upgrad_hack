import React from 'react'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt?: string
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Avatar = ({ className = '', children, ...props }: AvatarProps) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`} {...props}>
      {children}
    </div>
  )
}

export const AvatarImage = ({ className = '', src, alt, ...props }: AvatarImageProps) => {
  if (!src) return null
  
  return (
    <img
      className={`aspect-square h-full w-full object-cover ${className}`}
      src={src}
      alt={alt}
      {...props}
    />
  )
}

export const AvatarFallback = ({ className = '', children, ...props }: AvatarFallbackProps) => {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 ${className}`} {...props}>
      {children}
    </div>
  )
}
