import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleGenAI } from '@google/genai'

export async function GET(request: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        env_check: 'GEMINI_API_KEY is missing'
      }, { status: 500 })
    }

    // Test standard Gemini AI
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const result = await model.generateContent("Test prompt: What is 2+2?")
      const response = await result.response
      const text = response.text()
      
      console.log('Standard Gemini test successful:', text)
    } catch (error) {
      console.error('Standard Gemini test failed:', error.message)
    }

    // Test Google GenAI for video
    try {
      const ai = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY })
      console.log('Google GenAI initialized successfully')
      
      // Test if we can access models
      const models = await ai.models.list()
      console.log('Available models:', models)
      
    } catch (error) {
      console.error('Google GenAI test failed:', error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Google GenAI setup test completed',
      api_key_configured: !!GEMINI_API_KEY,
      api_key_length: GEMINI_API_KEY.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType = 'basic' } = await request.json()
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured'
      }, { status: 500 })
    }

    if (testType === 'video') {
      // Test video generation
      const ai = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY })
      
      const config = {
        model: 'veo-2.0-generate-001',
        prompt: 'A simple educational animation showing a ball bouncing',
        config: {
          aspectRatio: '16:9',
          durationSeconds: 3,
          fps: 24,
          generateAudio: false,
          resolution: "720p",
          numberOfVideos: 1,
        },
      }

      console.log('Testing video generation with config:', config)
      
      const operation = await ai.models.generateVideos(config)
      
      return NextResponse.json({
        success: true,
        message: 'Video generation test initiated',
        operationId: operation.name,
        operationStatus: operation.done ? 'completed' : 'in_progress'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Basic test completed'
    })

  } catch (error) {
    console.error('POST test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message
    }, { status: 500 })
  }
}
