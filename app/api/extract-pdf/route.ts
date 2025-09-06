import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from PDF
    const data = await pdf(buffer)
    const extractedText = data.text.trim()

    if (extractedText && extractedText.length > 0) {
      return NextResponse.json({ 
        success: true, 
        textContent: extractedText,
        pageCount: data.numpages,
        info: data.info
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'PDF content could not be extracted. The PDF might be image-based or encrypted.' 
      })
    }

  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to extract PDF content' 
    }, { status: 500 })
  }
}
