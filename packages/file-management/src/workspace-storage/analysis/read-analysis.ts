import { createReadStream } from 'fs'
import { Readable } from 'stream'

import { getFilePath } from '../../file-system'
import { fs, getUri } from '../commons'
import { logger } from '../commons'
import { getAnalysesFolderPath, getEntry } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'

export async function readAnalysis(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  analysisFileName: string,
): Promise<{ stream: Readable; size: number; mimeType: string }> {
  const parent = await getEntry(identifier)
  if (!parent) {
    logger.error('Entry does not exist', {
      ...identifier,
      analysisFileName,
    })
    throw new Error(`Cannot read analysis. Entry does not exist for: ${getUri(identifier)}.`)
  }
  const analysisDir = getAnalysesFolderPath(identifier)
  const analysisFilePath = getFilePath(analysisDir, analysisFileName)

  const analysisStats = await fs.getFileStats(analysisFilePath) // Ensure attachments directory exists before trying to read the file
  if (!analysisStats) {
    logger.error('Analysis directory does not exist for entry', {
      ...identifier,
      analysisFileName,
      analysisDir,
      analysisFilePath,
    })
    throw new Error(
      `Cannot read analysis. Analysis directory does not exist for the entry: ${getUri(identifier)}. Analysis file name: ${analysisFileName}`,
    )
  }
  const stream = createReadStream(analysisFilePath)
  return { stream, size: analysisStats.diskSize, mimeType: 'text/markdown' }
}
