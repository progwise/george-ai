import { pipeline } from 'node:stream/promises'

import { extraction, readSource } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

async function* textParser(
  source: AsyncIterable<Buffer<ArrayBufferLike>>,
  options: { mimeType: string },
): AsyncGenerator<string> {
  const { mimeType } = options
  switch (mimeType) {
    case 'application/json':
      yield '```json\n'
      for await (const chunk of source) {
        yield chunk.toString('utf-8')
      }
      yield '\n```\n'
      break
    case 'application/xml':
    case 'text/xml':
      yield '```xml\n'
      for await (const chunk of source) {
        yield chunk.toString('utf-8')
      }
      yield '\n```\n'
      break
    default:
      for await (const chunk of source) {
        yield chunk.toString('utf-8')
      }
  }
}

export const textToMarkdown = async (parameters: FileConverterParameters) => {
  logger.debug('[Text Converter] Starting conversion', parameters)

  const { document, timeoutSignal } = parameters

  const { stream: sourceStream } = await readSource(document)

  const writer = await extraction.create(document, 'textExtraction')

  try {
    await pipeline(textParser(sourceStream, { mimeType: document.mimeType }), async function (source) {
      for await (const chunk of source) {
        timeoutSignal.throwIfAborted()
        await writer.write(chunk)
      }
    })

    timeoutSignal.throwIfAborted()
    const result = await writer.ack()
    logger.debug('[Text Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    logger.error('[Text Converter] Conversion failed', { parameters, error })
    await writer.nack(error instanceof Error ? error : undefined)
    throw error
  }
}
