import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface GeneralChatRequest {
  userMessage: string
  mediaFiles?: Array<{
    name: string
    type: string
    size: number
    textContent?: string | null
    imageData?: string | null
    videoData?: string | null
  }>
  conversationHistory?: Array<{role: string, content: string}>
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneralChatRequest = await request.json()
    const { 
      userMessage, 
      mediaFiles = [],
      conversationHistory = []
    } = body

    if (!userMessage) {
      return NextResponse.json({ error: 'User message is required' }, { status: 400 })
    }

    // Step 1: Generate therapeutic AI response using Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create comprehensive context with multimodal file analysis
    const mediaContext = mediaFiles.length > 0 
      ? `\n\n📎 ATTACHED FILES ANALYSIS:
${mediaFiles.map(file => {
  if (file.textContent && file.textContent.trim()) {
    return `📄 ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB):
Text Content: ${file.textContent.substring(0, 2000)}${file.textContent.length > 2000 ? '...' : ''}

IMPORTANT: Analyze this text content thoroughly and provide specific insights.`
  } else if (file.imageData) {
    return `🖼️ ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB):
Image Data: ${file.imageData.substring(0, 100)}... (base64 encoded)

IMPORTANT: Analyze this image visually and provide detailed insights about what you see.`
  } else if (file.videoData) {
    return `🎥 ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB):
Video Data: ${file.videoData.substring(0, 100)}... (base64 encoded)

IMPORTANT: Analyze this video content and provide insights about what you observe.`
  } else {
    return `📄 ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB): Content not available for analysis.`
  }
}).join('\n\n')}`
      : ''

    const historyContext = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.content}`)
      .join('\n')

    const prompt = `You are an advanced AI learning assistant powered by Gemini 1.5 Flash. Your role is to provide comprehensive, empathetic, and highly informative responses for learning and personal growth.

🎯 CORE MISSION:
- Analyze uploaded content thoroughly (text, images, videos) and provide specific insights
- Give concrete, actionable advice based on actual content
- Be warm, encouraging, and understanding
- Provide step-by-step explanations when needed
- NEVER give vague responses like "this is complex" or "requires understanding of multiple concepts"

📚 MULTIMODAL ANALYSIS REQUIREMENTS:
- For PDFs/documents: Analyze text content and provide specific insights
- For images: Describe what you see, identify key elements, and provide educational insights
- For videos: Analyze visual content, identify key scenes, and provide learning insights
- Provide specific examples and references from the uploaded material
- Create summaries, key points, and practical applications
- Suggest specific next steps based on the content

💬 RESPONSE STYLE:
- Conversational but informative (60-80 words max)
- Use specific examples from uploaded content
- Provide concrete next steps and actionable advice
- Be encouraging and supportive
- Ask ONE specific follow-up question if clarification is needed

Previous conversation:
${historyContext}

Current message: ${userMessage}${mediaContext}

Analyze all content thoroughly and provide specific, actionable guidance:`

    // Prepare multimodal content for Gemini
    const contentParts = [
      { text: prompt }
    ]

    // Add image and video data to the content
    mediaFiles.forEach(file => {
      if (file.imageData) {
        contentParts.push({
          text: `[Image: ${file.type}]` // Fallback for image data
        })
      } else if (file.videoData) {
        contentParts.push({
          text: `[Video: ${file.type}]` // Fallback for video data
        })
      }
    })

    const result = await model.generateContent(contentParts)
    const response = await result.response
    const aiResponse = response.text().trim()

    // Step 2: Convert to therapeutic voice using ElevenLabs
    let audioData = null
    try {
      const ttsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, // Therapeutic voice
        {
          text: aiResponse,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3,
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

    // Return therapeutic response
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
        isTherapeutic: true,
        timestamp: new Date().toISOString(),
        mediaFiles: mediaFiles.length
      }
    })

  } catch (error) {
    console.error('General Chat Error:', error)
    return NextResponse.json({ 
      error: 'Chat failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
