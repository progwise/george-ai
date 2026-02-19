import ExcelJS from 'exceljs'
import { Readable } from 'stream'

import { document, extraction } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

function formatCellValue(cell: ExcelJS.Cell): string {
  const value = cell.value

  if (value === null || value === undefined) {
    return ''
  }

  // Handle rich text
  if (typeof value === 'object' && 'richText' in value) {
    return value.richText.map((rt) => rt.text).join('')
  }

  // Handle formula results
  if (typeof value === 'object' && 'result' in value) {
    return formatPrimitiveValue(value.result)
  }

  // Handle hyperlinks
  if (typeof value === 'object' && 'hyperlink' in value) {
    return value.text?.toString() || ''
  }

  // Handle error values
  if (typeof value === 'object' && 'error' in value) {
    return ''
  }

  return formatPrimitiveValue(value)
}

function formatPrimitiveValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value.toString()
    } else {
      return value.toFixed(2).replace(/\.?0+$/, '')
    }
  }

  return String(value).trim()
}

function rowToMarkdown(headers: string[], cells: string[], sheetName: string, rowNumber: number): string {
  const lines: string[] = []

  lines.push(`# ${sheetName} Row ${rowNumber}`)
  lines.push('')

  // Table header
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')

  // All columns as table rows with value in backticks
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || `Column ${i + 1}`
    const value = cells[i] || ''
    lines.push(`| ${header} | \`${value}\` |`)
  }

  return lines.join('\n') + '\n'
}

export async function excelToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[Excel Converter] Starting streaming conversion', parameters)

  const { workspaceId, libraryId, documentId, timeoutSignal } = parameters

  const fileManifest = await document.get(workspaceId, {
    libraryId,
    documentId,
  })

  const { stream: readStream } = await document.readSource(workspaceId, {
    libraryId,
    documentId,
  })

  const extractionWriter = await extraction.create(fileManifest, 'excelExtraction')

  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(readStream, {
    sharedStrings: 'cache',
    styles: 'ignore',
    hyperlinks: 'ignore',
    worksheets: 'emit',
  })

  const sheetStats: { name: string; headers: string[]; rowCount: number }[] = []

  try {
    let sheetIndex = 0

    for await (const worksheet of workbookReader) {
      if (timeoutSignal.aborted) {
        logger.warn('[Excel Converter] Conversion aborted due to timeout')
        break
      }

      const sheetName = `Sheet${sheetIndex + 1}`
      let rowIndex = 0
      let headers: string[] = []
      let dataRowCount = 0

      for await (const row of worksheet) {
        if (timeoutSignal.aborted) {
          break
        }

        const cells: string[] = []
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          while (cells.length < colNumber - 1) {
            cells.push('')
          }
          cells[colNumber - 1] = formatCellValue(cell)
        })

        if (cells.length === 0) {
          rowIndex++
          continue
        }

        if (rowIndex === 0) {
          headers = cells
          logger.debug('[Excel Converter] Headers', { sheetName, headers })
          rowIndex++
          continue
        }

        const markdown = rowToMarkdown(headers, cells, sheetName, rowIndex + 1)
        extractionWriter.addFragment(Readable.from(markdown))
        dataRowCount++

        rowIndex++
      }

      sheetStats.push({ name: sheetName, headers, rowCount: dataRowCount })
      sheetIndex++
    }

    // Write summary to output.md
    const totalRows = sheetStats.reduce((sum, s) => sum + s.rowCount, 0)
    const summaryLines = [
      `# Excel Extraction Summary`,
      ``,
      `- **Sheets**: ${sheetStats.length}`,
      `- **Total Rows**: ${totalRows}`,
    ]

    for (const sheet of sheetStats) {
      summaryLines.push(``)
      summaryLines.push(`## ${sheet.name}`)
      summaryLines.push(`- **Rows**: ${sheet.rowCount}`)
      summaryLines.push(`- **Columns**: ${sheet.headers.length}`)
      summaryLines.push(`- **Headers**: ${sheet.headers.join(', ')}`)
    }

    await extractionWriter.write(summaryLines.join('\n') + '\n')

    const result = await extractionWriter.ack()
    logger.debug('[Excel Converter] Conversion completed', { ...parameters, totalRows, sheets: sheetStats.length })
    return result
  } catch (error) {
    await extractionWriter.nack(error instanceof Error ? error : undefined)
    logger.error('[Excel Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
