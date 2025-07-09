import fs from 'node:fs/promises'

import { transformCsvToMarkdown } from './converters/csv-to-markdown'
import { transformDocxToMarkdown } from './converters/docs-to-markdown'
import { transformExcelToMarkdown } from './converters/excel-to-markdown'
import { transformHtmlToMarkdown } from './converters/html-to-markdown'
import { transformPdfToMarkdown } from './converters/pdf-to-markdown'

export interface FileLoadParams {
  name: string
  mimeType: string
  path: string
}

export async function transformToMarkdown(params: FileLoadParams): Promise<string> {
  const { name, mimeType, path: filePath } = params

  try {
    let content: string

    switch (mimeType) {
      case 'application/pdf':
        content = await transformPdfToMarkdown(filePath)
        break

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        content = await transformDocxToMarkdown(filePath)
        break

      case 'text/csv':
        content = await transformCsvToMarkdown(filePath)
        break

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        content = await transformExcelToMarkdown(filePath)
        break
      case 'text/html':
        content = await transformHtmlToMarkdown(filePath)
        break
      default:
        // Try to read as text for any other text-based files
        if (mimeType.startsWith('text/')) {
          content = await fs.readFile(filePath, 'utf-8')
        } else {
          console.warn(`loadFile: No specific loader implemented for mimeType ${mimeType} for file ${name}`)
          content = 'unsupported file type'
        }
    }

    return content
  } catch (error) {
    console.error(`Error loading and converting file ${name} from ${filePath}:`, error)
    return `Error loading file: ${(error as Error).message}`
  }
}
