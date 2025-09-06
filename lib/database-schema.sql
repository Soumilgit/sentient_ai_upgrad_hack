-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  learning_style VARCHAR(50),
  competence_level DECIMAL(3,2) DEFAULT 0.0,
  engagement_score DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning modules table
CREATE TABLE learning_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_duration INTEGER NOT NULL, -- in minutes
  prerequisites TEXT[],
  learning_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage DECIMAL(5,2) DEFAULT 0.0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  last_accessed TIMESTAMP WITH TIME ZONE,
  competence_score DECIMAL(3,2) DEFAULT 0.0,
  engagement_score DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Learning sessions
CREATE TABLE learning_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  session_type VARCHAR(20) CHECK (session_type IN ('micro_learning', 'assessment', 'review')),
  duration INTEGER NOT NULL, -- in seconds
  interactions JSONB,
  competence_gained DECIMAL(3,2) DEFAULT 0.0,
  engagement_level DECIMAL(3,2) DEFAULT 0.0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions within sessions
CREATE TABLE interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) CHECK (interaction_type IN ('click', 'scroll', 'answer', 'pause', 'resume')),
  timestamp INTEGER NOT NULL, -- seconds from session start
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competence profiles for different skill areas
CREATE TABLE competence_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_area VARCHAR(100) NOT NULL,
  current_level DECIMAL(3,2) DEFAULT 0.0,
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  last_assessed TIMESTAMP WITH TIME ZONE,
  learning_velocity DECIMAL(5,2) DEFAULT 0.0, -- competence gained per hour
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_area)
);

-- Indexes for better performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_module_id ON learning_sessions(module_id);
CREATE INDEX idx_interactions_session_id ON interactions(session_id);
CREATE INDEX idx_competence_profiles_user_id ON competence_profiles(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competence_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON learning_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON learning_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions" ON interactions
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM learning_sessions WHERE id = session_id));

CREATE POLICY "Users can create own interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM learning_sessions WHERE id = session_id));

CREATE POLICY "Users can view own competence profiles" ON competence_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own competence profiles" ON competence_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Learning modules are public for reading
CREATE POLICY "Anyone can view learning modules" ON learning_modules
  FOR SELECT USING (true);
