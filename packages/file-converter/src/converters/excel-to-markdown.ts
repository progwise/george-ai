import readXlsxFile, { readSheetNames } from 'read-excel-file/node'

// Convert Excel file to Markdown format with proper table structure
export async function transformExcelToMarkdown(excelPath: string): Promise<string> {
  try {
    const sheetNames = await readSheetNames(excelPath)
    let markdown = ''

    for (let sheetIndex = 0; sheetIndex < sheetNames.length; sheetIndex++) {
      const sheetName = sheetNames[sheetIndex]
      const rows = await readXlsxFile(excelPath, { sheet: sheetName })

      if (rows.length === 0) {
        continue
      }

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

    return markdown.trim()
  } catch (error) {
    console.error(`Error converting Excel to Markdown: ${excelPath}`, error)
    throw new Error(`Failed to convert Excel to Markdown: ${(error as Error).message}`)
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
