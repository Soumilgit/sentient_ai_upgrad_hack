import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { prompt, subject, difficulty, featureType } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Route to specific feature handler
    switch (featureType) {
      case 'ppt':
        return await handlePPTCreation(model, prompt, subject, difficulty)
      case 'lesson':
        return await handleLessonPlanning(model, prompt, subject, difficulty)
      case 'content':
        // Redirect to dedicated content endpoint
        const contentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai-features/content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, subject, difficulty, includeMedia: true }),
        })
        return contentResponse
      case 'tutor':
        // Redirect to dedicated tutor endpoint
        const tutorResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai-features/tutor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, subject, difficulty, includeAudio: true }),
        })
        return tutorResponse
      default:
        return NextResponse.json({ error: 'Invalid feature type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Features API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handlePPTCreation(model: any, prompt: string, subject: string, difficulty: string) {
  const pptPrompt = `
Create a comprehensive PowerPoint presentation based on the following request:

Topic: ${prompt}
Subject: ${subject}
Difficulty: ${difficulty}

Please generate:
1. A compelling title for the presentation
2. 8-12 slide topics with detailed content
3. Key points for each slide
4. Visual suggestions for each slide
5. Interactive elements or activities
6. Summary and conclusion slides

Format the response as JSON with this structure:
{
  "title": "Presentation Title",
  "description": "Brief description of the presentation",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": "Main content for this slide",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "visualSuggestions": "Description of visual elements",
      "interactiveElements": "Suggested activities or questions"
    }
  ],
  "totalSlides": 10,
  "estimatedDuration": "45 minutes",
  "targetAudience": "${difficulty} level students"
}
`

  const result = await model.generateContent(pptPrompt)
  const response = await result.response
  const text = response.text()

  try {
    const pptData = JSON.parse(text)
    return NextResponse.json({
      success: true,
      title: pptData.title,
      description: pptData.description,
      slides: pptData.slides,
      totalSlides: pptData.totalSlides,
      estimatedDuration: pptData.estimatedDuration,
      targetAudience: pptData.targetAudience
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      title: `${prompt} Presentation`,
      description: `A comprehensive presentation about ${prompt}`,
      content: text,
      rawResponse: true
    })
  }
}

async function handleLessonPlanning(model: any, prompt: string, subject: string, difficulty: string) {
  const lessonPrompt = `
Create a detailed, personalized lesson plan based on the following request:

Topic: ${prompt}
Subject: ${subject}
Difficulty: ${difficulty}

Please generate a comprehensive lesson plan including:
1. Learning objectives
2. Prerequisites
3. Materials needed
4. Step-by-step lesson structure
5. Assessment methods
6. Differentiation strategies
7. Extension activities
8. Homework assignments

Format the response as JSON with this structure:
{
  "title": "Lesson Plan Title",
  "description": "Brief description of the lesson",
  "learningObjectives": ["Objective 1", "Objective 2"],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "materials": ["Material 1", "Material 2"],
  "lessonStructure": [
    {
      "phase": "Introduction",
      "duration": "10 minutes",
      "activities": ["Activity 1", "Activity 2"],
      "description": "What happens in this phase"
    }
  ],
  "assessments": [
    {
      "type": "Formative",
      "description": "Assessment description",
      "method": "How to assess"
    }
  ],
  "differentiation": {
    "forStrugglingStudents": "Support strategies",
    "forAdvancedStudents": "Extension activities"
  },
  "estimatedDuration": "60 minutes",
  "gradeLevel": "${difficulty}"
}
`

  const result = await model.generateContent(lessonPrompt)
  const response = await result.response
  const text = response.text()

  try {
    const lessonData = JSON.parse(text)
    return NextResponse.json({
      success: true,
      title: lessonData.title,
      description: lessonData.description,
      learningObjectives: lessonData.learningObjectives,
      prerequisites: lessonData.prerequisites,
      materials: lessonData.materials,
      lessonStructure: lessonData.lessonStructure,
      assessments: lessonData.assessments,
      differentiation: lessonData.differentiation,
      estimatedDuration: lessonData.estimatedDuration,
      gradeLevel: lessonData.gradeLevel
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      title: `${prompt} Lesson Plan`,
      description: `A comprehensive lesson plan for ${prompt}`,
      content: text,
      rawResponse: true
    })
  }
}

async function handleContentGeneration(model: any, prompt: string, subject: string, difficulty: string) {
  const contentPrompt = `
Create comprehensive educational content based on the following request:

Topic: ${prompt}
Subject: ${subject}
Difficulty: ${difficulty}

Please generate:
1. Multiple choice questions
2. True/false questions
3. Fill-in-the-blank questions
4. Short answer questions
5. Essay questions
6. Interactive exercises
7. Visual content suggestions
8. Video content suggestions

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
    ]
  },
  "exercises": [
    {
      "type": "Practice Problem",
      "description": "Exercise description",
      "instructions": "Step-by-step instructions"
    }
  ],
  "visualSuggestions": [
    {
      "type": "Diagram",
      "description": "Visual description",
      "purpose": "Educational purpose"
    }
  ],
  "videoSuggestions": [
    {
      "type": "Explainer Video",
      "description": "Video content description",
      "duration": "5 minutes"
    }
  ]
}
`

  const result = await model.generateContent(contentPrompt)
  const response = await result.response
  const text = response.text()

  try {
    const contentData = JSON.parse(text)
    return NextResponse.json({
      success: true,
      title: contentData.title,
      description: contentData.description,
      quizzes: contentData.quizzes,
      exercises: contentData.exercises,
      visualSuggestions: contentData.visualSuggestions,
      videoSuggestions: contentData.videoSuggestions
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      title: `${prompt} Content Package`,
      description: `Educational content for ${prompt}`,
      content: text,
      rawResponse: true
    })
  }
}

async function handleAITutor(model: any, prompt: string, subject: string, difficulty: string) {
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

  try {
    const tutorData = JSON.parse(text)
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
      estimatedSessionTime: tutorData.estimatedSessionTime
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      title: `${prompt} Learning Session`,
      description: `Personalized tutoring session for ${prompt}`,
      content: text,
      rawResponse: true
    })
  }
}
