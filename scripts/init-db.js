const { initializeDatabase, checkDatabaseStatus } = require('../lib/database-init.ts')

async function main() {
  console.log('🔍 Checking database status...')
  
  try {
    // Check if database is already initialized
    const status = await checkDatabaseStatus()
    
    if (status.initialized) {
      console.log('✅ Database is already initialized!')
      return
    }
    
    console.log('📊 Database not initialized, starting setup...')
    await initializeDatabase()
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    process.exit(1)
  }
}

main()
