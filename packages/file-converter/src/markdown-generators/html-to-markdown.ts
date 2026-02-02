import { NodeHtmlMarkdown } from '@kingsword/node-html-markdown'
import { Readable } from 'stream'

import { workspaceStorage } from '@george-ai/file-management'

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

  const { workspaceId, libraryId, fileId } = parameters
  const sourceStream = await workspaceStorage.readSource(workspaceId, {
    libraryId,
    fileId,
  })

  // NodeHtmlMarkdown requires string input - buffer the stream
  const htmlContent = await streamToString(sourceStream)

  // Convert HTML to Markdown
  const markdown = NodeHtmlMarkdown.translate(htmlContent, {
    maxConsecutiveNewlines: 2,
  })

  const extractionWriter = await workspaceStorage.createExtraction(workspaceId, {
    libraryId,
    fileId,
    extractionMethod: 'htmlExtraction',
  })

  try {
    extractionWriter.write(markdown)
    const result = await extractionWriter.finish()
    logger.debug('[HTML Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    await extractionWriter.abort(error instanceof Error ? error : undefined)
    logger.error('[HTML Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
