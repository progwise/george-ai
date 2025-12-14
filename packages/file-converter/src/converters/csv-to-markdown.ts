import { parse } from 'csv-parse'
import { createReadStream, existsSync, promises as fs } from 'fs'
import path from 'path'

import { deleteExistingExtraction, getFileDir, saveMarkdownContent } from '@george-ai/file-management'

import type { ConverterResult } from './types'

/**
 * CSV to Markdown Converter (Streaming, Bucketed Parts)
 *
 * Converts CSV files to individual markdown files per row using bucketed storage.
 * Uses streaming to handle large files (700K+ rows) without loading into memory.
 *
 * Features:
 * - Streaming processing (~1KB memory per row constant)
 * - One markdown file per row (as a "part")
 * - Bucketed file storage (100 files per directory)
 * - Metadata caching for fast pagination
 * - Headings format (handles HTML content in cells)
 *
 * For 732K row CSV:
 * - Memory usage: ~1KB (constant)
 * - Output: 732K parts in bucketed directories
 */

/**
 * Generate markdown content for a single row
 * Uses headings format instead of table (handles HTML/code in cells)
 *
 * Example output:
 * ```
 * # CSV Row 123
 *
 * **Source File:** products.csv
 * **Row Number:** 123 of 30,000
 * **Extracted:** 2025-12-14 11:30:45
 *
 * ---
 *
 * ## Product Name
 * Widget XL-2000
 *
 * ## Description
 * ```html
 * <p>Premium widget with <strong>advanced</strong> features</p>
 * ```
 * ```
 */
function generateRowMarkdown(
  headers: string[],
  row: string[],
  rowNumber: number,
  fileName: string,
  totalRows?: number,
): string {
  const sections: string[] = []

  // Add metadata header
  sections.push(`# CSV Row ${rowNumber}`)
  sections.push('')
  sections.push(`**Source File:** ${fileName}`)
  sections.push(`**Row Number:** ${rowNumber.toLocaleString()}${totalRows ? ` of ${totalRows.toLocaleString()}` : ''}`)
  sections.push(`**Extracted:** ${new Date().toLocaleString()}`)
  sections.push('')
  sections.push('---')
  sections.push('')

  // Add row data
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || `Column ${i + 1}`
    const value = row[i] || ''

    // Detect HTML content
    const hasHtml = /<[^>]+>/.test(value)

    // Detect code-like content (curly braces, brackets)
    const hasCode = /[{}[\]]/.test(value) && value.length > 20

    sections.push(`## ${header}`)

    if (hasHtml) {
      sections.push('```html')
      sections.push(value)
      sections.push('```')
    } else if (hasCode) {
      sections.push('```')
      sections.push(value)
      sections.push('```')
    } else {
      sections.push(value)
    }

    sections.push('') // Empty line between sections
  }

  return sections.join('\n')
}

/**
 * Transform CSV to per-row markdown files (streaming)
 *
 * CRITICAL: Never loads entire CSV into memory - processes row by row
 *
 * Uses new bucketed storage system with:
 * - extractionMethod: 'csv-extraction'
 * - extractionMethodParameter: null
 * - part: row number (1, 2, 3, ...)
 *
 * Memory Usage:
 * - Constant ~1KB per row (regardless of file size)
 * - 68MB CSV → ~1KB memory (not 68MB!)
 *
 * @param csvPath - Path to CSV file
 * @param timeoutSignal - Abort signal (unused for streaming, kept for interface compatibility)
 * @param libraryId - Library ID (for determining file directory)
 * @param fileId - File ID (for determining file directory)
 * @param fileName - Original file name
 * @returns Standard ConverterResult with metadata about per-row processing
 */
export async function transformCsvToMarkdown(
  csvPath: string,
  _timeoutSignal: AbortSignal,
  libraryId: string,
  fileId: string,
  fileName: string,
): Promise<ConverterResult> {
  const processingStart = Date.now()

  console.log(`[CSV Converter] Starting streaming conversion: ${fileName}`)
  console.log(`[CSV Converter] Source: ${csvPath}`)

  // Delete any existing CSV extraction before starting (avoid appending to old data)
  await deleteExistingExtraction({
    fileId,
    libraryId,
    extractionMethod: 'csv-extraction',
    extractionMethodParameter: undefined,
  })

  // Streaming CSV parser
  const readStream = createReadStream(csvPath)
  const parser = readStream.pipe(
    parse({
      bom: true,
      relax_quotes: true,
      skip_empty_lines: true,
      trim: true,
    }),
  )

  // Handle read stream errors
  readStream.on('error', (error) => {
    console.error(`[CSV Converter] Read stream error:`, error)
    parser.destroy(error)
  })

  let headers: string[] = []
  let rowNumber = 0
  let lastProcessedRow = 0
  let currentProcessing: Promise<void> | null = null

  return new Promise((resolve, reject) => {
    parser.on('data', (record: string[]) => {
      rowNumber++

      // First row is headers
      if (rowNumber === 1) {
        headers = record
        console.log(`[CSV Converter] Headers: ${headers.join(', ')}`)
        return
      }

      // Pause stream while processing row (backpressure)
      parser.pause()

      // Process asynchronously but don't await in the event handler
      // Track the promise to ensure 'end' waits for the last row
      currentProcessing = (async () => {
        try {
          // Generate markdown for this row (totalRows is undefined during streaming)
          const rowMarkdown = generateRowMarkdown(headers, record, rowNumber - 1, fileName)

          // Save to bucketed file using new architecture
          // Part numbers start at 1 (row 2 in CSV = part 1, since row 1 is headers)
          await saveMarkdownContent({
            fileId,
            libraryId,
            extractionMethod: 'csv-extraction',
            extractionMethodParameter: undefined,
            markdown: rowMarkdown,
            part: rowNumber - 1, // rowNumber-1 because row 1 is headers
          })

          lastProcessedRow = rowNumber - 1

          // Log progress every 1000 rows
          if (lastProcessedRow % 1000 === 0) {
            console.log(`[CSV Converter] Processed ${lastProcessedRow.toLocaleString()} rows`)
          }

          // Resume stream after processing completes
          parser.resume()
        } catch (error) {
          console.error(`[CSV Converter] Error processing row ${rowNumber}:`, error)
          parser.destroy(error as Error)
        }
      })()
    })

    parser.on('end', async () => {
      try {
        // Wait for the last row to finish processing
        if (currentProcessing) {
          await currentProcessing
        }

        const totalRows = lastProcessedRow

        console.log(`[CSV Converter] Finished processing ${totalRows.toLocaleString()} rows`)

        // Read the final main.md file that was created during bucketed saves
        const fileDir = getFileDir({ fileId, libraryId })
        const mainFilePath = path.join(fileDir, 'csv-extraction.md')

        let finalMarkdownContent = ''
        if (existsSync(mainFilePath)) {
          finalMarkdownContent = await fs.readFile(mainFilePath, 'utf-8')
        } else {
          console.warn(`[CSV Converter] Main markdown file not found at ${mainFilePath}`)
        }

        resolve({
          markdownContent: finalMarkdownContent,
          processingTimeMs: Date.now() - processingStart,
          notes: `Processed ${totalRows.toLocaleString()} rows into ${totalRows} bucketed parts`,
          metadata: {
            processingMethod: 'csv-extraction',
            rowCount: totalRows,
            headers,
          },
          timeout: false,
          partialResult: false,
          success: true,
        })
      } catch (error) {
        reject(error)
      }
    })

    parser.on('error', (error) => {
      console.error(`[CSV Converter] Stream error:`, error)
      reject(error)
    })
  })
}
