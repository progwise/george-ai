import fs from 'node:fs/promises'

import { transformCsvToMarkdown } from './converters/csv-to-markdown'
import { transformDocxToMarkdown } from './converters/docs-to-markdown'
import { transformExcelToMarkdown } from './converters/excel-to-markdown'
import { transformHtmlToMarkdown } from './converters/html-to-markdown'
import { transformPdfToImageToMarkdown } from './converters/pdf-to-images-to-markdown'
import { transformPdfToMarkdown } from './converters/pdf-to-markdown'

export interface FileLoadParams {
  name: string
  mimeType: string
  path: string
}

export async function transformToMarkdown(params: FileLoadParams): Promise<string> {
  const { name, mimeType, path: filePath } = params

  try {
    switch (mimeType) {
      case 'application/pdf':
        const directContent = await transformPdfToMarkdown(filePath)
        const imageContent = await transformPdfToImageToMarkdown(filePath)
        return `# Direct Content\n\n${directContent}\n\n---\n\n# Image Content\n\n${imageContent}`

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await transformDocxToMarkdown(filePath)
      case 'text/csv':
        return await transformCsvToMarkdown(filePath)

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return await transformExcelToMarkdown(filePath)
      case 'text/html':
        return await transformHtmlToMarkdown(filePath)
      default:
        // Try to read as text for any other text-based files
        if (mimeType.startsWith('text/')) {
          return await fs.readFile(filePath, 'utf-8')
        } else {
          console.warn(`loadFile: No specific loader implemented for mimeType ${mimeType} for file ${name}`)
          return 'unsupported file type'
        }
    }
  } catch (error) {
    console.error(`Error loading and converting file ${name} from ${filePath}:`, error)
    return `Error loading file: ${(error as Error).message}`
  }
}
