import { createReadStream } from 'node:fs'
import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

import { isNodeError } from './commons'
import { getFileDir } from './directories'

export async function readSource(workspaceId: string, libraryId: string, fileId: string): Promise<Readable> {
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  const filePath = path.join(fileDir, 'source')

  try {
    // 1. Verify readability before opening the stream
    // R_OK checks if the file exists AND the process has read permissions
    await access(filePath, constants.R_OK)
  } catch (err) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      throw new Error(`Source file not found at ${filePath}`)
    }
    throw err
  }

  // 2. Return the stream
  const fileStream = createReadStream(filePath)

  // 3. Handle stream-level errors (e.g., file system disconnects mid-read)
  fileStream.on('error', (err) => {
    console.error(`Stream error for file ${fileId}:`, err)
  })

  return fileStream
}
