const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Supabase URL or Service Role Key not found in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Generate UUIDs for users
const userIds = {
  'user-1': uuidv4(),
  'user-2': uuidv4(),
  'user-3': uuidv4(),
  'user-4': uuidv4()
};

// Sample data for users
const sampleUsers = [
  {
    id: userIds['user-1'],
    email: 'alex.johnson@example.com',
    name: 'Alex Johnson',
    learning_style: 'visual',
    competence_level: 3.2,
    engagement_score: 0.85
  },
  {
    id: userIds['user-2'],
    email: 'sarah.chen@example.com',
    name: 'Sarah Chen',
    learning_style: 'auditory',
    competence_level: 2.8,
    engagement_score: 0.92
  },
  {
    id: userIds['user-3'],
    email: 'mike.rodriguez@example.com',
    name: 'Mike Rodriguez',
    learning_style: 'kinesthetic',
    competence_level: 4.1,
    engagement_score: 0.78
  },
  {
    id: userIds['user-4'],
    email: 'emma.wilson@example.com',
    name: 'Emma Wilson',
    learning_style: 'reading',
    competence_level: 2.5,
    engagement_score: 0.88
  }
];

// Sample data for user progress (will be updated with actual module IDs)
const sampleUserProgress = [
  {
    user_id: userIds['user-1'],
    module_id: 'module-1',
    status: 'completed',
    progress_percentage: 100,
    time_spent: 900,
    competence_score: 0.85,
    engagement_score: 0.88
  },
  {
    user_id: userIds['user-1'],
    module_id: 'module-2',
    status: 'in_progress',
    progress_percentage: 75,
    time_spent: 1200,
    competence_score: 0.72,
    engagement_score: 0.91
  },
  {
    user_id: userIds['user-2'],
    module_id: 'module-1',
    status: 'completed',
    progress_percentage: 100,
    time_spent: 780,
    competence_score: 0.92,
    engagement_score: 0.95
  },
  {
    user_id: userIds['user-2'],
    module_id: 'module-3',
    status: 'completed',
    progress_percentage: 100,
    time_spent: 650,
    competence_score: 0.88,
    engagement_score: 0.89
  },
  {
    user_id: userIds['user-3'],
    module_id: 'module-2',
    status: 'completed',
    progress_percentage: 100,
    time_spent: 1100,
    competence_score: 0.95,
    engagement_score: 0.82
  },
  {
    user_id: userIds['user-3'],
    module_id: 'module-4',
    status: 'in_progress',
    progress_percentage: 60,
    time_spent: 800,
    competence_score: 0.78,
    engagement_score: 0.85
  },
  {
    user_id: userIds['user-4'],
    module_id: 'module-1',
    status: 'in_progress',
    progress_percentage: 40,
    time_spent: 450,
    competence_score: 0.65,
    engagement_score: 0.90
  }
];

// Sample data for learning modules
const sampleModules = [
  {
    title: 'Introduction to Machine Learning',
    description: 'Learn the fundamentals of ML algorithms and their applications in real-world scenarios.',
    content: `# Introduction to Machine Learning

Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.

## Key Concepts

**Supervised Learning**: Learning with labeled examples. The algorithm learns from input-output pairs to make predictions on new data.

**Unsupervised Learning**: Finding hidden patterns in data without labeled examples. Common techniques include clustering and dimensionality reduction.

**Reinforcement Learning**: Learning through interaction with an environment, receiving rewards or penalties for actions.

## Real-World Applications

- **Recommendation Systems**: Netflix, Amazon, Spotify
- **Image Recognition**: Medical diagnosis, autonomous vehicles
- **Natural Language Processing**: Chatbots, translation services
- **Financial Services**: Fraud detection, algorithmic trading

## Getting Started

To begin your ML journey, you'll need to understand:
1. Basic statistics and probability
2. Programming fundamentals (Python recommended)
3. Data manipulation and visualization
4. Linear algebra basics

The field is constantly evolving, making it an exciting area for continuous learning and innovation.`,
    difficulty_level: 2,
    estimated_duration: 15,
    prerequisites: [],
    learning_objectives: ['Understand ML basics', 'Learn common algorithms', 'Apply ML concepts']
  },
  {
    title: 'Data Structures and Algorithms',
    description: 'Master essential data structures and algorithmic thinking for technical interviews.',
    content: `# Data Structures and Algorithms

Data structures are ways of organizing data in a computer so that it can be used efficiently. Algorithms are step-by-step procedures for solving problems.

## Core Data Structures

**Arrays**: Contiguous memory locations storing elements of the same type.

**Linked Lists**: Linear data structure where elements are not stored at contiguous memory locations.

**Stacks**: LIFO (Last In, First Out) data structure.

**Queues**: FIFO (First In, First Out) data structure.

**Trees**: Hierarchical data structure with a root value and subtrees.

**Graphs**: Collection of nodes connected by edges.

## Common Algorithms

**Sorting**: Bubble Sort, Quick Sort, Merge Sort, Heap Sort

**Searching**: Linear Search, Binary Search

**Graph Algorithms**: BFS, DFS, Dijkstra's Algorithm

**Dynamic Programming**: Memoization, Tabulation

## Time and Space Complexity

Understanding Big O notation is crucial for analyzing algorithm efficiency.`,
    difficulty_level: 3,
    estimated_duration: 20,
    prerequisites: ['Basic programming knowledge'],
    learning_objectives: ['Master arrays and linked lists', 'Understand sorting algorithms', 'Solve coding problems']
  },
  {
    title: 'React Hooks Deep Dive',
    description: 'Advanced React patterns and custom hooks for building scalable applications.',
    content: `# React Hooks Deep Dive

React Hooks are functions that let you use state and other React features in functional components.

## Core Hooks

**useState**: Manages local component state.

**useEffect**: Performs side effects in functional components.

**useContext**: Consumes context values without nesting.

**useReducer**: Manages complex state logic with reducers.

**useMemo**: Memoizes expensive calculations.

**useCallback**: Memoizes callback functions.

## Custom Hooks

Custom hooks allow you to extract component logic into reusable functions. They follow the naming convention of starting with "use".

## Best Practices

- Only call hooks at the top level
- Don't call hooks inside loops, conditions, or nested functions
- Use the exhaustive-deps rule for useEffect
- Optimize performance with useMemo and useCallback

## Advanced Patterns

- Custom hooks for API calls
- Context with useReducer
- Performance optimization techniques
- Testing custom hooks`,
    difficulty_level: 4,
    estimated_duration: 12,
    prerequisites: ['Basic React knowledge', 'JavaScript ES6+'],
    learning_objectives: ['Master useState and useEffect', 'Create custom hooks', 'Optimize performance']
  },
  {
    title: 'Database Design Principles',
    description: 'Learn to design efficient and scalable database schemas for modern applications.',
    content: `# Database Design Principles

Database design is the process of creating a detailed data model of a database. Good design ensures data integrity, performance, and scalability.

## Normalization

**First Normal Form (1NF)**: Eliminate duplicate columns and ensure atomic values.

**Second Normal Form (2NF)**: Remove partial dependencies.

**Third Normal Form (3NF)**: Remove transitive dependencies.

## Relationships

**One-to-One**: Each record in one table relates to exactly one record in another.

**One-to-Many**: One record in a table relates to many records in another.

**Many-to-Many**: Records in both tables can relate to multiple records in the other.

## Indexing

Proper indexing improves query performance by creating data structures that allow faster data retrieval.

## Performance Optimization

- Choose appropriate data types
- Use proper indexing strategies
- Optimize queries
- Consider partitioning for large tables`,
    difficulty_level: 3,
    estimated_duration: 18,
    prerequisites: ['Basic SQL knowledge'],
    learning_objectives: ['Understand normalization', 'Design relationships', 'Optimize queries']
  },
  {
    title: 'API Security Best Practices',
    description: 'Implement secure API endpoints and protect against common vulnerabilities.',
    content: `# API Security Best Practices

API security is crucial for protecting your application and user data from various threats.

## Authentication vs Authorization

**Authentication**: Verifying who the user is.

**Authorization**: Determining what the user can do.

## Common Security Threats

**OWASP Top 10**:
- Injection attacks
- Broken authentication
- Sensitive data exposure
- XML external entities
- Broken access control
- Security misconfiguration
- Cross-site scripting
- Insecure deserialization
- Using components with known vulnerabilities
- Insufficient logging and monitoring

## Best Practices

- Use HTTPS everywhere
- Implement proper authentication (JWT, OAuth)
- Validate and sanitize all inputs
- Use rate limiting
- Implement proper error handling
- Keep dependencies updated
- Use security headers
- Regular security audits`,
    difficulty_level: 4,
    estimated_duration: 14,
    prerequisites: ['Basic API knowledge', 'HTTP protocols'],
    learning_objectives: ['Implement authentication', 'Secure endpoints', 'Handle vulnerabilities']
  }
];

async function insertSampleData() {
  try {
    console.log('🌱 Inserting sample data...');
    console.log('📡 Connecting to Supabase...');

    // Check if tables exist
    const { data: modules, error: modulesError } = await supabase
      .from('learning_modules')
      .select('id')
      .limit(1);

    if (modulesError) {
      console.log('❌ Tables not found. Please create the database schema first.');
      console.log('📄 Run: npm run setup-db');
      return;
    }

    console.log('✅ Database tables found!');

    // Clear existing sample data
    console.log('🧹 Clearing existing sample data...');
    await supabase.from('learning_modules').delete().like('title', '%Introduction%');
    await supabase.from('learning_modules').delete().like('title', '%Data Structures%');
    await supabase.from('learning_modules').delete().like('title', '%React Hooks%');
    await supabase.from('learning_modules').delete().like('title', '%Database Design%');
    await supabase.from('learning_modules').delete().like('title', '%API Security%');
    await supabase.from('users').delete().in('id', sampleUsers.map(u => u.id));

    // Insert sample users
    console.log('👥 Inserting sample users...');
    for (const user of sampleUsers) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([user]);

      if (insertError) {
        console.log(`⚠️  Warning: Could not insert user "${user.name}": ${insertError.message}`);
      } else {
        console.log(`✅ Inserted user: ${user.name}`);
      }
    }

    // Insert sample modules
    console.log('📚 Inserting learning modules...');
    const moduleIds = [];
    for (const module of sampleModules) {
      const { data: insertedModule, error: insertError } = await supabase
        .from('learning_modules')
        .insert([module])
        .select('id')
        .single();

      if (insertError) {
        console.log(`⚠️  Warning: Could not insert module "${module.title}": ${insertError.message}`);
      } else {
        console.log(`✅ Inserted: ${module.title}`);
        moduleIds.push(insertedModule.id);
      }
    }

    // Update user progress with actual module IDs
    console.log('📊 Inserting user progress data...');
    const progressWithModuleIds = sampleUserProgress.map(progress => {
      const moduleIndex = parseInt(progress.module_id.split('-')[1]) - 1;
      return {
        ...progress,
        module_id: moduleIds[moduleIndex] || moduleIds[0]
      };
    });

    for (const progress of progressWithModuleIds) {
      const { error: insertError } = await supabase
        .from('user_progress')
        .insert([progress]);

      if (insertError) {
        console.log(`⚠️  Warning: Could not insert progress for user ${progress.user_id}: ${insertError.message}`);
      } else {
        console.log(`✅ Inserted progress for user ${progress.user_id}`);
      }
    }

    console.log('');
    console.log('🎉 Sample data insertion completed!');
    console.log('🚀 Your micro-learning engine is ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Start building your hackathon project!');

  } catch (error) {
    console.error('❌ Sample data insertion failed:', error.message);
    console.log('');
    console.log('🔧 Make sure you have:');
    console.log('1. Created the database schema (run: npm run setup-db)');
    console.log('2. Set up your environment variables in .env.local');
    process.exit(1);
  }
}

// Run the insertion
insertSampleData();
