import { createWriteStream } from 'node:fs'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { finished } from 'node:stream/promises'

import { getUri } from '../..'
import { ensureFolderOnce, getFileStats } from '../../file-system'
import { logger } from '../commons'
import { getAnalysesFolderPath, getEntry, saveEntry } from '../entry'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { Analysis } from '../schema/manifest/analysis-schema'
import { updateStats } from '../storage-stats'

import { rename } from 'fs/promises'

export interface AnalysisWriter {
  /** Write markdown content to output.md, backpressures if the stream buffer is full */
  write(chunk: string | Buffer): Promise<void>
  /** Finalize extraction - waits for all fragments and attachments to complete */
  ack(): Promise<Analysis>

  /** Abort and cleanup on error */
  nack(error?: Error): Promise<void>
}

/**
 * Analysis writer - writes content to a single output.md file and supports adding fragment streams and attachment streams.
 * On ack, saves the manifest with storage stats. On nack, rolls back any changes.
 */
export async function getAnalysisWriter(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
  parameters: {
    sourceFileUri: string
    sourceFileName: string
    sourceFileMimeType: string
  },
): Promise<AnalysisWriter> {
  const now = Date.now()
  const { sourceFileUri, sourceFileName, sourceFileMimeType } = parameters

  const parentEntry = await getEntry(identifier)
  if (!parentEntry) {
    logger.error('Entry does not exist for analysis writer', {
      ...identifier,
      sourceFileUri,
      sourceFileName,
      sourceFileMimeType,
    })
    throw new Error(`Cannot write analysis. Entry does not exist for: ${getUri(identifier)}.`)
  }

  const analysesDir = getAnalysesFolderPath(identifier)
  await ensureFolderOnce(analysesDir)
  const analysisFileName = `${sourceFileName}.analysis.md`
  const analysisFilePath = path.join(analysesDir, analysisFileName)

  const oldStats = await getFileStats(analysisFilePath)

  if (oldStats) {
    logger.warn('Analysis file already exists for entry', {
      ...identifier,
      analysisFileName,
      analysisFilePath,
    })
    await rename(analysisFilePath, `${analysisFilePath}.${now}.bak`)
  }

  const markdownWriter = createWriteStream(analysisFilePath, { flags: 'w' })
  let markdownBytes = 0
  let isAborted = false

  const rollback = async () => {
    await rm(analysisFilePath, { recursive: true, force: true }).catch(() => {})
    await rename(`${analysisFilePath}.${now}.bak`, analysisFilePath).catch(() => {})
  }

  return {
    async write(chunk: string | Buffer): Promise<void> {
      if (isAborted) {
        markdownWriter.destroy()
        throw new Error('Analysis was aborted')
      }
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      markdownBytes += buffer.length

      const canContinue = markdownWriter.write(buffer)
      if (!canContinue) {
        // Pause until the stream has flushed its buffer
        // return once(markdownWriter, 'drain').then(() => {})
        return new Promise((resolve, reject) => {
          markdownWriter.once('drain', resolve)
          markdownWriter.once('error', reject)
        })
      }
    },

    async ack(): Promise<Analysis> {
      if (isAborted) {
        throw new Error('Analysis was aborted')
      }

      const analyses = parentEntry.analyses.filter((a) => a.analysisFileName === analysisFileName) || []
      const analysis: Analysis = {
        version: 1,
        sourceFileUri,
        sourceFileName,
        sourceFileMimeType,
        created: new Date(),
        updated: new Date(),
        analysisFileName,
      }
      analyses.push(analysis)

      try {
        markdownWriter.end()
        await finished(markdownWriter)

        const updatedEntry = {
          ...parentEntry,
          storageStats: {
            analysesBytes: parentEntry.storageStats.analysesBytes - (oldStats ? oldStats.diskSize : 0) + markdownBytes,
            analysesFileCount: parentEntry.storageStats.analysesFileCount + (oldStats ? 0 : 1),
            extractionBytes:
              parentEntry.storageStats.extractionBytes +
              (parentEntry.type === 'extraction' ? markdownBytes - (oldStats ? oldStats.diskSize : 0) : 0),
            physicalBytes: parentEntry.storageStats.physicalBytes + markdownBytes - (oldStats ? oldStats.diskSize : 0),
            extractionFileCount:
              parentEntry.storageStats.extractionFileCount + (parentEntry.type === 'extraction' ? 1 : 0),
            physicalFileCount: parentEntry.storageStats.physicalFileCount + (oldStats ? 0 : 1), // 1 for output.md, 1 for manifest, 1 per fragment, 1 per attachment
            attachmentBytes: parentEntry.storageStats.attachmentBytes,
            attachmentFileCount: parentEntry.storageStats.attachmentFileCount,
            lastUpdate: new Date(),
          },
          analyses,
        }

        await saveEntry(updatedEntry)

        await updateStats(updatedEntry, {
          stats: updatedEntry.storageStats,
          operation: 'add',
        })

        return analysis
      } catch (error) {
        logger.error('Error finishing analysis. Rollback.', {
          ...parentEntry,
          analysis,
          error,
        })
        await rollback().catch((rollbackError) => {
          logger.error('Error during analysis rollback', {
            method: 'ack',
            ...parentEntry,
            analysis,
            originalError: error,
            rollbackError,
          })
        })
        throw error
      }
    },

    async nack(error?: Error) {
      isAborted = true
      markdownWriter.destroy()
      if (error) {
        logger.error('Analysis aborted', { ...parentEntry, error })
      }
      await rollback().catch((rollbackError) => {
        logger.error('Error during analysis rollback', {
          method: 'nack',
          ...parentEntry,
          rollbackError,
        })
      })
    },
  }
}
