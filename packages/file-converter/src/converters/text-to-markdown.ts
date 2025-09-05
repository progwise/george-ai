import fs from 'fs'

import { ConverterResult } from './types'

export const transformTextToMarkdown = async (filePath: string, mimeType: string): Promise<ConverterResult> => {
  const processingStart = Date.now()

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    // Handle different text-based file types
    let content: string
    let fileType: string

    switch (mimeType) {
      case 'text/plain':
      case 'text/markdown':
        content = await fs.promises.readFile(filePath, 'utf-8')
        fileType = mimeType === 'text/markdown' ? 'markdown' : 'plain'
        break

      case 'application/json': {
        const jsonContent = await fs.promises.readFile(filePath, 'utf-8')
        content = `\`\`\`json\n${jsonContent}\n\`\`\``
        fileType = 'json'
        break
      }

      case 'application/xml':
      case 'text/xml': {
        const xmlContent = await fs.promises.readFile(filePath, 'utf-8')
        content = `\`\`\`xml\n${xmlContent}\n\`\`\``
        fileType = 'xml'
        break
      }

      default:
        // Fallback for other text-based files
        if (mimeType.startsWith('text/')) {
          const fileContent = await fs.promises.readFile(filePath, 'utf-8')
          content = `\`\`\`\n${fileContent}\n\`\`\``
          fileType = 'text'
        } else {
          throw new Error(`Unsupported mime type for text extraction: ${mimeType}`)
        }
    }

    return {
      markdownContent: content,
      processingTimeMs: Date.now() - processingStart,
      metadata: {
        mimeType,
        fileType,
        contentLength: content.length,
      },
      timeout: false,
      partialResult: false,
      success: true,
    }
  } catch (error) {
    console.error(`Error converting text file to markdown:`, error)
    return {
      markdownContent: '',
      processingTimeMs: Date.now() - processingStart,
      notes: (error as Error).message,
      timeout: false,
      partialResult: false,
      success: false,
    }
  }
}
