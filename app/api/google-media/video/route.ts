import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, GenerateVideosParameters } from '@google/genai'

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration = 5, quality = 'high', imageBytes = null } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Enhanced prompt for educational video content
    const enhancedPrompt = `Educational video: ${prompt}. Clear, professional, suitable for learning materials. Smooth transitions, good lighting, educational focus. High-quality educational content.`

    const ai = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY })

    const config: GenerateVideosParameters = {
      model: 'veo-2.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        aspectRatio: '16:9',
        durationSeconds: Math.min(duration, 10), // Limit to 10 seconds for demo
        fps: 24,
        generateAudio: false, // We'll use ElevenLabs for audio
        resolution: "720p",
        numberOfVideos: 1,
      },
    }

    if (imageBytes) {
      config.image = {
        imageBytes,
        mimeType: 'image/png',
      }
    }

    let operation = await ai.models.generateVideos(config)

    // Poll for completion (with timeout)
    let attempts = 0
    const maxAttempts = 60 // 1 minute timeout

    while (!operation.done && attempts < maxAttempts) {
      console.log('Waiting for video generation completion...')
      await delay(1000)
      operation = await ai.operations.getVideosOperation({ operation })
      attempts++
    }

    if (!operation.done) {
      return NextResponse.json({
        success: false,
        error: 'Video generation timed out',
        operationId: operation.name,
        status: 'timeout'
      }, { status: 408 })
    }

    const videos = operation.response?.generatedVideos
    if (videos === undefined || videos.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No videos generated',
        details: operation.response
      }, { status: 500 })
    }

    // Get the first video
    const video = videos[0]
    const videoUrl = video.video?.uri ? decodeURIComponent(video.video.uri) : ''

    return NextResponse.json({
      success: true,
      video: {
        url: videoUrl,
        uri: video.video?.uri || '',
        prompt: enhancedPrompt,
        duration: duration,
        quality: quality,
        model: 'veo-2.0-generate-001',
        aspectRatio: '16:9',
        resolution: '720p',
        fps: 24
      },
      metadata: {
        generated_at: new Date().toISOString(),
        model: 'veo-2.0-generate-001',
        duration: duration,
        status: 'completed',
        operationId: operation.name
      }
    })

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      note: 'Video generation with veo-2.0-generate-001 requires proper Google GenAI configuration and may have quota limitations.'
    }, { status: 500 })
  }
}
