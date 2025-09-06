const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Supabase URL or Service Role Key not found in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('🚀 Micro Learning Engine Database Setup');
    console.log('=====================================');
    console.log('');
    console.log('📋 Since Supabase doesn\'t allow direct SQL execution via API,');
    console.log('   we\'ll guide you through the manual setup process.');
    console.log('');
    console.log('🔧 Step-by-step instructions:');
    console.log('');
    console.log('1️⃣  Open your Supabase project dashboard');
    console.log('    👉 https://supabase.com/dashboard');
    console.log('');
    console.log('2️⃣  Navigate to the SQL Editor');
    console.log('    👉 Click on "SQL Editor" in the left sidebar');
    console.log('');
    console.log('3️⃣  Copy the database schema');
    console.log('    👉 Open the file: lib/database-schema.sql');
    console.log('    👉 Copy all the contents');
    console.log('');
    console.log('4️⃣  Paste and execute the SQL');
    console.log('    👉 Paste the SQL into the SQL Editor');
    console.log('    👉 Click "Run" to execute');
    console.log('');
    console.log('5️⃣  Verify the setup');
    console.log('    👉 Check that all tables are created');
    console.log('    👉 Look for: users, learning_modules, user_progress, etc.');
    console.log('');
    console.log('6️⃣  Run sample data insertion');
    console.log('    👉 Run: npm run insert-sample-data');
    console.log('');
    console.log('🎉 After completing these steps, your database will be ready!');
    console.log('');
    console.log('📄 Database schema location: lib/database-schema.sql');
    console.log('🌱 Sample data script: npm run insert-sample-data');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
