import { parse } from 'csv-parse/sync'
import fs from 'node:fs/promises'

import { ConverterResult } from './types'

//Convert CSV to Markdown table format
export async function transformCsvToMarkdown(csvPath: string, timeoutSignal: AbortSignal): Promise<ConverterResult> {
  const processingStart = Date.now()
  try {
    const csvContent = await fs.readFile(csvPath, 'utf-8')

    // Use csv-parse for proper CSV parsing
    const records = parse(csvContent, {
      bom: true,
      relax_quotes: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (records.length === 0) {
      return {
        markdownContent: '',
        metadata: {
          processingMethod: 'csv-extraction',
          totalRows: 0,
          totalCols: 0,
        },
        notes: 'CSV file is empty or contains no valid rows',
        partialResult: false,
        timeout: false,
        processingTimeMs: Date.now() - processingStart,
        success: true,
      }
    }

    let markdown = ''
    let totalCols = 0

    // Header row
    if (records[0] && Array.isArray(records[0])) {
      const headers = records[0] as string[]
      totalCols = headers.length
      markdown += '| ' + headers.map((h) => h.replace(/\|/g, '\\|')).join(' | ') + ' |\n'
      markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'

      // Data rows
      for (let i = 1; i < records.length; i++) {
        if (timeoutSignal.aborted) {
          console.error(`❌ CSV to Markdown conversion aborted due to timeout`)
          return {
            markdownContent: markdown.trim(),
            metadata: {
              totalRows: i,
              totalCols,
            },
            notes: 'Operation aborted due to timeout',
            partialResult: true,
            timeout: true,
            processingTimeMs: Date.now() - processingStart,
            success: false,
          }
        }
        const row = records[i] as string[]
        // Ensure same number of cells as headers
        while (row.length < headers.length) {
          row.push('')
        }
        markdown += '| ' + row.map((cell) => (cell || '').replace(/\|/g, '\\|')).join(' | ') + ' |\n'
      }
    }

    return {
      markdownContent: markdown.trim(),
      metadata: {
        totalRows: records.length,
        totalCols,
      },
      notes: undefined,
      partialResult: false,
      timeout: false,
      processingTimeMs: Date.now() - processingStart,
      success: true,
    }
  } catch (error) {
    console.error(`Error converting CSV to Markdown: ${csvPath}`, error)
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
