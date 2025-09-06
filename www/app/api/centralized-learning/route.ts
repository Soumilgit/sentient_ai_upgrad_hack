import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface CentralizedLearningRequest {
  prompt: string
  learningType: 'flashcards' | 'gamification' | 'conversational' | 'all'
  difficulty?: 'easy' | 'medium' | 'hard'
  subject?: string
  studentLevel?: 'beginner' | 'intermediate' | 'advanced'
  mediaContent?: string
  mediaType?: 'text' | 'image' | 'video'
}

interface CentralizedResponse {
  success: boolean
  flashcards?: any
  gamification?: any
  conversational?: any
  unifiedContent?: any
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CentralizedLearningRequest = await request.json()
    const { 
      prompt, 
      learningType, 
      difficulty = 'medium', 
      subject = 'General',
      studentLevel = 'intermediate',
      mediaContent,
      mediaType = 'text'
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const response: CentralizedResponse = { success: true }

    // Generate content based on learning type
    if (learningType === 'flashcards' || learningType === 'all') {
      const flashcards = await generateFlashcards(model, prompt, difficulty, subject, mediaContent)
      response.flashcards = {
        success: true,
        flashcards: flashcards.map((card: any, index: number) => ({
          id: `flashcard-${Date.now()}-${index}`,
          front: card.front || 'No question provided',
          back: card.back || 'No answer provided',
          difficulty: difficulty,
          subject: subject,
          tags: Array.isArray(card.tags) ? card.tags : [prompt.toLowerCase()]
        })),
        topic: prompt,
        difficulty,
        subject,
        count: flashcards.length
      }
    }

    if (learningType === 'gamification' || learningType === 'all') {
      const gamification = await generateGamification(model, prompt, difficulty, subject, studentLevel, mediaContent)
      response.gamification = {
        success: true,
        assignment: {
          id: `assignment-${Date.now()}`,
          title: gamification.title || `${prompt} Challenge`,
          description: gamification.description || `Interactive assignment for ${prompt}`,
          questions: gamification.questions?.map((q: any, index: number) => ({
            id: q.id || `q${index + 1}`,
            question: q.question || 'Question not provided',
            type: q.type || 'multiple_choice',
            options: q.options || [],
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || 'Explanation not provided',
            points: q.points || 10,
            difficulty: q.difficulty || difficulty,
            hints: q.hints || [],
            interactiveElements: q.interactiveElements || []
          })) || [],
          rewards: gamification.rewards || {
            basePoints: 100,
            bonusPoints: 50,
            badges: ['Learner'],
            achievements: ['Completed'],
            streakMultiplier: 1.0
          },
          difficulty: gamification.difficulty || difficulty,
          estimatedTime: gamification.estimatedTime || 15,
          subject: gamification.subject || subject,
          learningObjectives: gamification.learningObjectives || [`Learn about ${prompt}`],
          gamificationElements: gamification.gamificationElements || {
            theme: 'Learning Adventure',
            character: 'Study Buddy',
            powerUps: ['Hint'],
            challenges: ['Complete'],
            socialFeatures: ['Progress']
          }
        },
        topic: prompt,
        difficulty,
        subject,
        questionCount: gamification.questions?.length || 0
      }
    }

    if (learningType === 'conversational' || learningType === 'all') {
      const conversational = await generateConversationalContent(model, prompt, difficulty, subject, mediaContent)
      response.conversational = {
        success: true,
        initialMessage: conversational,
        topic: prompt,
        difficulty,
        subject
      }
    }

    if (learningType === 'all') {
      response.unifiedContent = await generateUnifiedContent(model, prompt, difficulty, subject, studentLevel, mediaContent)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Centralized learning generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate learning content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function generateFlashcards(model: any, prompt: string, difficulty: string, subject: string, mediaContent?: string) {
  const flashcardPrompt = `Based on the user's prompt: "${prompt}", generate 5-8 high-quality flashcards for ${difficulty} level learning.

${mediaContent ? `Additional context from uploaded content: ${mediaContent.substring(0, 1000)}` : ''}

REQUIREMENTS:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Create flashcards that directly relate to the user's prompt
- Make questions engaging and educational
- Include clear, detailed answers
- Add relevant tags for categorization

FORMAT: Return ONLY a valid JSON array:
[
  {
    "front": "Question or term here",
    "back": "Detailed answer here",
    "tags": ["tag1", "tag2", "tag3"]
  }
]`

  const result = await model.generateContent(flashcardPrompt)
  const response = await result.response
  const aiResponse = response.text().trim()

  // Clean and parse JSON
  let cleanedResponse = cleanJsonResponse(aiResponse)
  return JSON.parse(cleanedResponse)
}

async function generateGamification(model: any, prompt: string, difficulty: string, subject: string, studentLevel: string, mediaContent?: string) {
  const gamificationPrompt = `Based on the user's prompt: "${prompt}", create a gamified assignment for ${difficulty} level learning.

${mediaContent ? `Additional context from uploaded content: ${mediaContent.substring(0, 1000)}` : ''}

REQUIREMENTS:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Student Level: ${studentLevel}
- Create 5-8 interactive questions
- NO fill-in-the-blank questions (use multiple choice, true/false, and interactive elements only)
- Make questions directly related to the user's prompt
- Include engaging gamification elements

QUESTION TYPES TO USE:
- Multiple Choice (60%)
- True/False (25%)
- Interactive Elements (15%) - drag-drop, matching, sequence

FORMAT: Return ONLY a valid JSON object:
{
  "title": "Assignment Title",
  "description": "Description",
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation",
      "points": 10,
      "difficulty": "${difficulty}",
      "hints": ["Hint 1", "Hint 2"],
      "interactiveElements": []
    }
  ],
  "rewards": {
    "basePoints": 100,
    "bonusPoints": 50,
    "badges": ["Learner", "Explorer"],
    "achievements": ["First Assignment"],
    "streakMultiplier": 1.0
  },
  "difficulty": "${difficulty}",
  "estimatedTime": 15,
  "subject": "${subject}",
  "learningObjectives": ["Objective 1", "Objective 2"],
  "gamificationElements": {
    "theme": "Learning Adventure",
    "character": "Study Buddy",
    "powerUps": ["Hint", "Time Freeze"],
    "challenges": ["Speed Round"],
    "socialFeatures": ["Progress Tracking"]
  }
}`

  const result = await model.generateContent(gamificationPrompt)
  const response = await result.response
  const aiResponse = response.text().trim()

  // Clean and parse JSON
  let cleanedResponse = cleanJsonResponse(aiResponse)
  return JSON.parse(cleanedResponse)
}

async function generateConversationalContent(model: any, prompt: string, difficulty: string, subject: string, mediaContent?: string) {
  const conversationalPrompt = `Based on the user's prompt: "${prompt}", provide a comprehensive conversational learning response.

${mediaContent ? `Additional context from uploaded content: ${mediaContent.substring(0, 1000)}` : ''}

REQUIREMENTS:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Provide detailed, educational explanations
- Include examples and practical applications
- Ask engaging follow-up questions
- Make it conversational and interactive
- Provide step-by-step guidance when appropriate

RESPONSE STYLE:
- Conversational but informative (100-150 words)
- Use specific examples related to the prompt
- Provide concrete next steps and actionable advice
- Be encouraging and supportive
- Ask ONE specific follow-up question
- Include relevant analogies or metaphors

Focus on the user's specific prompt and provide personalized learning guidance.`

  const result = await model.generateContent(conversationalPrompt)
  const response = await result.response
  return response.text().trim()
}

async function generateUnifiedContent(model: any, prompt: string, difficulty: string, subject: string, studentLevel: string, mediaContent?: string) {
  const unifiedPrompt = `Based on the user's prompt: "${prompt}", create a comprehensive learning experience that combines flashcards, gamification, and conversational learning.

${mediaContent ? `Additional context from uploaded content: ${mediaContent.substring(0, 1000)}` : ''}

REQUIREMENTS:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Student Level: ${studentLevel}
- Create a cohesive learning journey
- Ensure all components work together
- Provide clear learning progression

FORMAT: Return ONLY a valid JSON object:
{
  "learningPath": {
    "title": "Learning Path Title",
    "description": "Comprehensive description",
    "estimatedDuration": "30 minutes",
    "difficulty": "${difficulty}",
    "subject": "${subject}",
    "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"]
  },
  "flashcards": [
    {
      "front": "Question",
      "back": "Answer",
      "tags": ["tag1", "tag2"]
    }
  ],
  "gamification": {
    "title": "Assignment Title",
    "questions": [
      {
        "id": "q1",
        "question": "Question",
        "type": "multiple_choice",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Explanation",
        "points": 10,
        "difficulty": "${difficulty}",
        "hints": ["Hint 1"]
      }
    ],
    "rewards": {
      "basePoints": 100,
      "badges": ["Learner"],
      "achievements": ["Completed"]
    }
  },
  "conversational": {
    "initialResponse": "Initial conversational response",
    "followUpQuestions": ["Question 1", "Question 2"],
    "learningTips": ["Tip 1", "Tip 2"]
  }
}`

  const result = await model.generateContent(unifiedPrompt)
  const response = await result.response
  const aiResponse = response.text().trim()

  // Clean and parse JSON
  let cleanedResponse = cleanJsonResponse(aiResponse)
  return JSON.parse(cleanedResponse)
}

function cleanJsonResponse(response: string): string {
  let cleaned = response.trim()
  
  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '')
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '')
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '')
  }
  
  // Remove any remaining markdown
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '')
  
  return cleaned
}
