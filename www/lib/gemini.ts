import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ConversationContext {
  courseTitle?: string
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic'
  previousTopics?: string[]
  currentModule?: string
}

export interface GeminiResponse {
  text: string
  confidence: number
  suggestedActions?: string[]
  relatedTopics?: string[]
}

// Context-aware prompt engineering to avoid vague responses
export function createContextualPrompt(
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}>,
  context: ConversationContext = {}
): string {
  const courseContext = context.courseTitle ? `Course: ${context.courseTitle}` : 'General Learning'
  const levelContext = context.userLevel ? `User Level: ${context.userLevel}` : 'Mixed Level'
  const styleContext = context.learningStyle ? `Learning Style: ${context.learningStyle}` : 'Mixed Learning Style'
  
  // Build conversation context
  const historyContext = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
    .join('\n')

  return `You are an expert AI tutor with deep knowledge in ${courseContext}. ${levelContext}. ${styleContext}.

CRITICAL INSTRUCTIONS:
1. NEVER give vague responses like "this is complex" or "requires understanding of multiple concepts"
2. ALWAYS provide specific, actionable information
3. Give concrete examples and step-by-step explanations
4. If you don't know something specific, say "I need to research that specific detail" rather than being vague
5. Keep responses conversational but informative (40-60 words max)
6. Use analogies and real-world examples when helpful
7. Ask ONE specific follow-up question if clarification is needed

Previous conversation:
${historyContext}

Current student question: ${userMessage}

Provide a direct, helpful response:`
}

export async function generateContextualResponse(
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}>,
  context: ConversationContext = {}
): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const prompt = createContextualPrompt(userMessage, conversationHistory, context)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract confidence and suggestions from response
    const confidence = Math.min(0.9, Math.max(0.6, text.length / 100)) // Simple confidence based on response length
    
    return {
      text: text.trim(),
      confidence,
      suggestedActions: extractSuggestedActions(text),
      relatedTopics: extractRelatedTopics(text)
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return {
      text: "I apologize, but I'm having trouble processing your request right now. Could you please rephrase your question?",
      confidence: 0.1,
      suggestedActions: ['Try rephrasing your question', 'Ask about a specific topic'],
      relatedTopics: []
    }
  }
}

function extractSuggestedActions(text: string): string[] {
  const actions: string[] = []
  
  if (text.toLowerCase().includes('try') || text.toLowerCase().includes('practice')) {
    actions.push('Practice this concept')
  }
  if (text.toLowerCase().includes('example') || text.toLowerCase().includes('for instance')) {
    actions.push('See more examples')
  }
  if (text.toLowerCase().includes('step') || text.toLowerCase().includes('process')) {
    actions.push('Follow step-by-step guide')
  }
  
  return actions.slice(0, 3) // Max 3 suggestions
}

function extractRelatedTopics(text: string): string[] {
  const topics: string[] = []
  const commonTopics = ['variables', 'functions', 'loops', 'arrays', 'objects', 'classes', 'methods', 'algorithms', 'data structures']
  
  commonTopics.forEach(topic => {
    if (text.toLowerCase().includes(topic)) {
      topics.push(topic)
    }
  })
  
  return topics.slice(0, 3) // Max 3 related topics
}