import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { ExtractionMetadata } from '../../schemas/extraction-metadata'
import { isNodeError } from './commons'
import { getFileDir } from './directories'
import { getFileManifest, saveExtractionMetadata } from './metadata-files'
import { fileSizeUpdate } from './size-update'

export async function writeExtraction(
  wsId: string,
  libId: string,
  fileId: string,
  methodId: string,
  inputStream: Readable,
  config: Record<string, string | number | boolean>,
): Promise<ExtractionMetadata> {
  const fileDir = await getFileDir(wsId, libId, fileId)
  const finalDir = path.join(fileDir, 'extractions', methodId)
  const tempDir = `${finalDir}.tmp-${Date.now()}`

  // 1. Get current source hash from File Manifest to "bind" this extraction
  const fileManifest = await getFileManifest(fileDir)
  const sourceHash = fileManifest.currentSourceHash

  try {
    await mkdir(tempDir, { recursive: true })

    const outputPath = path.join(tempDir, 'output.md')
    const writeStream = createWriteStream(outputPath)
    const hasher = createHash('sha256') // Optional: Hash the output itself
    let byteCount = 0

    // 2. Stream extraction data
    inputStream.on('data', (chunk) => {
      byteCount += chunk.length
      hasher.update(chunk)
    })

    await pipeline(inputStream, writeStream)

    // 3. Create the extraction metadata
    const metadata: ExtractionMetadata = {
      version: 1,
      methodId,
      sourceHashAtExecution: sourceHash, // THE LINK
      status: 'completed',
      sizeBytes: byteCount,
      executedAt: new Date().toISOString(),
      config,
      output: { isSharded: false, mainFile: 'output.md' },
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
    await fileSizeUpdate(fileDir, {
      bytes: metadata.sizeBytes,
      files: 2, // metadata.json + output.md
    })

    return metadata
  } catch (err) {
    await rm(tempDir, { recursive: true, force: true })
    if (isNodeError(err)) {
      console.error(`Node error writing extraction for file ${fileId} with method ${methodId}: ${err.message}`)
    } else if (err instanceof Error) {
      console.error(`Error writing extraction for file ${fileId} with method ${methodId}: ${err.message}`)
    } else {
      console.error(`Unknown error writing extraction for file ${fileId} with method ${methodId}`)
    }
    throw err
  }
}
