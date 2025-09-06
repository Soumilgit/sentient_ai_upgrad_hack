import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface FlashcardRequest {
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  count: number
  subject?: string
}

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: string
  subject: string
  tags: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: FlashcardRequest = await request.json()
    const { topic, difficulty, count, subject = 'General' } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Validate count
    const flashcardCount = Math.min(Math.max(count || 5, 1), 20) // Limit between 1-20

    // Step 1: Generate flashcards using Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are an expert educational content creator. Generate ${flashcardCount} high-quality flashcards for the topic "${topic}" at ${difficulty} level.

REQUIREMENTS:
- Create flashcards that are clear, concise, and educational
- Front side should be a question, term, or concept
- Back side should be a detailed, accurate answer
- Difficulty: ${difficulty} level
- Subject: ${subject}
- Each flashcard should be unique and valuable for learning

FORMAT: Return ONLY a valid JSON array with this exact structure. Do NOT include markdown code blocks or any other formatting:

[
  {
    "front": "Question or term here",
    "back": "Detailed answer here",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

CRITICAL REQUIREMENTS: 
- Return ONLY the raw JSON array, no markdown, no code blocks, no extra text
- Start with [ and end with ]
- Ensure JSON is valid and properly formatted
- Make flashcards engaging and educational
- Include relevant tags for categorization
- Front should be concise (max 50 words)
- Back should be comprehensive but clear (max 100 words)
- NO markdown code block markers anywhere in the response

Topic: ${topic}
Difficulty: ${difficulty}
Subject: ${subject}
Number of flashcards: ${flashcardCount}`

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
      const flashcardsData = JSON.parse(cleanedResponse)
      
      // Validate that we got an array
      if (!Array.isArray(flashcardsData)) {
        throw new Error('Response is not an array')
      }
      
      // Validate and format the flashcards
      const flashcards: Flashcard[] = flashcardsData.map((card: any, index: number) => ({
        id: `flashcard-${Date.now()}-${index}`,
        front: card.front || 'No question provided',
        back: card.back || 'No answer provided',
        difficulty: difficulty,
        subject: subject,
        tags: Array.isArray(card.tags) ? card.tags : [topic.toLowerCase()]
      }))

      console.log('Generated flashcards:', flashcards.length)

      return NextResponse.json({
        success: true,
        flashcards,
        topic,
        difficulty,
        subject,
        count: flashcards.length
      })

    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Original AI Response:', aiResponse)
      
      // Try to extract JSON from the response using regex
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const extractedJson = jsonMatch[0]
          console.log('Extracted JSON:', extractedJson)
          
          const flashcardsData = JSON.parse(extractedJson)
          
          if (Array.isArray(flashcardsData)) {
            const flashcards: Flashcard[] = flashcardsData.map((card: any, index: number) => ({
              id: `flashcard-${Date.now()}-${index}`,
              front: card.front || 'No question provided',
              back: card.back || 'No answer provided',
              difficulty: difficulty,
              subject: subject,
              tags: Array.isArray(card.tags) ? card.tags : [topic.toLowerCase()]
            }))

            return NextResponse.json({
              success: true,
              flashcards,
              topic,
              difficulty,
              subject,
              count: flashcards.length
            })
          }
        }
      } catch (extractError) {
        console.error('JSON extraction error:', extractError)
      }
      
      // Fallback: Create a simple flashcard if JSON parsing fails
      const fallbackFlashcards: Flashcard[] = [{
        id: `flashcard-${Date.now()}-0`,
        front: `What is ${topic}?`,
        back: `This is a basic question about ${topic}. Please try generating flashcards again for more specific content.`,
        difficulty: difficulty,
        subject: subject,
        tags: [topic.toLowerCase()]
      }]

      return NextResponse.json({
        success: true,
        flashcards: fallbackFlashcards,
        topic,
        difficulty,
        subject,
        count: 1,
        warning: 'Generated fallback flashcard due to parsing error'
      })
    }

  } catch (error) {
    console.error('Flashcard generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate flashcards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
