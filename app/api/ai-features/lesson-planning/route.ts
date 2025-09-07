import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { prompt, subject, gradeLevel, duration, learningStyle, includeAudio = true } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Generate lesson plan using Gemini
    const lessonPrompt = `
Create a detailed, personalized lesson plan based on the following request:

Topic: ${prompt}
Subject: ${subject}
Grade Level: ${gradeLevel}
Duration: ${duration} minutes
Learning Style: ${learningStyle}

Please generate a comprehensive lesson plan including:
1. Learning objectives (3-5 specific, measurable objectives)
2. Prerequisites (what students should know beforehand)
3. Materials needed (physical and digital resources)
4. Step-by-step lesson structure with phases, durations, and activities
5. Assessment methods (formative and summative)
6. Differentiation strategies for different learning needs
7. Extension activities for advanced learners
8. Homework assignments

Format the response as JSON with this structure:
{
  "title": "Engaging Lesson Plan Title",
  "description": "Brief description of what this lesson covers",
  "learningObjectives": ["Students will be able to...", "Students will understand..."],
  "prerequisites": ["Basic knowledge of...", "Familiarity with..."],
  "materials": ["Textbook", "Whiteboard", "Handouts", "Digital tools"],
  "lessonStructure": [
    {
      "phase": "Introduction/Hook",
      "duration": "10 minutes",
      "activities": ["Engaging opener", "Review previous lesson"],
      "description": "How to start the lesson and capture attention"
    },
    {
      "phase": "Direct Instruction",
      "duration": "20 minutes", 
      "activities": ["Explain concepts", "Demonstrate examples"],
      "description": "Main teaching phase with clear explanations"
    },
    {
      "phase": "Guided Practice",
      "duration": "15 minutes",
      "activities": ["Work through problems together", "Q&A"],
      "description": "Students practice with teacher support"
    },
    {
      "phase": "Independent Practice", 
      "duration": "10 minutes",
      "activities": ["Individual work", "Problem solving"],
      "description": "Students work independently to apply learning"
    },
    {
      "phase": "Closure/Assessment",
      "duration": "5 minutes",
      "activities": ["Summarize key points", "Exit ticket"],
      "description": "Wrap up and check for understanding"
    }
  ],
  "assessments": [
    {
      "type": "Formative",
      "description": "Ongoing checks during lesson",
      "method": "Questioning, observation, quick polls"
    },
    {
      "type": "Summative", 
      "description": "End-of-lesson evaluation",
      "method": "Exit ticket, quiz, demonstration"
    }
  ],
  "differentiation": {
    "forStrugglingStudents": "Provide additional scaffolding, visual aids, and one-on-one support",
    "forAdvancedStudents": "Offer extension activities, leadership roles, and deeper exploration"
  },
  "estimatedDuration": "${duration} minutes",
  "gradeLevel": "${gradeLevel}"
}

Make sure the lesson is engaging, age-appropriate, and aligned with best practices for ${learningStyle} learners.
`

    const result = await model.generateContent(lessonPrompt)
    const response = await result.response
    const text = response.text()

    let lessonData
    try {
      // Clean up the response text
      const cleanedText = text.replace(/```json\s*/, '').replace(/```\s*$/, '').trim()
      lessonData = JSON.parse(cleanedText)
    } catch (error) {
      console.error('JSON parsing failed:', error)
      // Fallback response
      lessonData = {
        title: `${prompt} - Lesson Plan`,
        description: `A comprehensive lesson plan for ${prompt}`,
        learningObjectives: [`Students will understand ${prompt}`, `Students will be able to apply concepts from ${prompt}`],
        prerequisites: ['Basic foundational knowledge'],
        materials: ['Textbook', 'Whiteboard', 'Handouts'],
        lessonStructure: [
          {
            phase: 'Introduction',
            duration: '10 minutes',
            activities: ['Engaging opener', 'Review'],
            description: 'Start the lesson and capture attention'
          },
          {
            phase: 'Main Instruction',
            duration: `${Math.floor(duration * 0.5)} minutes`,
            activities: ['Explain concepts', 'Demonstrate'],
            description: 'Main teaching phase'
          },
          {
            phase: 'Practice',
            duration: `${Math.floor(duration * 0.3)} minutes`,
            activities: ['Guided practice', 'Questions'],
            description: 'Students practice with support'
          },
          {
            phase: 'Closure',
            duration: `${Math.floor(duration * 0.2)} minutes`,
            activities: ['Summarize', 'Assessment'],
            description: 'Wrap up and assess understanding'
          }
        ],
        assessments: [
          {
            type: 'Formative',
            description: 'Ongoing checks during lesson',
            method: 'Questioning and observation'
          },
          {
            type: 'Summative',
            description: 'End-of-lesson evaluation', 
            method: 'Exit ticket or quiz'
          }
        ],
        differentiation: {
          forStrugglingStudents: 'Provide additional support and visual aids',
          forAdvancedStudents: 'Offer extension activities and deeper exploration'
        },
        estimatedDuration: `${duration} minutes`,
        gradeLevel: gradeLevel
      }
    }

    // Generate audio using ElevenLabs if requested
    let audioData = null
    if (includeAudio && process.env.ELEVEN_LABS_API_KEY) {
      try {
        const audioText = `
Welcome to your personalized lesson plan for ${lessonData.title}. 

This ${lessonData.estimatedDuration} lesson is designed for ${lessonData.gradeLevel} students and focuses on ${prompt}.

Our learning objectives are: ${lessonData.learningObjectives.join(', ')}.

The lesson is structured in ${lessonData.lessonStructure.length} main phases: ${lessonData.lessonStructure.map((phase: any) => phase.phase).join(', ')}.

This lesson plan includes differentiation strategies to support all learners and multiple assessment opportunities to check for understanding.

Let's create an engaging learning experience for your students!
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
            duration: Math.ceil(audioText.length / 15),
            voice: '21m00Tcm4TlvDq8ikWAM'
          }
        }
      } catch (error) {
        console.error('Error generating audio:', error)
      }
    }

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
      gradeLevel: lessonData.gradeLevel,
      audio: audioData,
      metadata: {
        generated_at: new Date().toISOString(),
        subject: subject,
        duration: duration,
        learningStyle: learningStyle,
        hasAudio: !!audioData
      }
    })
  } catch (error) {
    console.error('Lesson planning error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
