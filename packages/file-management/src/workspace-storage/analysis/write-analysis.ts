import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { fs, logger } from '../commons'
import { getAnalysesFolderPath, getEntry, saveEntry } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { Analysis } from '../schema/manifest/analysis-schema'
import { updateStats } from '../storage-stats'

export async function writeAnalysis(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  parameters: {
    sourceFileUri: string
    sourceFileName: string
    sourceFileMimeType: string
    stream: Readable
  },
): Promise<Analysis> {
  const analysisDir = getAnalysesFolderPath(identifier)
  await mkdir(analysisDir, { recursive: true })

  const { sourceFileUri, sourceFileName, sourceFileMimeType, stream } = parameters

  const analysisFileName = `${sourceFileName}.analysis.md`

  const analysisFilePath = fs.getFilePath(analysisDir, analysisFileName)

  await fs.deleteFile(analysisFilePath)
  const writer = createWriteStream(analysisFilePath)
  let size = 0

  await pipeline(
    stream,
    async function* (source) {
      for await (const chunk of source) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        size += buf.length
        yield buf
      }
    },
    writer,
  )

  const analysis: Analysis = {
    version: 1,
    sourceFileUri,
    sourceFileName,
    sourceFileMimeType,
    created: new Date(),
    updated: new Date(),
    analysisFileName,
  }

  const parentEntry = await getEntry(identifier)
  if (!parentEntry) {
    logger.debug(
      'Cannot update parent entry with analyses because it was not found. Normal for extraction stream usage.',
      { identifier },
    )
    return analysis
  }
  parentEntry.analyses = [...(parentEntry.analyses || []), analysis]
  await saveEntry(parentEntry)

  await updateStats(parentEntry, {
    operation: 'add',
    stats: {
      analysesBytes: size,
      analysesFileCount: 1,
      attachmentBytes: 0,
      attachmentFileCount: 0,
      extractionBytes: identifier.type === 'extraction' ? size : 0,
      physicalBytes: size,
      extractionFileCount: identifier.type === 'extraction' ? 1 : 0,
      physicalFileCount: 1,
    },
  })
  return analysis
}
