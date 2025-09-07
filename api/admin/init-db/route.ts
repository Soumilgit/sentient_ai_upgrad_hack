import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, checkDatabaseStatus } from '@/lib/database-init'

export async function POST(request: NextRequest) {
  try {
    // Check if database is already initialized
    const status = await checkDatabaseStatus()
    
    if (status.initialized) {
      return NextResponse.json({
        success: true,
        message: 'Database is already initialized',
        alreadyInitialized: true
      })
    }
    
    // Initialize the database
    const result = await initializeDatabase()
    
    return NextResponse.json({
      ...result,
      message: result.message || 'Database initialized successfully'
    })
    
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = await checkDatabaseStatus()
    
    return NextResponse.json({
      success: true,
      ...status
    })
    
  } catch (error) {
    console.error('Database status check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
