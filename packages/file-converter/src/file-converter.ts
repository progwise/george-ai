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

export interface FileConversionResult {
  content: string
  issues?: {
    endlessLoop?: boolean
    timeout?: boolean
    partialResult?: boolean
    unsupportedFormat?: boolean
    conversionError?: boolean
    legacyFormat?: boolean
  }
  metadata?: {
    mimeType?: string
    fileName?: string
    processingMethod?: string
    totalPages?: number
    processedPages?: number
    errorPages?: number
    processingTime?: number
    pageResults?: Array<{
      page: number
      success: boolean
      issues?: {
        endlessLoop?: boolean
        timeout?: boolean
        partialResult?: boolean
      }
    }>
    suggestedFormats?: string[]
    supportedFormats?: string[]
    errorMessage?: string
    errorStack?: string
    errorType?: string
    filePath?: string
    [key: string]: unknown
  }
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

export async function transformToMarkdown(params: FileLoadParams): Promise<FileConversionResult> {
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
          const imageResult = await transformPdfToImageToMarkdown(filePath, 3.0, fileConverterOptions)

          return {
            content: `# Text extract from PDF\n\n${directContent}\n\n---\n\n# Image interpretation\n\n${imageResult.content}`,
            issues: imageResult.issues,
            metadata: {
              ...imageResult.metadata,
              processingMethod: 'text_and_image',
            },
          }
        } else if (fileConverterOptionsList.includes('enableImageProcessing')) {
          const result = await transformPdfToImageToMarkdown(filePath, 3.0, fileConverterOptions)
          return {
            content: result.content,
            issues: result.issues,
            metadata: {
              ...result.metadata,
              processingMethod: 'image_only',
            },
          }
        } else if (fileConverterOptionsList.includes('enableTextExtraction')) {
          const content = await transformPdfToMarkdown(filePath)
          return {
            content,
            metadata: {
              processingMethod: 'text_only',
            },
          }
        }
        return {
          content: `# PDF Content\n\nPDF processing options not set for library.`,
          metadata: {
            processingMethod: 'none',
          },
        }
      }

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const content = await transformDocxToMarkdown(filePath)
        return {
          content,
          metadata: {
            mimeType,
            fileName: name,
            processingMethod: 'docx_converter',
          },
        }
      }

      case 'application/msword':
        // Legacy .doc files not yet supported
        return {
          content: `# Legacy Format Not Supported\n\nLegacy Microsoft Word (.doc) files are not yet supported.\nPlease convert to .docx format or save as PDF.`,
          issues: {
            legacyFormat: true,
          },
          metadata: {
            mimeType,
            fileName: name,
            suggestedFormats: [
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/pdf',
            ],
          },
        }

      case 'text/csv': {
        const content = await transformCsvToMarkdown(filePath)
        return {
          content,
          metadata: {
            mimeType,
            fileName: name,
            processingMethod: 'csv_converter',
          },
        }
      }

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        const content = await transformExcelToMarkdown(filePath)
        return { content }
      }

      case 'application/vnd.ms-excel':
        // Legacy .xls files not yet supported
        return {
          content: `# Legacy Format Not Supported\n\nLegacy Microsoft Excel (.xls) files are not yet supported.\nPlease convert to .xlsx format or save as CSV.`,
          issues: {
            legacyFormat: true,
          },
          metadata: {
            mimeType,
            fileName: name,
            suggestedFormats: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
          },
        }

      case 'text/html': {
        const content = await transformHtmlToMarkdown(filePath)
        return { content }
      }

      case 'text/markdown': {
        const content = await fs.readFile(filePath, 'utf-8')
        return { content }
      }

      case 'appliction/json': {
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const content = `\`\`\`json\n${fileContent}\n\`\`\``
        return { content }
      }
      case 'application/xml': {
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const content = `\`\`\`xml\n${fileContent}\n\`\`\``
        return { content }
      }

      default: {
        // Try to read as text for any text-based files
        if (mimeType.startsWith('text/')) {
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const content = `\`\`\`\n${fileContent}\n\`\`\``
          return {
            content,
            metadata: {
              mimeType,
              fileName: name,
              processingMethod: 'text_fallback',
            },
          }
        }

        // Generate helpful error message based on file type
        // Unknown file type
        console.warn(`No converter for MIME type ${mimeType} (file: ${name})`)
        const content =
          `# Unsupported File Type\n\n` +
          `File: ${name}\n` +
          `MIME Type: ${mimeType}\n\n` +
          `This file type is not currently supported for markdown conversion.\n\n` +
          `Supported formats:\n` +
          Object.entries(SUPPORTED_MIME_TYPES)
            .map(([mime, desc]) => `- ${desc} (${mime})`)
            .join('\n')

        return {
          content,
          issues: {
            unsupportedFormat: true,
          },
          metadata: {
            mimeType,
            fileName: name,
            supportedFormats: Object.keys(SUPPORTED_MIME_TYPES),
          },
        }
      }
    }
  } catch (error) {
    console.error(`Error loading and converting file ${name} from ${filePath}:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // Provide structured error information
    const content =
      `# Error Processing File\n\n` +
      `File: ${name}\n` +
      `Type: ${mimeType}\n\n` +
      `An error occurred while processing this file:\n` +
      `\`\`\`\n${errorMessage}\n\`\`\`\n\n` +
      `Please check that the file is not corrupted and is accessible.`

    return {
      content,
      issues: {
        conversionError: true,
      },
      metadata: {
        mimeType,
        fileName: name,
        filePath,
        errorMessage,
        errorStack,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      },
    }
  }
}
