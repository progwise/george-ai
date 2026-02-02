import { pipeline } from 'node:stream/promises'

import { workspaceStorage } from '@george-ai/file-management'

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

  const { workspaceId, libraryId, fileId, mimeType } = parameters
  const sourceStream = await workspaceStorage.readSource(workspaceId, {
    libraryId,
    fileId,
  })

  const writer = await workspaceStorage.createExtraction(parameters.workspaceId, {
    libraryId: parameters.libraryId,
    fileId: parameters.fileId,
    extractionMethod: 'textExtraction',
  })

  try {
    await pipeline(textParser(sourceStream, { mimeType }), async function (source) {
      for await (const chunk of source) {
        writer.write(chunk)
      }
    })

    const result = await writer.finish()
    logger.debug('[Text Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    logger.error('[Text Converter] Conversion failed', { ...parameters, error })
    await writer.abort(error instanceof Error ? error : undefined)
    throw error
  }
}
