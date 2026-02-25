import { parse } from 'csv-parse'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { extraction, readSource } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

function rowToMarkdown(headers: string[], row: string[], rowNumber: number): string {
  const lines: string[] = []

  lines.push(`# CSV Row ${rowNumber}`)
  lines.push('')

  // Table header
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')

  // All columns as table rows with value in backticks
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i] || `Column ${i + 1}`
    const value = row[i] || ''
    lines.push(`| ${header} | \`${value}\` |`)
  }

  return lines.join('\n') + '\n'
}

export async function csvToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[CSV Converter] Starting streaming conversion', parameters)

  const { document, timeoutSignal } = parameters

  const { stream: readFileStream } = await readSource(document)

  const extractionWriter = await extraction.create(document, 'csvExtraction')

  const csvParser = parse({
    bom: true,
    relax_quotes: true,
    skip_empty_lines: true,
    trim: true,
  })

  const pipelinePromise = pipeline(readFileStream, csvParser)

  let rowNumber = 0
  let headers: string[] = []

  try {
    for await (const row of csvParser) {
      timeoutSignal.throwIfAborted()
      if (rowNumber === 0) {
        headers = row as string[]
        logger.debug(`[CSV Converter] Headers: ${headers.join(', ')}`)
        rowNumber++
        continue
      }
      rowNumber++

      const markdown = rowToMarkdown(headers, row as string[], rowNumber)
      extractionWriter.addFragment(Readable.from(markdown))
    }

    await pipelinePromise

    // Write summary to output.md
    const summary =
      [
        `# CSV Extraction Summary`,
        ``,
        `- **Rows**: ${rowNumber - 1}`,
        `- **Columns**: ${headers.length}`,
        `- **Headers**: ${headers.join(', ')}`,
      ].join('\n') + '\n'

    await extractionWriter.write(summary)

    const extraction = await extractionWriter.ack()
    logger.debug('[CSV Converter] Conversion completed', { ...parameters, rowCount: rowNumber - 1 })
    return extraction
  } catch (error) {
    await extractionWriter.nack(error instanceof Error ? error : undefined)
    logger.error('[CSV Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
