import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { FileManifest } from '../../schemas'
import { FileInput } from '../storage-interface'
import { FILES_DIR_NAME, LIBRARIES_DIR_NAME, SOURCE_FILE_NAME } from './commons'
import { getWorkspaceDir } from './directories'
import { fileUsageUpdate } from './usage-update'

export async function writeSource(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    stream: Readable
    meta: FileInput
  },
): Promise<FileManifest> {
  const { libraryId, fileId, stream, meta } = args
  const workspaceDir = await getWorkspaceDir(workspaceId)
  const dirPath = path.join(workspaceDir, LIBRARIES_DIR_NAME, libraryId, FILES_DIR_NAME, fileId)
  const filePath = path.join(dirPath, SOURCE_FILE_NAME)

  // 1. Ensure directory exists
  await mkdir(dirPath, { recursive: true })

  const hash = createHash('sha256')
  const writeStream = createWriteStream(filePath)

  let byteCount = 0

  // 2. Process the stream
  // We manually monitor the chunks to count bytes without loading the whole file
  stream.on('data', (chunk) => {
    byteCount += chunk.length
    hash.update(chunk)
  })

  // 3. Pipeline handles the backpressure and closing of streams
  await pipeline(stream, writeStream)

  const finalHash = hash.digest('hex')

  // 4. Create the File Manifest
  const manifest: FileManifest = {
    version: 1,
    id: fileId,
    fileName: meta.originalName,
    createdAt: new Date().toISOString(),
    mimeType: meta.mimeType,
    sourceHash: finalHash,
    usage: {
      sourceBytes: byteCount,
      activeExtractedBytes: 0, // Initially only source is active
      physicalBytes: byteCount, // Initially source = physical
      lastUpdate: new Date().toISOString(),
      sourceFiles: 1,
      physicalFiles: 1,
      extractions: 0,
      extractedBytes: 0,
      activeExtractions: 0,
      extractionFiles: 0,
    },
    extractions: [],
  }

  // 5. Atomic Write of Manifest
  await writeFile(path.join(dirPath, 'manifest.json'), JSON.stringify(manifest, null, 2))

  // 6. Trigger Bubble Up
  // We pass the diffs to the bubbling function
  await fileUsageUpdate(dirPath, {
    operation: 'add',
    usage: manifest.usage,
  })

  return manifest
}
