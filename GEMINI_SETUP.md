# Gemini API Setup Instructions

## 🔑 Setting up Gemini API Key

To enable the AI assistant (@sentient) in the community forum, you need to configure your Gemini API key:

### Step 1: Get your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Add to Environment Variables
Create a `.env.local` file in the project root with:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**OR** for client-side usage:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 3: Restart Development Server
```bash
npm run dev
```

## 🚀 Testing the AI Assistant

1. Go to http://localhost:3000/dashboard
2. Click "Community Forum" in the sidebar
3. Type a message with `@sentient` followed by your question
4. Example: `@sentient How can I create an engaging lesson plan for 5th grade math?`

## 🎯 AI Assistant Features

The Sentient AI assistant will:
- Provide contextual educational advice
- Adapt responses based on the channel (lesson-planning, general, etc.)
- Remember conversation history for context
- Offer specific, actionable recommendations
- Reference educational best practices

## 🔧 Troubleshooting

**If AI doesn't respond:**
1. Check browser console for error messages
2. Verify GEMINI_API_KEY is set correctly
3. Ensure you have internet connectivity
4. Try refreshing the page

**Common Issues:**
- API key not set: Add to .env.local file
- Quota exceeded: Wait or upgrade your Gemini plan
- Network issues: Check internet connection
