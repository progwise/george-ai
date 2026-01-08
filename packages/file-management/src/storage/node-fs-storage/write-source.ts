import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { FileManifest } from '../../schemas'
import { FileInput } from '../storage-interface'
import { getWorkspaceDir } from './directories'
import { fileSizeUpdate } from './size-update'

export async function writeSource(
  workspaceId: string,
  libraryId: string,
  fileId: string,
  inputStream: Readable,
  meta: FileInput,
): Promise<FileManifest> {
  const workspaceDir = await getWorkspaceDir(workspaceId)
  const dirPath = path.join(workspaceDir, 'libraries', libraryId, 'files', fileId)
  const filePath = path.join(dirPath, 'source')

  // 1. Ensure directory exists
  await mkdir(dirPath, { recursive: true })

  const hash = createHash('sha256')
  const writeStream = createWriteStream(filePath)

  let byteCount = 0

  // 2. Process the stream
  // We manually monitor the chunks to count bytes without loading the whole file
  inputStream.on('data', (chunk) => {
    byteCount += chunk.length
    hash.update(chunk)
  })

  // 3. Pipeline handles the backpressure and closing of streams
  await pipeline(inputStream, writeStream)

  const finalHash = hash.digest('hex')

  // 4. Create the File Manifest
  const manifest: FileManifest = {
    version: 1,
    id: fileId,
    originalName: meta.originalName,
    originalUpdatedAt: meta.originalUpdatedAt,
    mimeType: meta.mimeType,
    currentSourceHash: finalHash,
    usage: {
      sourceBytes: byteCount,
      activeBytes: byteCount, // Initially only source is active
      physicalBytes: byteCount, // Initially source = physical
      lastUpdated: new Date().toISOString(),
      activeFileCount: 1,
      totalFileCount: 1,
      integrityState: 'healthy',
    },
  }

  // 5. Atomic Write of Manifest
  await writeFile(path.join(dirPath, 'manifest.json'), JSON.stringify(manifest, null, 2))

  // 6. Trigger Bubble Up
  // We pass the diffs to the bubbling function
  await fileSizeUpdate(dirPath, {
    bytes: byteCount,
    files: 1,
  })

  return manifest
}
