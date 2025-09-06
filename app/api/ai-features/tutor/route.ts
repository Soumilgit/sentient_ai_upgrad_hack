import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { prompt, subject, difficulty, includeAudio = true } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Generate AI Tutor content using Gemini
    const tutorPrompt = `
Create a comprehensive AI tutor response for the following learning request:

Topic: ${prompt}
Subject: ${subject}
Difficulty: ${difficulty}

Please generate:
1. A personalized greeting and introduction
2. Learning objectives for this session
3. Step-by-step explanation of the topic
4. Examples and analogies
5. Practice problems with solutions
6. Common misconceptions to address
7. Next steps for continued learning
8. Encouragement and motivation

Format the response as JSON with this structure:
{
  "greeting": "Personalized greeting",
  "learningObjectives": ["Objective 1", "Objective 2"],
  "explanation": {
    "introduction": "Topic introduction",
    "mainContent": "Detailed explanation",
    "examples": ["Example 1", "Example 2"],
    "analogies": ["Analogy 1", "Analogy 2"]
  },
  "practiceProblems": [
    {
      "problem": "Practice problem text",
      "solution": "Step-by-step solution",
      "hints": ["Hint 1", "Hint 2"]
    }
  ],
  "misconceptions": [
    {
      "misconception": "Common wrong idea",
      "correction": "Correct explanation"
    }
  ],
  "nextSteps": ["Step 1", "Step 2"],
  "encouragement": "Motivational message",
  "estimatedSessionTime": "30 minutes"
}
`

    const result = await model.generateContent(tutorPrompt)
    const response = await result.response
    const text = response.text()

    let tutorData
    try {
      tutorData = JSON.parse(text)
    } catch (error) {
      // Fallback if JSON parsing fails
      tutorData = {
        greeting: `Hello! I'm your AI tutor, and I'm excited to help you learn about ${prompt}!`,
        learningObjectives: [`Understand ${prompt}`],
        explanation: {
          introduction: `Let's explore ${prompt} together!`,
          mainContent: text,
          examples: [],
          analogies: []
        },
        practiceProblems: [],
        misconceptions: [],
        nextSteps: [`Continue practicing ${prompt}`],
        encouragement: "You're doing great! Keep learning!",
        estimatedSessionTime: "30 minutes"
      }
    }

    // Generate audio using ElevenLabs if requested
    let audioData = null
    if (includeAudio && process.env.ELEVEN_LABS_API_KEY) {
      try {
        // Create a comprehensive text for audio generation
        const audioText = `
${tutorData.greeting}

Today we're going to learn about ${prompt}. Here are our learning objectives:
${tutorData.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Let me explain this topic step by step:
${tutorData.explanation.introduction}

${tutorData.explanation.mainContent}

Here are some examples to help you understand:
${tutorData.explanation.examples.map((ex, i) => `Example ${i + 1}: ${ex}`).join('\n')}

Now let's practice with some problems:
${tutorData.practiceProblems.map((prob, i) => `Problem ${i + 1}: ${prob.problem}`).join('\n')}

${tutorData.encouragement}
        `.trim()

        const audioResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVEN_LABS_API_KEY
          },
          body: JSON.stringify({
            text: audioText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        })

        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer()
          const base64Audio = Buffer.from(audioBuffer).toString('base64')
          audioData = {
            base64: base64Audio,
            duration: Math.ceil(audioText.length / 15), // Rough estimate
            voice: '21m00Tcm4TlvDq8ikWAM'
          }
        }
      } catch (error) {
        console.error('Error generating audio:', error)
      }
    }

    return NextResponse.json({
      success: true,
      title: `${prompt} Learning Session`,
      description: `Personalized tutoring session for ${prompt}`,
      greeting: tutorData.greeting,
      learningObjectives: tutorData.learningObjectives,
      explanation: tutorData.explanation,
      practiceProblems: tutorData.practiceProblems,
      misconceptions: tutorData.misconceptions,
      nextSteps: tutorData.nextSteps,
      encouragement: tutorData.encouragement,
      estimatedSessionTime: tutorData.estimatedSessionTime,
      audio: audioData,
      metadata: {
        generated_at: new Date().toISOString(),
        subject: subject,
        difficulty: difficulty,
        hasAudio: !!audioData
      }
    })
  } catch (error) {
    console.error('AI Tutor error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
