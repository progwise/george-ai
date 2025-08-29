import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from '@kingsword/node-html-markdown'
import fs from 'node:fs/promises'

import { ConverterResult } from './types'

export async function transformHtmlToMarkdown(htmlPath: string): Promise<ConverterResult> {
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
    }
  } catch (error) {
    console.error(`Error converting HTML to Markdown: ${htmlPath}`, error)
    throw new Error(`Failed to convert HTML to Markdown: ${(error as Error).message}`)
  }
}
