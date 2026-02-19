import { pipeline } from 'node:stream/promises'

import { document, extraction } from '@george-ai/file-management'

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

  const { workspaceId, libraryId, documentId, mimeType } = parameters
  const fileManifest = await document.get(workspaceId, {
    libraryId,
    documentId,
  })
  const { stream: sourceStream } = await document.readSource(workspaceId, {
    libraryId,
    documentId,
  })

  const writer = await extraction.create(fileManifest, 'textExtraction')

  try {
    await pipeline(textParser(sourceStream, { mimeType }), async function (source) {
      for await (const chunk of source) {
        await writer.write(chunk)
      }
    })

    const result = await writer.ack()
    logger.debug('[Text Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    logger.error('[Text Converter] Conversion failed', { ...parameters, error })
    await writer.nack(error instanceof Error ? error : undefined)
    throw error
  }
}
