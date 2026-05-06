'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FigmaAPI } from '@/lib/figma-api'

export default function FigmaImport() {
  const [figmaToken, setFigmaToken] = useState('')
  const [figmaUrl, setFigmaUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleImport = async () => {
    if (!figmaToken || !figmaUrl) return

    setLoading(true)
    try {
      // Extract file key from Figma URL
      const fileKeyMatch = figmaUrl.match(/figma\.com\/file\/([^/]+)/)
      if (!fileKeyMatch) {
        throw new Error('Invalid Figma URL')
      }

      const fileKey = fileKeyMatch[1]
      const api = new FigmaAPI(figmaToken)
      
      const fileData = await api.getFile(fileKey)
      const components = await api.getFileComponents(fileKey)
      
      setResult({
        file: fileData,
        components: components.meta.components
      })
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please check your token and URL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Figma to Code Converter</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label htmlFor="token" className="block text-sm font-medium mb-2">
            Figma Access Token
          </label>
          <Input
            id="token"
            type="password"
            placeholder="Enter your Figma access token"
            value={figmaToken}
            onChange={(e) => setFigmaToken(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            Figma File URL
          </label>
          <Input
            id="url"
            placeholder="https://www.figma.com/file/..."
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleImport} 
          disabled={loading || !figmaToken || !figmaUrl}
          className="w-full"
        >
          {loading ? 'Importing...' : 'Import from Figma'}
        </Button>
      </div>

      {result && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Import Results</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">File: {result.file.name}</h3>
              <p className="text-sm text-gray-600">
                Last modified: {new Date(result.file.lastModified).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Components ({result.components.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {result.components.map((component: any) => (
                  <div key={component.key} className="p-3 bg-white rounded border">
                    <div className="font-medium text-sm">{component.name}</div>
                    {component.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {component.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}