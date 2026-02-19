import { NodeHtmlMarkdown } from '@kingsword/node-html-markdown'
import { Readable } from 'stream'

import { document, extraction } from '@george-ai/file-management'

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

  const { workspaceId, libraryId, documentId } = parameters

  const fileManifest = await document.get(workspaceId, {
    libraryId,
    documentId,
  })
  const { stream: sourceStream } = await document.readSource(workspaceId, {
    libraryId,
    documentId,
  })

  // NodeHtmlMarkdown requires string input - buffer the stream
  const htmlContent = await streamToString(sourceStream)

  // Convert HTML to Markdown
  const markdown = NodeHtmlMarkdown.translate(htmlContent, {
    maxConsecutiveNewlines: 2,
  })

  const extractionWriter = await extraction.create(fileManifest, 'htmlExtraction')

  try {
    await extractionWriter.write(markdown)
    const result = await extractionWriter.ack()
    logger.debug('[HTML Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    await extractionWriter.nack(error instanceof Error ? error : undefined)
    logger.error('[HTML Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
