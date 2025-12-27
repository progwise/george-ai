import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from '@kingsword/node-html-markdown'
import fs from 'node:fs/promises'

import { FileConverterResult } from './types'

export async function transformHtmlToMarkdown(htmlPath: string): Promise<FileConverterResult> {
  const processingStart = Date.now()

  try {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8')
    const markdown = NodeHtmlMarkdown.translate(htmlContent, {} as NodeHtmlMarkdownOptions)

    return {
      markdownContent: markdown.trim(),
      processingTimeMs: Date.now() - processingStart,
      metadata: {
        originalLength: htmlContent.length,
      },
      timeout: false,
      partialResult: false,
      success: true,
    }
  } catch (error) {
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
