const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Supabase URL or Service Role Key not found in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Sample data for learning modules
const sampleModules = [
  {
    title: 'Introduction to Machine Learning',
    description: 'Learn the fundamentals of ML algorithms and their applications in real-world scenarios.',
    content: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. This module covers the basics of supervised learning, unsupervised learning, and reinforcement learning.',
    difficulty_level: 2,
    estimated_duration: 15,
    prerequisites: [],
    learning_objectives: ['Understand ML basics', 'Learn common algorithms', 'Apply ML concepts']
  },
  {
    title: 'Data Structures and Algorithms',
    description: 'Master essential data structures and algorithmic thinking for technical interviews.',
    content: 'Data structures are ways of organizing data in a computer so that it can be used efficiently. This module covers arrays, linked lists, stacks, queues, trees, and graphs along with common algorithms.',
    difficulty_level: 3,
    estimated_duration: 20,
    prerequisites: ['Basic programming knowledge'],
    learning_objectives: ['Master arrays and linked lists', 'Understand sorting algorithms', 'Solve coding problems']
  },
  {
    title: 'React Hooks Deep Dive',
    description: 'Advanced React patterns and custom hooks for building scalable applications.',
    content: 'React Hooks are functions that let you use state and other React features in functional components. This module covers useState, useEffect, custom hooks, and performance optimization.',
    difficulty_level: 4,
    estimated_duration: 12,
    prerequisites: ['Basic React knowledge', 'JavaScript ES6+'],
    learning_objectives: ['Master useState and useEffect', 'Create custom hooks', 'Optimize performance']
  },
  {
    title: 'Database Design Principles',
    description: 'Learn to design efficient and scalable database schemas for modern applications.',
    content: 'Database design is the process of creating a detailed data model of a database. This module covers normalization, relationships, indexing, and performance optimization.',
    difficulty_level: 3,
    estimated_duration: 18,
    prerequisites: ['Basic SQL knowledge'],
    learning_objectives: ['Understand normalization', 'Design relationships', 'Optimize queries']
  },
  {
    title: 'API Security Best Practices',
    description: 'Implement secure API endpoints and protect against common vulnerabilities.',
    content: 'API security is crucial for protecting your application and user data. This module covers authentication, authorization, input validation, and common security threats.',
    difficulty_level: 4,
    estimated_duration: 14,
    prerequisites: ['Basic API knowledge', 'HTTP protocols'],
    learning_objectives: ['Implement authentication', 'Secure endpoints', 'Handle vulnerabilities']
  }
];

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    console.log('📡 Connecting to Supabase...');

    // Test connection
    const { data, error } = await supabase.from('learning_modules').select('count').limit(1);
    if (error && !error.message.includes('relation "learning_modules" does not exist')) {
      throw error;
    }

    console.log('✅ Connected to Supabase successfully!');
    console.log('');
    console.log('📋 IMPORTANT: You need to manually create the database schema in Supabase.');
    console.log('');
    console.log('🔧 Please follow these steps:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the SQL schema from lib/database-schema.sql');
    console.log('4. Run the SQL to create all tables and policies');
    console.log('5. Then run this script again to insert sample data');
    console.log('');

    // Check if tables exist
    const { data: modules, error: modulesError } = await supabase
      .from('learning_modules')
      .select('id')
      .limit(1);

    if (modulesError) {
      console.log('❌ Tables not found. Please create the database schema first.');
      console.log('📄 SQL schema is available in: lib/database-schema.sql');
      return;
    }

    console.log('✅ Database tables found!');
    console.log('🌱 Inserting sample data...');

    // Insert sample modules
    for (const module of sampleModules) {
      const { error: insertError } = await supabase
        .from('learning_modules')
        .insert([module]);

      if (insertError) {
        console.log(`⚠️  Warning: Could not insert module "${module.title}": ${insertError.message}`);
      } else {
        console.log(`✅ Inserted: ${module.title}`);
      }
    }

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('🚀 Your micro-learning engine is ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Start building your hackathon project!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('');
    console.log('🔧 Manual setup required:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy the contents of lib/database-schema.sql');
    console.log('4. Paste and execute the SQL');
    console.log('5. Run this script again');
    process.exit(1);
  }
}

// Run the setup
setupDatabase();