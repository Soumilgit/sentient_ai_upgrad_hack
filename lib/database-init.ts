import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function initializeDatabase() {
  console.log('🚀 Initializing database schema...')
  
  try {
    // Enable necessary extensions
    await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    })
    console.log('✅ Extensions enabled')

    // Create Users table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          learning_style VARCHAR(50),
          competence_level DECIMAL(3,2) DEFAULT 0.0,
          engagement_score DECIMAL(3,2) DEFAULT 0.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    console.log('✅ Users table created')

    // Create Learning Modules table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS learning_modules (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          content TEXT NOT NULL,
          difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
          estimated_duration INTEGER NOT NULL,
          prerequisites TEXT[],
          learning_objectives TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    console.log('✅ Learning modules table created')

    // Create User Progress table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_progress (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
          status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
          progress_percentage DECIMAL(5,2) DEFAULT 0.0,
          time_spent INTEGER DEFAULT 0,
          last_accessed TIMESTAMP WITH TIME ZONE,
          competence_score DECIMAL(3,2) DEFAULT 0.0,
          engagement_score DECIMAL(3,2) DEFAULT 0.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, module_id)
        );
      `
    })
    console.log('✅ User progress table created')

    // Create Learning Sessions table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS learning_sessions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
          session_type VARCHAR(20) CHECK (session_type IN ('micro_learning', 'assessment', 'review')),
          duration INTEGER NOT NULL,
          interactions JSONB,
          competence_gained DECIMAL(3,2) DEFAULT 0.0,
          engagement_level DECIMAL(3,2) DEFAULT 0.0,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    console.log('✅ Learning sessions table created')

    // Create Interactions table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS interactions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
          interaction_type VARCHAR(20) CHECK (interaction_type IN ('click', 'scroll', 'answer', 'pause', 'resume')),
          timestamp INTEGER NOT NULL,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    console.log('✅ Interactions table created')

    // Create Competence Profiles table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS competence_profiles (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          skill_area VARCHAR(100) NOT NULL,
          current_level DECIMAL(3,2) DEFAULT 0.0,
          confidence_score DECIMAL(3,2) DEFAULT 0.0,
          last_assessed TIMESTAMP WITH TIME ZONE,
          learning_velocity DECIMAL(5,2) DEFAULT 0.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, skill_area)
        );
      `
    })
    console.log('✅ Competence profiles table created')

    // Create indexes for better performance
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
        CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_learning_sessions_module_id ON learning_sessions(module_id);
        CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions(session_id);
        CREATE INDEX IF NOT EXISTS idx_competence_profiles_user_id ON competence_profiles(user_id);
      `
    })
    console.log('✅ Indexes created')

    // Enable Row Level Security (RLS)
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
        ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE competence_profiles ENABLE ROW LEVEL SECURITY;
      `
    })
    console.log('✅ Row Level Security enabled')

    // Create RLS policies
    await supabase.rpc('exec_sql', {
      sql: `
        -- Users can only see their own data
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON users
          FOR SELECT USING (auth.uid() = id);

        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
          FOR UPDATE USING (auth.uid() = id);

        CREATE POLICY IF NOT EXISTS "Users can view own progress" ON user_progress
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update own progress" ON user_progress
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can view own sessions" ON learning_sessions
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can create own sessions" ON learning_sessions
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can view own interactions" ON interactions
          FOR SELECT USING (auth.uid() = (SELECT user_id FROM learning_sessions WHERE id = session_id));

        CREATE POLICY IF NOT EXISTS "Users can create own interactions" ON interactions
          FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM learning_sessions WHERE id = session_id));

        CREATE POLICY IF NOT EXISTS "Users can view own competence profiles" ON competence_profiles
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update own competence profiles" ON competence_profiles
          FOR UPDATE USING (auth.uid() = user_id);

        -- Learning modules are public for reading
        CREATE POLICY IF NOT EXISTS "Anyone can view learning modules" ON learning_modules
          FOR SELECT USING (true);
      `
    })
    console.log('✅ RLS policies created')

    // Insert sample learning modules
    await insertSampleData()
    
    console.log('🎉 Database initialization completed successfully!')
    return { success: true, message: 'Database initialized successfully' }

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

async function insertSampleData() {
  console.log('📝 Inserting sample data...')
  
  try {
    // Insert sample learning modules
    const sampleModules = [
      {
        title: 'Introduction to Machine Learning',
        description: 'Learn the fundamentals of ML algorithms and their applications in real-world scenarios.',
        content: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.',
        difficulty_level: 2,
        estimated_duration: 15,
        prerequisites: ['Basic programming knowledge'],
        learning_objectives: ['Understand ML concepts', 'Learn algorithm types', 'Apply ML techniques']
      },
      {
        title: 'Data Structures and Algorithms',
        description: 'Master essential data structures and algorithmic thinking for technical interviews.',
        content: 'Data structures are ways of organizing data in a computer so that it can be accessed and modified efficiently.',
        difficulty_level: 3,
        estimated_duration: 20,
        prerequisites: ['Programming fundamentals'],
        learning_objectives: ['Master common data structures', 'Understand algorithm complexity', 'Solve coding problems']
      },
      {
        title: 'React Hooks Deep Dive',
        description: 'Advanced React patterns and custom hooks for building scalable applications.',
        content: 'React Hooks are functions that let you use state and other React features in functional components.',
        difficulty_level: 4,
        estimated_duration: 12,
        prerequisites: ['Basic React knowledge'],
        learning_objectives: ['Master useState and useEffect', 'Create custom hooks', 'Optimize performance']
      }
    ]

    for (const module of sampleModules) {
      const { error } = await supabase
        .from('learning_modules')
        .upsert(module, { onConflict: 'title' })
      
      if (error) {
        console.warn(`⚠️ Could not insert module "${module.title}":`, error.message)
      }
    }

    console.log('✅ Sample data inserted')
  } catch (error) {
    console.warn('⚠️ Could not insert sample data:', error)
  }
}

// Export a function to check if database is initialized
export async function checkDatabaseStatus() {
  try {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('count')
      .limit(1)
    
    if (error) {
      return { initialized: false, error: error.message }
    }
    
    return { initialized: true, message: 'Database is ready' }
  } catch (error) {
    return { initialized: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
