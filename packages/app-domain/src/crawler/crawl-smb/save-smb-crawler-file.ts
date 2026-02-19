import { Readable } from 'node:stream'

import { SmbCrawlerClient } from '@george-ai/smb-crawler-client'

import { logger, saveCrawlerFile } from '../common'

export const saveSmbCrawlerFile = async ({
  workspaceId,
  fileName,
  fileUri,
  libraryId,
  crawlerId,
  mimeType,
  modificationDate,
  jobId,
  fileId,
  client,
}: {
  workspaceId: string
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  mimeType: string
  modificationDate: Date
  jobId: string
  fileId: string
  client: SmbCrawlerClient
}) => {
  // Download file from crawler service
  logger.info('Downloading file from crawler service', { fileName, fileUri })
  const webStream = await client.downloadFile(jobId, fileId)

  // Convert web ReadableStream to Node.js Readable
  const reader = webStream.getReader()
  const nodeStream = new Readable({
    async read() {
      try {
        const { done, value } = await reader.read()
        if (done) {
          this.push(null)
        } else {
          this.push(Buffer.from(value))
        }
      } catch (error) {
        logger.error('Error reading from web stream', {
          fileName,
          fileUri,
          error: error instanceof Error ? error.message : String(error),
        })
        this.destroy(error instanceof Error ? error : new Error(String(error)))
      }
    },
  })

  const result = await saveCrawlerFile({
    workspaceId,
    fileName,
    mimeType,
    content: nodeStream,
    libraryId,
    crawlerId,
    fileUri,
    modificationDate,
  })

  logger.debug('File saved from SMB crawler', { fileName, fileUri, result })

  return result
}
