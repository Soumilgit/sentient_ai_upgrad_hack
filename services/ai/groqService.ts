import { GoogleGenerativeAI } from '@google/generative-ai'

export interface GroqResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class GroqService {
  private genAI: GoogleGenerativeAI
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found. Please add GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.')
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file.')
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async sendMessage(message: string, customSystemPrompt?: string): Promise<GroqResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 400,
        }
      })

      const prompt = customSystemPrompt || `You are Sentient, a helpful AI assistant in an educational community. Provide clear, supportive, and practical educational advice.`
      
      const fullPrompt = `${prompt}\n\nUser question: ${message}\n\nResponse:`

      console.log('🤖 Sending to Gemini:', message.substring(0, 50) + '...')
      
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      console.log('✅ Gemini response received:', text.substring(0, 100) + '...')

      return {
        content: text.trim(),
        usage: {
          promptTokens: fullPrompt.length,
          completionTokens: text.length,
          totalTokens: fullPrompt.length + text.length
        }
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error(`Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Singleton instance
let groqService: GroqService | null = null

export const getGroqService = (): GroqService => {
  if (!groqService) {
    groqService = new GroqService()
  }
  return groqService
}
