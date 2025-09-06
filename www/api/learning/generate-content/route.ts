import { NextRequest, NextResponse } from 'next/server'
import { generateLearningContent } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, difficultyLevel, learningStyle, currentCompetence } = body

    if (!topic || !difficultyLevel || !learningStyle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const content = await generateLearningContent({
      topic,
      difficultyLevel,
      learningStyle,
      currentCompetence: currentCompetence || 0
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error generating learning content:', error)
    return NextResponse.json(
      { error: 'Failed to generate learning content' },
      { status: 500 }
    )
  }
}
