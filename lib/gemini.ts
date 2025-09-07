import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini - handle both server and client environments
const getGeminiAPI = () => {
  // Try different environment variable names
  const apiKey = process.env.GEMINI_API_KEY || 
                 process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                 process.env.GOOGLE_API_KEY ||
                 process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found. Please add GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.')
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env.local file.')
  }
  
  console.log('🔑 Initializing Gemini with API key:', apiKey.substring(0, 10) + '...')
  return new GoogleGenerativeAI(apiKey)
}

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

  const basePrompt = `You are Sentient, an expert AI educational assistant in a community forum for educators and learners.

CONTEXT: ${courseContext} | ${levelContext} | ${styleContext}

YOUR ROLE:
- Expert educational consultant in a collaborative community forum
- Help teachers, students, and administrators with practical educational challenges
- Provide specific, actionable advice based on educational best practices
- Be supportive, encouraging, and professional

RESPONSE REQUIREMENTS:
1. ALWAYS provide specific, concrete advice with examples
2. Reference educational research, theories, or proven strategies when relevant
3. Suggest practical tools, techniques, or resources
4. Keep responses conversational but informative (80-120 words)
5. Include actionable next steps or follow-up questions
6. Adapt your language to the user's role (teacher vs student vs admin)

CONVERSATION HISTORY:
${historyContext}

CURRENT QUESTION: ${userMessage}

Please provide a helpful, specific response as an educational expert:`

  return basePrompt
}

export async function generateContextualResponse(
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}>,
  context: ConversationContext = {}
): Promise<GeminiResponse> {
  try {
    console.log('🤖 Generating response for:', userMessage.substring(0, 50) + '...')
    
    const genAI = getGeminiAPI()
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 300,
      }
    })
    
    const prompt = createContextualPrompt(userMessage, conversationHistory, context)
    console.log('📝 Sending prompt to Gemini:', prompt.substring(0, 100) + '...')
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini response received:', text.substring(0, 100) + '...')
    
    // Extract confidence and suggestions from response
    const confidence = Math.min(0.9, Math.max(0.6, text.length / 100))
    
    return {
      text: text.trim(),
      confidence,
      suggestedActions: extractSuggestedActions(text),
      relatedTopics: extractRelatedTopics(text)
    }
  } catch (error) {
    console.error('❌ Gemini API Error:', error)
    
    // More specific error handling
    let errorMessage = "I'm having trouble connecting to my AI services right now."
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = "My API key seems to be missing or invalid. Please check the GEMINI_API_KEY configuration."
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = "I've reached my usage limit for now. Please try again later."
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "I'm having network connectivity issues. Please check your internet connection and try again."
      }
    }
    
    return {
      text: errorMessage + " In the meantime, feel free to ask other community members for help!",
      confidence: 0.1,
      suggestedActions: ['Check API configuration', 'Try again later', 'Ask community members'],
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

// Engagement analysis function
export async function analyzeEngagement(interactions: any[], sessionDuration: number) {
  try {
    const genAI = getGeminiAPI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `Analyze the following learning engagement data and provide insights:

Interactions: ${JSON.stringify(interactions)}
Session Duration: ${sessionDuration} minutes

Please analyze:
1. Overall engagement level (1-10)
2. Learning patterns identified
3. Recommendations for improvement
4. Areas of strength

Provide a JSON response with: { engagementScore, patterns, recommendations, strengths }`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    try {
      return JSON.parse(text)
    } catch {
      return {
        engagementScore: 7,
        patterns: ['Regular interaction patterns'],
        recommendations: ['Continue current learning approach'],
        strengths: ['Consistent engagement']
      }
    }
  } catch (error) {
    console.error('Engagement analysis error:', error)
    return {
      engagementScore: 5,
      patterns: ['Unable to analyze patterns'],
      recommendations: ['Try again later'],
      strengths: ['Data collection in progress']
    }
  }
}

// Learning path recommendation function
export async function recommendLearningPath(userProfile: any, availableModules: any[]) {
  try {
    const genAI = getGeminiAPI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `Based on the user profile and available learning modules, recommend a personalized learning path:

User Profile: ${JSON.stringify(userProfile)}
Available Modules: ${JSON.stringify(availableModules)}

Please analyze:
1. User's competence level and learning style
2. Appropriate difficulty progression
3. Recommended module sequence
4. Estimated timeline

Provide a JSON response with: { recommendedModules, learningPath, timeline, reasoning }`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    try {
      return JSON.parse(text)
    } catch {
      return {
        recommendedModules: availableModules.slice(0, 3),
        learningPath: ['Start with basics', 'Progress to intermediate', 'Advance to expert'],
        timeline: '4-6 weeks',
        reasoning: 'Recommended path based on user profile'
      }
    }
  } catch (error) {
    console.error('Learning path recommendation error:', error)
    return {
      recommendedModules: [],
      learningPath: ['Unable to generate recommendation'],
      timeline: 'Unknown',
      reasoning: 'Error in analysis'
    }
  }
}

// Personalized content generation function
export async function generatePersonalizedContent(userProfile: any, topic: string, difficulty: number) {
  try {
    const genAI = getGeminiAPI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `Generate personalized learning content for:

User Profile: ${JSON.stringify(userProfile)}
Topic: ${topic}
Difficulty Level: ${difficulty}/5

Please create:
1. Customized content explanation
2. Relevant examples for the user's background
3. Practice exercises
4. Learning objectives

Provide a JSON response with: { content, examples, exercises, objectives }`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    try {
      return JSON.parse(text)
    } catch {
      return {
        content: `Personalized content for ${topic} at difficulty level ${difficulty}`,
        examples: [`Example 1 for ${topic}`, `Example 2 for ${topic}`],
        exercises: [`Practice exercise 1`, `Practice exercise 2`],
        objectives: [`Understand ${topic}`, `Apply ${topic} concepts`]
      }
    }
  } catch (error) {
    console.error('Personalized content generation error:', error)
    return {
      content: `Content for ${topic}`,
      examples: ['Example content'],
      exercises: ['Practice exercises'],
      objectives: ['Learning objectives']
    }
  }
}