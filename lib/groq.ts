import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export interface LearningContentRequest {
  topic: string
  difficultyLevel: number
  learningStyle: string
  currentCompetence: number
  previousContent?: string
}

export interface LearningContentResponse {
  content: string
  questions: Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>
  nextSteps: string[]
  estimatedDuration: number
}

export async function generateLearningContent(request: LearningContentRequest): Promise<LearningContentResponse> {
  try {
    const prompt = `
You are an AI tutor creating personalized micro-learning content. Generate educational content based on these parameters:

Topic: ${request.topic}
Difficulty Level: ${request.difficultyLevel}/5
Learning Style: ${request.learningStyle}
Current Competence: ${request.currentCompetence}/5
${request.previousContent ? `Previous Content Context: ${request.previousContent}` : ''}

Create:
1. A concise, engaging micro-lesson (2-3 minutes max)
2. 3 multiple choice questions with explanations
3. Suggested next learning steps
4. Estimated duration in minutes

Format your response as JSON with this structure:
{
  "content": "The main lesson content...",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct..."
    }
  ],
  "nextSteps": ["Next topic 1", "Next topic 2"],
  "estimatedDuration": 3
}
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in micro-learning. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: process.env.GROQ_MODEL_ID || "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from Groq API')
    }

    return JSON.parse(response)
  } catch (error) {
    console.error('Error generating learning content:', error)
    throw new Error('Failed to generate learning content')
  }
}

export async function assessCompetence(
  userAnswers: Array<{ questionId: string; answer: number; timeSpent: number }>,
  content: string
): Promise<{ competenceScore: number; areasForImprovement: string[] }> {
  try {
    const prompt = `
Analyze these user answers and assess their competence level:

Content: ${content}

User Answers:
${userAnswers.map((answer, index) => 
  `Question ${index + 1}: Answer ${answer.answer}, Time: ${answer.timeSpent}s`
).join('\n')}

Provide:
1. Competence score (0-1 scale)
2. Areas for improvement

Format as JSON:
{
  "competenceScore": 0.75,
  "areasForImprovement": ["Area 1", "Area 2"]
}
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational assessor. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: process.env.GROQ_MODEL_ID || "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from Groq API')
    }

    return JSON.parse(response)
  } catch (error) {
    console.error('Error assessing competence:', error)
    throw new Error('Failed to assess competence')
  }
}
