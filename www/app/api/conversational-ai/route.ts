import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface ConversationRequest {
  userMessage: string
  voiceId?: string
  conversationHistory?: Array<{role: string, content: string}>
  courseTitle?: string
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic'
}

export async function POST(request: NextRequest) {
  try {
    const body: ConversationRequest = await request.json()
    const { 
      userMessage, 
      voiceId = '21m00Tcm4TlvDq8ikWAM', // Default voice
      conversationHistory = [],
      courseTitle,
      userLevel,
      learningStyle
    } = body

    if (!userMessage) {
      return NextResponse.json({ error: 'User message is required' }, { status: 400 })
    }

    // Step 1: Generate AI response using Gemini with context engineering
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create context-aware prompt
    const courseContext = courseTitle ? `Course: ${courseTitle}` : 'General Learning'
    const levelContext = userLevel ? `User Level: ${userLevel}` : 'Mixed Level'
    const styleContext = learningStyle ? `Learning Style: ${learningStyle}` : 'Mixed Learning Style'
    
    const historyContext = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
      .join('\n')

    const prompt = `You are an expert AI tutor with deep knowledge in ${courseContext}. ${levelContext}. ${styleContext}.

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text().trim()

    // Step 2: Convert AI response to speech using ElevenLabs
    let audioData = null
    try {
      const ttsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: aiResponse,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVEN_LABS_API_KEY || process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY,
          },
          responseType: 'arraybuffer'
        }
      )

      audioData = Buffer.from(ttsResponse.data).toString('base64')
    } catch (ttsError) {
      console.error('ElevenLabs TTS Error:', ttsError)
      // Continue without audio if TTS fails
    }

    // Return conversation data
    return NextResponse.json({
      userMessage,
      aiResponse,
      audioData,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ],
      metadata: {
        courseTitle,
        userLevel,
        learningStyle,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Conversational AI Error:', error)
    return NextResponse.json({ 
      error: 'Conversation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
