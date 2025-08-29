import mammoth from 'mammoth'

import { ConverterResult } from './types'

export async function transformDocxToMarkdown(docxPath: string): Promise<ConverterResult> {
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
    }
  } catch (error) {
    console.error(`Error converting DOCX to Markdown: ${docxPath}`, error)
    throw new Error(`Failed to convert DOCX to Markdown: ${(error as Error).message}`)
  }
}
