import { NextRequest, NextResponse } from 'next/server'
import { analyzeEngagement } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { interactions, sessionDuration } = body

    if (!interactions || sessionDuration === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const analysis = await analyzeEngagement(interactions, sessionDuration)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing engagement:', error)
    return NextResponse.json(
      { error: 'Failed to analyze engagement' },
      { status: 500 }
    )
  }
}
