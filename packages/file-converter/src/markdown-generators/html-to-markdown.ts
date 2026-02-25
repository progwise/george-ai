import { NodeHtmlMarkdown } from '@kingsword/node-html-markdown'
import { Readable } from 'stream'

import { extraction, readSource } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks).toString('utf-8')
}

export async function htmlToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[HTML Converter] Starting conversion', parameters)

  const { document, timeoutSignal } = parameters
  const { stream: sourceStream } = await readSource(document)

  // NodeHtmlMarkdown requires string input - buffer the stream
  const htmlContent = await streamToString(sourceStream)

  timeoutSignal.throwIfAborted()
  // Convert HTML to Markdown
  const markdown = NodeHtmlMarkdown.translate(htmlContent, {
    maxConsecutiveNewlines: 2,
  })

  const extractionWriter = await extraction.create(document, 'htmlExtraction')

  try {
    timeoutSignal.throwIfAborted()
    await extractionWriter.write(markdown)
    timeoutSignal.throwIfAborted()
    const result = await extractionWriter.ack()
    logger.debug('[HTML Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    await extractionWriter.nack(error instanceof Error ? error : undefined)
    logger.error('[HTML Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
