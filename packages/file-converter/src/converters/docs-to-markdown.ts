import mammoth from 'mammoth'

import { FileConverterResult } from './types'

export async function transformDocxToMarkdown(docxPath: string): Promise<FileConverterResult> {
  const processingStart = Date.now()

  try {
    // @ts-expect-error - convertToMarkdown exists but not in type definitions
    const result = await mammoth.convertToMarkdown({ path: docxPath })
    const markdownContent = result.value.trim()

    return {
      markdownContent,
      processingTimeMs: Date.now() - processingStart,
      metadata: {
        messages: result.messages,
      },
      timeout: false,
      partialResult: false,
      success: true,
    }
  } catch (error) {
    console.error(`Error converting DOCX to Markdown: ${docxPath}`, error)
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
