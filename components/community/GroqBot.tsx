import React, { useState, useCallback } from 'react'
import { getGroqService, GroqResponse } from '@/services/ai/groqService'
import { Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface GroqBotProps {
  onSendMessage: (message: { id: string; content: string; author: any; timestamp: Date; channel: string }) => void
  user: any
  selectedChannel: string
}

export const GroqBot: React.FC<GroqBotProps> = () => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
          <Bot className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      <span>Sentient Assistant</span>
    </div>
  )
}

// Hook to use Groq bot functionality
export const useGroqBot = (onSendMessage: any, selectedChannel: string) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processMessage = useCallback(async (message: string) => {
    // Check if message contains @sentient tag
    const sentientTagRegex = /@sentient\b/i
    if (!sentientTagRegex.test(message)) {
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      const groqService = getGroqService()
      
      // Remove @sentient tag and clean the message
      const cleanMessage = message.replace(sentientTagRegex, '').trim()
      
      if (!cleanMessage) {
        throw new Error('Please provide a question after @sentient')
      }

      // Create a community-specific prompt
      const communityPrompt = `You are Sentient, a helpful AI assistant in an educational community chat. You're here to help students, teachers, and administrators with their questions and doubts. Be friendly, encouraging, and provide clear, helpful answers.

Guidelines:
- Be supportive and encouraging in your responses
- Provide clear, step-by-step explanations when needed
- If you're not sure about something, say so and suggest where they might find more information
- Keep responses concise but comprehensive (80-120 words)
- Use a friendly, conversational tone
- If the question is about specific school policies or procedures, suggest they contact their school administration
- Encourage learning and curiosity
- Give specific, actionable advice with examples
- Reference educational best practices when relevant

Question: ${cleanMessage}`

      console.log('🚀 Calling Gemini via GroqService for:', cleanMessage.substring(0, 50) + '...')

      const response: GroqResponse = await groqService.sendMessage(cleanMessage, communityPrompt)

      console.log('✅ Received response:', response.content.substring(0, 100) + '...')

      // Create bot user object
      const botUser = {
        id: 'sentient-bot',
        name: 'Sentient Assistant',
        role: 'ai_assistant',
        avatar: null,
      }

      // Send the bot's response
      const botMessage = {
        id: `sentient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: response.content,
        author: botUser,
        timestamp: new Date(),
        channel: selectedChannel,
      }

      onSendMessage(botMessage)
      return response

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from Sentient AI'
      setError(errorMessage)
      console.error('Sentient Bot Error:', err)
      
      // Send error message as bot response
      const botUser = {
        id: 'sentient-bot',
        name: 'Sentient Assistant',
        role: 'ai_assistant',
        avatar: null,
      }

      const errorBotMessage = {
        id: `sentient_error_${Date.now()}`,
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again or contact support if the issue persists.`,
        author: botUser,
        timestamp: new Date(),
        channel: selectedChannel,
      }

      onSendMessage(errorBotMessage)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [onSendMessage, selectedChannel])

  return { processMessage, isProcessing, error }
}