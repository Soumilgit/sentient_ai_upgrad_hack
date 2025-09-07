import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { prompt, subject, difficulty, includeMedia = true } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Generate educational content using Gemini
    const contentPrompt = `
Create comprehensive educational content based on the following request:

Topic: ${prompt}
Subject: ${subject}
Difficulty: ${difficulty}

Please generate:
1. Multiple choice questions (5-8 questions)
2. True/false questions (3-5 questions)
3. Fill-in-the-blank questions (3-5 questions)
4. Short answer questions (2-3 questions)
5. Essay questions (1-2 questions)
6. Interactive exercises (2-3 exercises)
7. Visual content suggestions for images
8. Video content suggestions

For visual content, suggest specific, detailed prompts for image generation that would be educational and relevant.

For video content, suggest specific, detailed prompts for video generation that would be educational and relevant.

Format the response as JSON with this structure:
{
  "title": "Content Package Title",
  "description": "Brief description of the content",
  "quizzes": {
    "multipleChoice": [
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Why this is correct"
      }
    ],
    "trueFalse": [
      {
        "question": "Statement",
        "correctAnswer": true,
        "explanation": "Explanation"
      }
    ],
    "fillInBlank": [
      {
        "question": "Complete the sentence: ___ is important",
        "correctAnswer": "Learning",
        "explanation": "Explanation"
      }
    ],
    "shortAnswer": [
      {
        "question": "Short answer question",
        "sampleAnswer": "Sample answer",
        "explanation": "Explanation"
      }
    ],
    "essay": [
      {
        "question": "Essay question",
        "guidelines": "Essay guidelines",
        "rubric": "Grading rubric"
      }
    ]
  },
  "exercises": [
    {
      "type": "Practice Problem",
      "description": "Exercise description",
      "instructions": "Step-by-step instructions",
      "solution": "Solution steps"
    }
  ],
  "visualSuggestions": [
    {
      "type": "Diagram",
      "description": "Visual description",
      "purpose": "Educational purpose",
      "imagePrompt": "Detailed prompt for image generation"
    }
  ],
  "videoSuggestions": [
    {
      "type": "Explainer Video",
      "description": "Video content description",
      "duration": "5 minutes",
      "videoPrompt": "Detailed prompt for video generation"
    }
  ]
}
`

    const result = await model.generateContent(contentPrompt)
    const response = await result.response
    const text = response.text()

    let contentData
    try {
      contentData = JSON.parse(text)
    } catch (error) {
      // Fallback if JSON parsing fails
      contentData = {
        title: `${prompt} Content Package`,
        description: `Educational content for ${prompt}`,
        content: text,
        rawResponse: true
      }
    }

    // Generate media if requested
    let generatedMedia = []
    
    if (includeMedia && contentData.visualSuggestions) {
      // Generate images for visual suggestions
      for (const visual of contentData.visualSuggestions.slice(0, 3)) { // Limit to 3 images
        try {
          const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/google-media/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: visual.imagePrompt || visual.description,
              style: 'educational',
              quality: 'high'
            }),
          })

          if (imageResponse.ok) {
            const imageData = await imageResponse.json()
            generatedMedia.push({
              type: 'image',
              url: imageData.image.url,
              name: `${visual.type}_${Date.now()}.jpg`,
              description: visual.description,
              purpose: visual.purpose
            })
          }
        } catch (error) {
          console.error('Error generating image:', error)
        }
      }
    }

    if (includeMedia && contentData.videoSuggestions) {
      // Generate videos for video suggestions (limit to 1 video due to processing time)
      const videoSuggestion = contentData.videoSuggestions[0]
      if (videoSuggestion) {
        try {
          const videoResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/google-media/video`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: videoSuggestion.videoPrompt || videoSuggestion.description,
              duration: 10,
              quality: 'high'
            }),
          })

          if (videoResponse.ok) {
            const videoData = await videoResponse.json()
            generatedMedia.push({
              type: 'video',
              url: videoData.video.url,
              name: `${videoSuggestion.type}_${Date.now()}.mp4`,
              description: videoSuggestion.description,
              duration: videoSuggestion.duration
            })
          }
        } catch (error) {
          console.error('Error generating video:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      title: contentData.title,
      description: contentData.description,
      quizzes: contentData.quizzes,
      exercises: contentData.exercises,
      visualSuggestions: contentData.visualSuggestions,
      videoSuggestions: contentData.videoSuggestions,
      files: generatedMedia,
      metadata: {
        generated_at: new Date().toISOString(),
        subject: subject,
        difficulty: difficulty,
        mediaGenerated: generatedMedia.length
      }
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
