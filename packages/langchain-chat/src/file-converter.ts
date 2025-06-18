import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { Document } from '@langchain/core/documents'
import fs from 'node:fs/promises'

import { ExcelLoader } from './file-loaders/excel-loader'
import { transformPdfToMarkdown } from './file-loaders/pdf-to-markdown'

//PDF to Markdown conversion with layout preservation
export async function convertPdfToMarkdown(pdfPath: string): Promise<string> {
  try {
    console.log('Converting PDF to Markdown with advanced layout preservation')
    return await transformPdfToMarkdown(pdfPath)
  } catch (error) {
    console.error(`Error converting PDF to Markdown: ${pdfPath}`, error)
    throw new Error(`Failed to convert PDF to Markdown: ${(error as Error).message}`)
  }
}

//Convert DOCX to Markdown using mammoth's direct conversion or fallback to basic extraction
export async function convertDocxToMarkdown(docxPath: string): Promise<string> {
  try {
    // Try to use mammoth for direct markdown conversion
    try {
      const mammoth = await import('mammoth')
      // @ts-expect-error - convertToMarkdown exists but not in type definitions
      const result = await mammoth.default.convertToMarkdown({ path: docxPath })
      return result.value.trim()
    } catch {
      console.warn('Mammoth not available, falling back to basic DOCX extraction')
    }

    // Fallback to basic text extraction
    const loader = new DocxLoader(docxPath)
    const documents = await loader.load()
    return convertDocumentsToMarkdown(documents)
  } catch (error) {
    console.error(`Error converting DOCX to Markdown: ${docxPath}`, error)
    throw new Error(`Failed to convert DOCX to Markdown: ${(error as Error).message}`)
  }
}

//Convert CSV to Markdown table format
export async function convertCsvToMarkdown(csvPath: string): Promise<string> {
  try {
    const loader = new CSVLoader(csvPath)
    const documents = await loader.load()

    if (documents.length === 0) {
      return ''
    }

    // Try to format as a proper markdown table
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    const lines = csvContent.trim().split('\n')

    if (lines.length === 0) {
      return ''
    }

    // Parse CSV and convert to markdown table
    const rows = lines.map((line) => {
      return line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
    })

    if (rows.length === 0) {
      return ''
    }

    let markdown = ''

    // Header row
    markdown += '| ' + rows[0].join(' | ') + ' |\n'
    markdown += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n'

    // Data rows
    for (let i = 1; i < rows.length; i++) {
      markdown += '| ' + rows[i].join(' | ') + ' |\n'
    }

    return markdown
  } catch (error) {
    console.error(`Error converting CSV to Markdown: ${csvPath}`, error)
    throw new Error(`Failed to convert CSV to Markdown: ${(error as Error).message}`)
  }
}

// Convert Excel to Markdown table format
export async function convertExcelToMarkdown(excelPath: string): Promise<string> {
  try {
    const loader = new ExcelLoader(excelPath)
    const documents = await loader.load()

    if (documents.length === 0) {
      return ''
    }

    // For Excel files, each sheet might be a separate document
    let markdown = ''

    documents.forEach((doc, index) => {
      if (index > 0) {
        markdown += '\n\n---\n\n'
      }

      if (doc.metadata.sheetName) {
        markdown += `## ${doc.metadata.sheetName}\n\n`
      }

      // Try to format content as table if it looks tabular
      const content = doc.pageContent.trim()
      const lines = content.split('\n')

      if (lines.length > 1) {
        const headers = lines[0].split('\t')
        markdown += '| ' + headers.join(' | ') + ' |\n'
        markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split('\t')
          markdown += '| ' + cells.join(' | ') + ' |\n'
        }
      } else {
        markdown += content
      }
    })

    return markdown
  } catch (error) {
    console.error(`Error converting Excel to Markdown: ${excelPath}`, error)
    throw new Error(`Failed to convert Excel to Markdown: ${(error as Error).message}`)
  }
}

export function convertDocumentsToMarkdown(documents: Document[]): string {
  return documents
    .map((doc) => doc.pageContent)
    .join('\n\n')
    .trim()
}

export interface FileLoadParams {
  id: string
  name: string
  mimeType: string
  path: string
  originUri: string
}

export async function loadFile(params: FileLoadParams): Promise<Document[]> {
  const { id, name, mimeType, path: filePath, originUri } = params

  try {
    let content: string

    switch (mimeType) {
      case 'application/pdf':
        content = await transformPdfToMarkdown(filePath)
        break

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        content = await convertDocxToMarkdown(filePath)
        break

      case 'text/csv':
        content = await convertCsvToMarkdown(filePath)
        break

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        content = await convertExcelToMarkdown(filePath)
        break

      case 'text/plain':
      case 'text/markdown':
      case 'application/json':
      case 'application/xml':
      case 'application/javascript':
      case 'text/html':
        content = await fs.readFile(filePath, 'utf-8')
        break

      default:
        // Try to read as text for any other text-based files
        if (mimeType.startsWith('text/')) {
          content = await fs.readFile(filePath, 'utf-8')
        } else {
          console.warn(`loadFile: No specific loader implemented for mimeType ${mimeType} for file ${name}`)
          return []
        }
    }

    return [
      new Document({
        pageContent: content,
        metadata: {
          source: name,
          id,
          originUri,
          mimeType: 'text/markdown',
          originalMimeType: mimeType,
        },
      }),
    ]
  } catch (error) {
    console.error(`Error loading and converting file ${name} from ${filePath}:`, error)
    return []
  }
}
