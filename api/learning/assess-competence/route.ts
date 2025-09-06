import { NextRequest, NextResponse } from 'next/server'
import { assessCompetence } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers, content } = body

    if (!answers || !content) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const assessment = await assessCompetence(answers, content)

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Error assessing competence:', error)
    return NextResponse.json(
      { error: 'Failed to assess competence' },
      { status: 500 }
    )
  }
}
