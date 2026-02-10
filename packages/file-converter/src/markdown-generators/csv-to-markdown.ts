import { parse } from 'csv-parse'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { workspaceStorage } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

async function* csvToMarkdownStream(readFileStream: Readable): AsyncGenerator<string> {
  const csvParser = parse({
    bom: true,
    relax_quotes: true,
    skip_empty_lines: true,
    trim: true,
  })

  // Pipeline handles error propagation and cleanup
  const pipelinePromise = pipeline(readFileStream, csvParser)

  let rowNumber = 0
  let headers: string[] = []

  for await (const row of csvParser) {
    if (rowNumber === 0) {
      // First row is headers
      headers = row as string[]
      logger.debug(`[CSV Converter] Headers: ${headers.join(', ')}`)
      rowNumber++
      continue
    }
    rowNumber++

    const lines: string[] = []

    // Single heading with file context
    lines.push(`# CSV Row ${rowNumber}`)
    lines.push('')

    // Table header
    lines.push('| Field | Value |')
    lines.push('|-------|-------|')

    // All columns as table rows with value in backticks
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i] || `Column ${i + 1}`
      const value = (row as string[])[i] || ''

      lines.push(`| ${header} | \`${value}\` |`)
    }

    yield lines.join('\n') + '\n'
  }

  // Ensure pipeline completed without errors
  await pipelinePromise
}

export async function csvToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[CSV Converter] Starting streaming conversion', parameters)

  const { workspaceId, libraryId, fileId } = parameters

  const { stream: readFileStream } = await workspaceStorage.readSource(workspaceId, {
    libraryId,
    fileId,
  })

  const extractionWriter = await workspaceStorage.createExtraction(workspaceId, {
    libraryId,
    fileId,
    extractionMethod: 'csvExtraction',
    splitFragmentPattern: '\n# ', // Split at each new top-level heading
  })

  try {
    for await (const chunk of csvToMarkdownStream(readFileStream)) {
      extractionWriter.write(chunk)
    }
    const extraction = await extractionWriter.finish()
    logger.debug('[CSV Converter] Conversion completed', parameters)
    return extraction
  } catch (error) {
    await extractionWriter.abort(error instanceof Error ? error : undefined)
    logger.error('[CSV Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
