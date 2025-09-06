# Micro Learning Engine

A personalized micro-learning platform that adapts to your competence and engagement levels, powered by AI and built for the Education Hackathon.

## 🚀 Features

- **AI-Powered Personalization**: Content adapts based on learning style and competence level
- **Micro-Learning Focus**: Short, focused sessions that maximize retention
- **Real-time Adaptation**: Content adjusts based on engagement patterns
- **Progress Tracking**: Detailed analytics on learning journey and competence growth
- **Competence Assessment**: Continuous evaluation of learning progress
- **Engagement Analysis**: Real-time tracking of user engagement and attention

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI/ML**: Groq API (Llama), Google Gemini API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Framer Motion, Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- A Supabase account
- Groq API key
- Google Gemini API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd micro-learning-engine
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the environment template and fill in your API keys:

```bash
cp env.template .env.local
```

Update `.env.local` with your actual API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL_ID=llama3-8b-8192

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_ID=gemini-pro

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Setup (No SQL Client Required!)

This is the magic part - we'll set up your database using JavaScript! 🎉

```bash
npm run setup-db
```

This command will:
- Connect to your Supabase project using the service role key
- Create all necessary tables, indexes, and policies
- Insert sample learning modules
- Set up Row Level Security (RLS)

**No SQL client installation needed!** Everything is handled through JavaScript and your Supabase environment variables.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
micro-learning-engine/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── learn/             # Learning module pages
│   ├── demo/              # Demo page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── LearningCard.tsx   # Module display card
│   ├── QuestionCard.tsx   # Quiz question component
│   └── ProgressBar.tsx    # Progress tracking
├── hooks/                 # Custom React hooks
│   ├── useLearningEngine.ts
│   └── useEngagementTracking.ts
├── lib/                   # Core utilities
│   ├── supabase.ts        # Database client & types
│   ├── groq.ts           # Groq API integration
│   ├── gemini.ts         # Gemini API integration
│   └── learning-engine.ts # Core learning logic
├── scripts/               # Database setup scripts
│   └── setup-database.js  # JavaScript database setup
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## 🧠 Core Features

### Learning Engine

The `LearningEngine` class handles:
- User competence tracking
- Content personalization
- Session management
- Progress analytics
- Engagement analysis

### AI Integration

- **Groq API**: Content generation and competence assessment
- **Gemini API**: Engagement analysis and learning path recommendations

### Engagement Tracking

Real-time tracking of:
- Scroll depth
- Time on page
- Click interactions
- Pause/resume patterns
- Focus time

## 🔧 API Endpoints

- `POST /api/learning/generate-content` - Generate personalized content
- `POST /api/learning/assess-competence` - Assess user competence
- `POST /api/learning/analyze-engagement` - Analyze engagement patterns
- `POST /api/learning/recommend-path` - Get learning recommendations

## 🎯 Usage

### Basic Learning Flow

1. User starts a learning session
2. System generates personalized content based on competence level
3. User interacts with content and answers questions
4. System tracks engagement and updates competence
5. System recommends next learning steps

### Customization

The learning engine can be customized through:
- Competence thresholds
- Engagement sensitivity
- Content difficulty levels
- Learning style preferences

## 📊 Analytics

Track learning progress with:
- Completion rates
- Competence scores
- Engagement metrics
- Learning velocity
- Time-to-mastery

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@microlearning.com or create an issue in the repository.

## 🎉 Hackathon Submission

This project was built for the Education Hackathon with the following deliverables:

### Problem Statement + Solution
- **Problem**: Traditional learning platforms don't adapt to individual competence and engagement levels
- **Solution**: AI-powered micro-learning engine that personalizes content in real-time

### Target User + Pain Points
- **Target**: B2C learners, students, professionals seeking skill development
- **Pain Points**: One-size-fits-all content, learning fatigue, lack of personalization

### Business Model + Monetization
- **Freemium Model**: Basic features free, premium analytics and advanced AI
- **Subscription Tiers**: Individual, Team, Enterprise
- **Revenue Streams**: Subscriptions, corporate training, API licensing

### Plan for Scale
- **Phase 1**: MVP with core features
- **Phase 2**: Mobile app, advanced analytics
- **Phase 3**: Enterprise features, white-label solutions
- **Phase 4**: Global expansion, AI model improvements

### Team Members
- [Your Name] - Full Stack Developer
- [Team Member 2] - AI/ML Engineer
- [Team Member 3] - UI/UX Designer
- [Team Member 4] - Product Manager

---

Built with ❤️ for the Education Hackathon