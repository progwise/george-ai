import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { ExtractionMetadata } from '../../schemas/extraction-metadata'
import { isNodeError, logger } from './commons'
import { getFileDir } from './directories'
import { getFileManifest, saveExtractionMetadata, saveFileManifest } from './metadata-files'
import { fileUsageUpdate } from './usage-update'

export async function writeExtraction(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    methodId: string
    stream: Readable
    config: Record<string, string | number | boolean>
  },
): Promise<ExtractionMetadata> {
  const { libraryId, fileId, methodId, stream, config } = args
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  const finalDir = path.join(fileDir, 'extractions', methodId)
  const tempDir = `${finalDir}.tmp-${Date.now()}`

  // 1. Get current source hash from File Manifest to "bind" this extraction
  const fileManifest = await getFileManifest(fileDir)
  if (!fileManifest) {
    throw new Error(`File manifest not found for file dir: ${fileDir}`)
  }
  const sourceHash = fileManifest.sourceHash

  try {
    await mkdir(tempDir, { recursive: true })

    const outputPath = path.join(tempDir, 'output.md')
    const writeStream = createWriteStream(outputPath)
    const hasher = createHash('sha256') // Optional: Hash the output itself
    let byteCount = 0

    // 2. Stream extraction data
    stream.on('data', (chunk) => {
      byteCount += chunk.length
      hasher.update(chunk)
    })

    await pipeline(stream, writeStream)

    // 3. Create the extraction metadata
    const metadata: ExtractionMetadata = {
      version: 1,
      methodId,
      sourceHash,
      status: 'completed',
      extractedBytes: byteCount,
      extractedAt: new Date().toISOString(),
      config,
      output: { hasFragments: false, mainFile: 'output.md' },
      extractionFiles: 1,
      physicalFiles: 2,
      physicalBytes: byteCount,
    }

    // Save metadata into the TEMP directory first
    await saveExtractionMetadata(tempDir, metadata)

    // 4. THE ATOMIC SWAP
    // Remove old extraction if exists
    await rm(finalDir, { recursive: true, force: true })
    // Rename temp to final
    await rename(tempDir, finalDir)

    // 5. Bubble up the size changes
    // (Note: You'd need to calculate the Delta if overwriting)
    await fileUsageUpdate(fileDir, {
      operation: 'add',
      usage: {
        sourceBytes: 0,
        extractedBytes: metadata.extractedBytes,
        physicalBytes: metadata.physicalBytes,
        sourceFiles: 0,
        extractionFiles: metadata.extractionFiles,
        physicalFiles: metadata.physicalFiles,
        extractions: 1,
        activeExtractions: fileManifest.sourceHash === metadata.sourceHash ? 1 : 0,
        activeExtractedBytes: fileManifest.sourceHash === metadata.sourceHash ? metadata.extractedBytes : 0,
        lastUpdate: new Date().toISOString(),
      },
    })

    await saveFileManifest(finalDir, {
      ...fileManifest,
      extractions: [
        ...fileManifest.extractions.filter((ex) => ex.methodId !== methodId),
        { methodId, extractionDate: new Date().toISOString(), extractionHash: fileManifest.sourceHash },
      ],
    })

    return metadata
  } catch (error) {
    await rm(tempDir, { recursive: true, force: true })
    if (isNodeError(error)) {
      logger.error('Node error writing extraction for file', {
        fileId,
        methodId,
        error,
        code: error.code,
      })
    } else if (error instanceof Error) {
      logger.error('Error writing extraction for file', { fileId, methodId, error, message: error.message })
    } else {
      logger.error('Unknown error writing extraction for file', { fileId, methodId, error })
    }
    throw error
  }
}
