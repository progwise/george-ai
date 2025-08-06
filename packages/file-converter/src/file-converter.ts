import fs from 'node:fs/promises'

import { transformCsvToMarkdown } from './converters/csv-to-markdown'
import { transformDocxToMarkdown } from './converters/docs-to-markdown'
import { transformExcelToMarkdown } from './converters/excel-to-markdown'
import { transformHtmlToMarkdown } from './converters/html-to-markdown'
import { transformPdfToImageToMarkdown } from './converters/pdf-to-images-to-markdown'
import { transformPdfToMarkdown } from './converters/pdf-to-markdown'
import { getFileConverterOptionsList } from './file-converter-options'

export interface FileLoadParams {
  name: string
  mimeType: string
  path: string
  fileConverterOptions?: string
}

// Define supported MIME types and their descriptions
const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Microsoft Word (DOCX)',
  'application/msword': 'Microsoft Word (DOC)',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Microsoft Excel (XLSX)',
  'application/vnd.ms-excel': 'Microsoft Excel (XLS)',
  'text/csv': 'CSV File',
  'text/html': 'HTML Document',
  'text/plain': 'Plain Text',
  'text/markdown': 'Markdown',
  'application/json': 'JSON',
  'application/xml': 'XML',
  'text/xml': 'XML',
}

export async function transformToMarkdown(params: FileLoadParams): Promise<string> {
  const { name, mimeType, path: filePath, fileConverterOptions } = params
  const fileConverterOptionsList = getFileConverterOptionsList(fileConverterOptions)

  console.log('transformToMarkdown:', { name, mimeType, filePath, fileConverterOptionsList })
  try {
    switch (mimeType) {
      case 'application/pdf': {
        if (
          fileConverterOptionsList.includes('enableImageProcessing') &&
          fileConverterOptionsList.includes('enableTextExtraction')
        ) {
          const directContent = await transformPdfToMarkdown(filePath)
          const imageContent = await transformPdfToImageToMarkdown(filePath)
          return `# Text extract from PDF\n\n${directContent}\n\n---\n\n# Image interpretation\n\n${imageContent}`
        } else if (fileConverterOptionsList.includes('enableImageProcessing')) {
          return await transformPdfToImageToMarkdown(filePath)
        } else if (fileConverterOptionsList.includes('enableTextExtraction')) {
          return await transformPdfToMarkdown(filePath)
        }
        return `# PDF Content\n\nPDF processing options not set for library.`
      }

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await transformDocxToMarkdown(filePath)

      case 'application/msword':
        // Legacy .doc files not yet supported
        return `# Unsupported Format\n\nLegacy Microsoft Word (.doc) files are not yet supported.\nPlease convert to .docx format or save as PDF.`

      case 'text/csv':
        return await transformCsvToMarkdown(filePath)

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return await transformExcelToMarkdown(filePath)

      case 'application/vnd.ms-excel':
        // Legacy .xls files not yet supported
        return `# Unsupported Format\n\nLegacy Microsoft Excel (.xls) files are not yet supported.\nPlease convert to .xlsx format or save as CSV.`

      case 'text/html':
        return await transformHtmlToMarkdown(filePath)

      case 'appliction/json': {
        const content = await fs.readFile(filePath, 'utf-8')
        return `\`\`\`json\n${content}\n\`\`\``
      }
      case 'application/xml': {
        const content = await fs.readFile(filePath, 'utf-8')
        return `\`\`\`xml\n${content}\n\`\`\``
      }

      default: {
        // Try to read as text for any text-based files
        if (mimeType.startsWith('text/')) {
          const content = await fs.readFile(filePath, 'utf-8')
          return `\`\`\`xml\n${content}\n\`\`\``
        }

        // Generate helpful error message based on file type
        // Unknown file type
        console.warn(`No converter for MIME type ${mimeType} (file: ${name})`)
        return (
          `# Unsupported File Type\n\n` +
          `File: ${name}\n` +
          `MIME Type: ${mimeType}\n\n` +
          `This file type is not currently supported for markdown conversion.\n\n` +
          `Supported formats:\n` +
          Object.entries(SUPPORTED_MIME_TYPES)
            .map(([mime, desc]) => `- ${desc} (${mime})`)
            .join('\n')
        )
      }
    }
  } catch (error) {
    console.error(`Error loading and converting file ${name} from ${filePath}:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Provide more context in error messages
    return (
      `# Error Processing File\n\n` +
      `File: ${name}\n` +
      `Type: ${mimeType}\n\n` +
      `An error occurred while processing this file:\n` +
      `\`\`\`\n${errorMessage}\n\`\`\`\n\n` +
      `Please check that the file is not corrupted and is accessible.`
    )
  }
}
