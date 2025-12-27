import readXlsxFile, { readSheetNames } from 'read-excel-file/node'

import { FileConverterResult } from './types'

// Convert Excel file to Markdown format with proper table structure
export async function transformExcelToMarkdown(
  excelPath: string,
  timeoutSignal: AbortSignal,
): Promise<FileConverterResult> {
  const processingStart = Date.now()

  try {
    const sheetNames = await readSheetNames(excelPath)
    let markdown = ''
    let totalRows = 0
    let totalCells = 0

    for (let sheetIndex = 0; sheetIndex < sheetNames.length; sheetIndex++) {
      if (timeoutSignal.aborted) {
        console.error(`❌ Excel to Markdown conversion aborted due to timeout`)
        return {
          markdownContent: markdown,
          processingTimeMs: Date.now() - processingStart,
          metadata: {
            sheets: sheetNames.length,
            totalRows,
            totalCells,
          },
          timeout: true,
          partialResult: true,
          success: false,
        }
      }
      const sheetName = sheetNames[sheetIndex]
      const rows = await readXlsxFile(excelPath, { sheet: sheetName })

      if (rows.length === 0) {
        continue
      }

      totalRows += rows.length
      totalCells += rows.reduce((acc, row) => acc + row.length, 0)

      // Add sheet separator for multiple sheets
      if (sheetIndex > 0) {
        markdown += '\n\n---\n\n'
      }

      // Add sheet name as heading
      markdown += `## ${sheetName}\n\n`

      // Convert rows to markdown table
      const tableMarkdown = convertRowsToMarkdownTable(rows)
      markdown += tableMarkdown
    }

    return {
      markdownContent: markdown.trim(),
      processingTimeMs: Date.now() - processingStart,
      metadata: {
        sheets: sheetNames.length,
        totalRows,
        totalCells,
      },
      timeout: false,
      partialResult: false,
      success: true,
    }
  } catch (error) {
    console.error(`Error converting Excel to Markdown: ${excelPath}`, error)
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

function convertRowsToMarkdownTable(rows: unknown[][]): string {
  if (rows.length === 0) {
    return ''
  }

  let markdown = ''

  // Process header row
  const headers = rows[0].map((cell) => formatCellValue(cell))
  markdown += '| ' + headers.map((h) => escapeTableCell(h)).join(' | ') + ' |\n'
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const cells = row.map((cell) => formatCellValue(cell))

    // Ensure same number of cells as headers
    while (cells.length < headers.length) {
      cells.push('')
    }

    markdown += '| ' + cells.map((c) => escapeTableCell(c)).join(' | ') + ' |\n'
  }

  return markdown
}

function formatCellValue(cell: unknown): string {
  if (cell === null || cell === undefined) {
    return ''
  }

  if (cell instanceof Date) {
    return cell.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }

  if (typeof cell === 'number') {
    // Check if it's a whole number or decimal
    if (Number.isInteger(cell)) {
      return cell.toString()
    } else {
      // Limit decimal places to avoid floating point issues
      return cell.toFixed(2).replace(/\.?0+$/, '')
    }
  }

  return String(cell).trim()
}

function escapeTableCell(content: string): string {
  // Escape pipe characters and newlines for markdown tables
  return content.replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\r/g, '')
}
