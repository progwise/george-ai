import { createReadStream } from 'node:fs'
import { constants, promises } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

import { logger } from './commons'
import { getExtractionDir } from './directories'
import { getFile } from './get-file'
import { getExtractionMetadata } from './metadata-files'

const { access, readdir } = promises

export async function readExtraction(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    methodId?: string
    fragment?: number
  },
): Promise<Readable> {
  const { libraryId, fileId, methodId, fragment } = args

  if (methodId) {
    // Single Extraction Method Requested
    return readSingleExtraction(workspaceId, { libraryId, fileId, methodId, fragment })
  }

  const fileManifest = await getFile(workspaceId, { libraryId, fileId })

  if (!fileManifest || !fileManifest.extractions || fileManifest.extractions.length === 0) {
    throw new Error(`No extractions found for file: ${fileId} in library: ${libraryId}`)
  }

  const readStreams = await Promise.all(
    fileManifest.extractions.map(async (extraction) =>
      readSingleExtraction(workspaceId, {
        libraryId,
        fileId,
        methodId: extraction.methodId,
        fragment,
      }),
    ),
  )

  // Combine multiple extraction streams into one
  async function* combinedGenerator() {
    for (const stream of readStreams) {
      try {
        for await (const chunk of stream) {
          yield chunk
        }
      } finally {
        stream.destroy() // Ensure file descriptor is closed
      }
    }
  }

  return Readable.from(combinedGenerator())
}

export async function readSingleExtraction(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    methodId: string
    fragment?: number
  },
): Promise<Readable> {
  const { libraryId, fileId, methodId, fragment } = args
  const extractionDir = await getExtractionDir(workspaceId, libraryId, fileId, methodId)

  // 1. Get Metadata (The Source of Truth)
  const metadata = await getExtractionMetadata(extractionDir)
  if (!metadata) {
    throw new Error(`Extraction metadata not found for extraction dir: ${extractionDir}`)
  }

  if (!metadata.output.hasFragments && fragment === undefined) {
    // 3. Handle Single File Extractions
    const filePath = path.join(extractionDir, metadata.output.mainFile || 'output.md')
    await access(filePath, constants.R_OK)

    return createReadStream(filePath)
  }

  if (!metadata.output.hasFragments && fragment !== undefined) {
    logger.warn('Requested fragment for non-sharded extraction', {
      workspaceId,
      libraryId,
      fileId,
      methodId,
      fragment,
    })
    throw new Error('Fragments are not available for this extraction')
  }

  if (metadata.output.hasFragments && fragment !== undefined) {
    const fragmentFileName = String(fragment).padStart(4, '0') + path.extname(metadata.output.mainFile || 'output.md')
    const fragmentPath = path.join(extractionDir, 'fragments', fragmentFileName)
    await access(fragmentPath, constants.R_OK)

    return createReadStream(fragmentPath)
  }

  // 2. Handle Sharded Extractions
  if (metadata.output.hasFragments) {
    const fragmentsDir = path.join(extractionDir, 'fragments')

    // Verify directory exists
    await access(fragmentsDir, constants.R_OK)

    return createVirtualFragmentStream(fragmentsDir)
  }

  logger.error('Invalid extraction state', {
    workspaceId,
    libraryId,
    fileId,
    methodId,
    fragment,
    metadata,
  })
  throw new Error('Invalid extraction state: unable to determine extraction file(s)')
}

/**
 * Helper: Combines shards into a single stream using an Async Generator
 */
function createVirtualFragmentStream(fragmentsDir: string): Readable {
  async function* fragmentGenerator() {
    // Read and sort files to ensure 0001.md comes before 0002.md
    const files = (await readdir(fragmentsDir)).sort()

    for (const file of files) {
      const fragmentPath = path.join(fragmentsDir, file)
      const stream = createReadStream(fragmentPath)
      try {
        for await (const chunk of stream) {
          yield chunk
        }
      } finally {
        stream.destroy() // Ensure file descriptor is closed
      }
    }
  }

  return Readable.from(fragmentGenerator())
}
