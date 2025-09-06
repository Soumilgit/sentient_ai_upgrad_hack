// ElevenLabs API configuration
export const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY

export const ELEVEN_LABS_BASE_URL = 'https://api.elevenlabs.io/v1'

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  description: string
  preview_url: string
}

export interface ElevenLabsResponse {
  audio: string
}

// Get available voices
export async function getVoices(): Promise<ElevenLabsVoice[]> {
  if (!ELEVEN_LABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVEN_LABS_BASE_URL}/voices`, {
    headers: {
      'xi-api-key': ELEVEN_LABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.statusText}`)
  }

  const data = await response.json()
  return data.voices
}

// Convert text to speech
export async function textToSpeech(
  text: string,
  voiceId: string = 'pNInz6obpgDQGcFmaJgB' // Default voice ID
): Promise<string> {
  if (!ELEVEN_LABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`${ELEVEN_LABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to convert text to speech: ${response.statusText}`)
  }

  const audioBlob = await response.blob()
  return URL.createObjectURL(audioBlob)
}

// Speech to text (using Web Speech API as fallback)
export async function speechToText(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      resolve(transcript)
    }

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`))
    }

    recognition.start()
  })
}
