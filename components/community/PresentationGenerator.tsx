import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Wand2 } from 'lucide-react'

interface PresentationGeneratorProps {
  onPresentationGenerated: () => void
}

export const PresentationGenerator: React.FC<PresentationGeneratorProps> = ({ onPresentationGenerated }) => {
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsGenerating(false)
    setTopic('')
    onPresentationGenerated()
    
    alert(`📊 Presentation generated for "${topic}"! Check your downloads folder.`)
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-800">AI Presentation Generator</h3>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Enter presentation topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          className="flex-1"
        />
        <Button 
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </div>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
