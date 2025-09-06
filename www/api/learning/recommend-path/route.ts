import { NextRequest, NextResponse } from 'next/server'
import { recommendLearningPath } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userProfile, availableModules } = body

    if (!userProfile || !availableModules) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const recommendation = await recommendLearningPath(userProfile, availableModules)

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error('Error recommending learning path:', error)
    return NextResponse.json(
      { error: 'Failed to recommend learning path' },
      { status: 500 }
    )
  }
}
