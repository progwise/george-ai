import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from '@kingsword/node-html-markdown'
import fs from 'node:fs/promises'

export async function transformHtmlToMarkdown(csvPath: string): Promise<string> {
  try {
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    const markdown = NodeHtmlMarkdown.translate(csvContent, {} as NodeHtmlMarkdownOptions)
    return markdown.trim()
  } catch (error) {
    console.error(`Error reading CSV file: ${csvPath}`, error)
    throw new Error(`Failed to read CSV file: ${(error as Error).message}`)
  }
}
