import { createReadStream } from 'node:fs'
import { constants } from 'node:fs'
import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

import { getExtractionDir } from './directories'
import { getExtractionMetadata } from './metadata-files'

/**
 * Reads an extraction and returns a single continuous stream.
 * Automatically handles sharded vs single-file extractions.
 */
export async function readExtraction(
  workspaceId: string,
  libraryId: string,
  fileId: string,
  methodId: string,
): Promise<Readable> {
  const extractionDir = await getExtractionDir(workspaceId, libraryId, fileId, methodId)

  // 1. Get Metadata (The Source of Truth)
  const metadata = await getExtractionMetadata(extractionDir)

  // 2. Handle Sharded Extractions
  if (metadata.output.isSharded) {
    const shardsDir = path.join(extractionDir, 'shards')

    // Verify directory exists
    await access(shardsDir, constants.R_OK)

    return createVirtualShardedStream(shardsDir)
  }

  // 3. Handle Single File Extractions
  const filePath = path.join(extractionDir, metadata.output.mainFile || 'output.md')
  await access(filePath, constants.R_OK)

  return createReadStream(filePath)
}

/**
 * Helper: Combines shards into a single stream using an Async Generator
 */
function createVirtualShardedStream(shardsDir: string): Readable {
  async function* shardGenerator() {
    // Read and sort files to ensure 0001.md comes before 0002.md
    const files = (await readdir(shardsDir)).sort()

    for (const file of files) {
      const shardPath = path.join(shardsDir, file)
      const stream = createReadStream(shardPath)

      try {
        for await (const chunk of stream) {
          yield chunk
        }
      } finally {
        stream.destroy() // Ensure file descriptor is closed
      }
    }
  }

  return Readable.from(shardGenerator())
}
