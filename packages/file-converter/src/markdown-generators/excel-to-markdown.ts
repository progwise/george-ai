import ExcelJS from 'exceljs'
import { Readable } from 'stream'

import { workspaceStorage } from '@george-ai/file-management'

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

async function* excelToMarkdownStream(readStream: Readable, timeoutSignal: AbortSignal): AsyncGenerator<string> {
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(readStream, {
    sharedStrings: 'cache',
    styles: 'ignore',
    hyperlinks: 'ignore',
    worksheets: 'emit',
  })

  let sheetIndex = 0

  for await (const worksheet of workbookReader) {
    if (timeoutSignal.aborted) {
      logger.warn('[Excel Converter] Conversion aborted due to timeout')
      return
    }

    const sheetName = `Sheet${sheetIndex + 1}`
    let rowIndex = 0
    let headers: string[] = []

    for await (const row of worksheet) {
      if (timeoutSignal.aborted) {
        return
      }

      // Get cell values
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
        // First row is headers
        headers = cells
        logger.debug('[Excel Converter] Headers', { sheetName, headers })
        rowIndex++
        continue
      }

      // Build markdown for this row (same format as CSV)
      const lines: string[] = []

      // Single heading with sheet and row context
      lines.push(`# ${sheetName} Row ${rowIndex + 1}`)
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

      yield lines.join('\n') + '\n'

      rowIndex++
    }

    sheetIndex++
  }
}

export async function excelToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[Excel Converter] Starting streaming conversion', parameters)

  const { workspaceId, libraryId, fileId, timeoutSignal } = parameters

  const { stream: readStream } = await workspaceStorage.readSource(workspaceId, {
    libraryId,
    fileId,
  })

  const extractionWriter = await workspaceStorage.createExtraction(workspaceId, {
    libraryId,
    fileId,
    extractionMethod: 'excelExtraction',
    splitFragmentPattern: '\n# ', // Split at each new top-level heading
  })

  try {
    for await (const chunk of excelToMarkdownStream(readStream, timeoutSignal)) {
      extractionWriter.write(chunk)
    }
    const result = await extractionWriter.finish()
    logger.debug('[Excel Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    await extractionWriter.abort(error instanceof Error ? error : undefined)
    logger.error('[Excel Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
