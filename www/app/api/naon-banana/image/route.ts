import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'realistic', quality = 'high' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Enhanced prompt for educational content
    const enhancedPrompt = `Educational illustration: ${prompt}. Style: ${style}, Quality: ${quality}. Clear, professional, suitable for learning materials. High-quality, detailed, educational diagram or illustration.`

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: enhancedPrompt
        }]
      }]
    })

    const response = await result.response
    
    // Check if the response contains image data
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0]
      
      // For image generation, we need to handle the response differently
      // The actual implementation may vary based on Google's API response format
      const imageData = candidate.content?.parts?.[0]
      
      if (imageData) {
        return NextResponse.json({
          success: true,
          image: {
            data: imageData,
            prompt: enhancedPrompt,
            style: style,
            quality: quality,
            model: 'gemini-2.5-flash-image-preview'
          },
          metadata: {
            generated_at: new Date().toISOString(),
            model: 'gemini-2.5-flash-image-preview'
          }
        })
      }
    }

    // Fallback response if image generation is not directly supported
    return NextResponse.json({
      success: false,
      error: 'Image generation not available with current model configuration',
      suggestion: 'The gemini-2.5-flash-image-preview model may not be available for direct image generation. Consider using image analysis capabilities instead.',
      prompt: enhancedPrompt
    })

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      note: 'Image generation with gemini-2.5-flash-image-preview may require specific configuration or may not be available in the current API version.'
    }, { status: 500 })
  }
}
