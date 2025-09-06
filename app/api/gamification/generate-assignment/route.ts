import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface GamificationRequest {
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  mediaType?: 'text' | 'image' | 'video'
  mediaContent?: string
  studentLevel?: 'beginner' | 'intermediate' | 'advanced'
}

interface GamifiedAssignment {
  id: string
  title: string
  description: string
  questions: GamifiedQuestion[]
  rewards: AssignmentRewards
  difficulty: string
  estimatedTime: number
  subject: string
  learningObjectives: string[]
  gamificationElements: GamificationElements
}

interface GamifiedQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'interactive'
  options?: string[]
  correctAnswer: string | number
  explanation: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  hints: string[]
  mediaUrl?: string
  interactiveElements?: InteractiveElement[]
}

interface AssignmentRewards {
  basePoints: number
  bonusPoints: number
  badges: string[]
  achievements: string[]
  streakMultiplier: number
}

interface GamificationElements {
  theme: string
  character: string
  powerUps: string[]
  challenges: string[]
  socialFeatures: string[]
}

interface InteractiveElement {
  type: 'drag_drop' | 'matching' | 'sequence' | 'simulation'
  data: any
  points: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GamificationRequest = await request.json()
    const { 
      topic, 
      difficulty, 
      subject, 
      mediaType = 'text', 
      mediaContent, 
      studentLevel = 'intermediate' 
    } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Generate gamified assignment using Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are an expert educational game designer creating interactive, gamified assignments. Generate a comprehensive gamified assignment for the topic "${topic}" at ${difficulty} level.

ASSIGNMENT REQUIREMENTS:
- Topic: ${topic}
- Difficulty: ${difficulty}
- Subject: ${subject}
- Student Level: ${studentLevel}
- Media Type: ${mediaType}
${mediaContent ? `- Media Content: ${mediaContent.substring(0, 500)}...` : ''}

GAMIFICATION ELEMENTS TO INCLUDE:
1. Interactive Questions (5-8 questions)
2. Point System with Bonuses
3. Achievement Badges
4. Character/Theme Integration
5. Power-ups and Challenges
6. Social Learning Features
7. Progress Tracking
8. Adaptive Difficulty

QUESTION TYPES TO MIX:
- Multiple Choice (40%)
- True/False (20%)
- Fill in the Blank (20%)
- Subjective Questions (20%)

FORMAT: Return ONLY a valid JSON object with this exact structure:

{
  "title": "Engaging Assignment Title",
  "description": "Detailed description of the assignment",
  "questions": [
    {
      "id": "q1",
      "question": "Interactive question text",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of the answer",
      "points": 10,
      "difficulty": "easy",
      "hints": ["Hint 1", "Hint 2"],
      "interactiveElements": [
        {
          "type": "drag_drop",
          "data": {"items": ["item1", "item2"], "targets": ["target1", "target2"]},
          "points": 5
        }
      ]
    }
  ],
  "rewards": {
    "basePoints": 100,
    "bonusPoints": 50,
    "badges": ["First Try", "Speed Demon", "Perfectionist"],
    "achievements": ["Master of ${topic}", "Quick Learner"],
    "streakMultiplier": 1.5
  },
  "difficulty": "${difficulty}",
  "estimatedTime": 15,
  "subject": "${subject}",
  "learningObjectives": [
    "Objective 1",
    "Objective 2",
    "Objective 3"
  ],
  "gamificationElements": {
    "theme": "Space Explorer",
    "character": "Captain Knowledge",
    "powerUps": ["Time Freeze", "Hint Reveal", "Double Points"],
    "challenges": ["Speed Round", "Perfect Score", "No Hints"],
    "socialFeatures": ["Leaderboard", "Team Challenges", "Share Progress"]
  }
}

CRITICAL REQUIREMENTS:
- Make questions engaging and educational
- Include interactive elements for hands-on learning
- Create meaningful rewards and achievements
- Ensure questions are appropriate for ${difficulty} level
- Include clear learning objectives
- Make the assignment fun and motivating
- Questions should test understanding, not just memorization
- Include diverse question types for different learning styles
- Add hints and explanations for learning support
- Create a cohesive theme throughout the assignment

Topic: ${topic}
Difficulty: ${difficulty}
Subject: ${subject}
Student Level: ${studentLevel}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text().trim()

    try {
      // Clean the AI response by removing markdown code blocks
      let cleanedResponse = aiResponse.trim()
      
      // Remove markdown code block markers
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '')
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '')
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/\s*```$/, '')
      }
      
      // Remove any remaining markdown formatting
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      console.log('Cleaned AI Response:', cleanedResponse)
      
      // Parse the cleaned JSON response
      const assignmentData = JSON.parse(cleanedResponse)
      
      // Add unique IDs and validate structure
      const gamifiedAssignment: GamifiedAssignment = {
        id: `assignment-${Date.now()}`,
        title: assignmentData.title || `${topic} Challenge`,
        description: assignmentData.description || `Interactive assignment for ${topic}`,
        questions: assignmentData.questions?.map((q: any, index: number) => ({
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
        rewards: assignmentData.rewards || {
          basePoints: 100,
          bonusPoints: 50,
          badges: ['Learner'],
          achievements: ['Completed'],
          streakMultiplier: 1.0
        },
        difficulty: assignmentData.difficulty || difficulty,
        estimatedTime: assignmentData.estimatedTime || 15,
        subject: assignmentData.subject || subject,
        learningObjectives: assignmentData.learningObjectives || [`Learn about ${topic}`],
        gamificationElements: assignmentData.gamificationElements || {
          theme: 'Learning Adventure',
          character: 'Study Buddy',
          powerUps: ['Hint'],
          challenges: ['Complete'],
          socialFeatures: ['Progress']
        }
      }

      console.log('Generated gamified assignment:', gamifiedAssignment.title)

      return NextResponse.json({
        success: true,
        assignment: gamifiedAssignment,
        topic,
        difficulty,
        subject,
        questionCount: gamifiedAssignment.questions.length
      })

    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Original AI Response:', aiResponse)
      
      // Fallback: Create a simple assignment if JSON parsing fails
      const fallbackAssignment: GamifiedAssignment = {
        id: `assignment-${Date.now()}`,
        title: `${topic} Learning Challenge`,
        description: `Interactive assignment to test your knowledge of ${topic}`,
        questions: [{
          id: 'q1',
          question: `What is the main concept of ${topic}?`,
          type: 'multiple_choice',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: `This question tests your understanding of ${topic}`,
          points: 10,
          difficulty: difficulty,
          hints: [`Think about the key concepts of ${topic}`],
          interactiveElements: []
        }],
        rewards: {
          basePoints: 50,
          bonusPoints: 25,
          badges: ['Learner'],
          achievements: ['First Assignment'],
          streakMultiplier: 1.0
        },
        difficulty,
        estimatedTime: 10,
        subject,
        learningObjectives: [`Understand ${topic}`],
        gamificationElements: {
          theme: 'Learning Quest',
          character: 'Study Guide',
          powerUps: ['Hint'],
          challenges: ['Complete Assignment'],
          socialFeatures: ['Progress Tracking']
        }
      }

      return NextResponse.json({
        success: true,
        assignment: fallbackAssignment,
        topic,
        difficulty,
        subject,
        questionCount: 1,
        warning: 'Generated fallback assignment due to parsing error'
      })
    }

  } catch (error) {
    console.error('Gamification assignment generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate gamified assignment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
