import { constants, createReadStream, promises } from 'node:fs'
import path from 'node:path'

import { ExtractionMethod } from '@george-ai/app-commons/src/types/extraction'

import { lineSplitter, logger } from './commons'
import { getExtractionDir } from './directories'
import { getFile } from './get-file'
import { getExtractionMetadata } from './metadata-files'

const { access, readdir } = promises

export async function readExtraction(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    extractionMethod?: ExtractionMethod | null
    fragment?: number | null
  },
): Promise<AsyncIterable<string>> {
  const { libraryId, fileId, extractionMethod, fragment } = args

  if (extractionMethod) {
    // Single Extraction Method Requested
    return readSingleExtraction(workspaceId, { libraryId, fileId, extractionMethod, fragment })
  }

  const fileManifest = await getFile(workspaceId, { libraryId, fileId })

  if (!fileManifest || !fileManifest.extractions || fileManifest.extractions.length === 0) {
    throw new Error(`No extractions found for file: ${fileId} in library: ${libraryId}`)
  }

  const { extractions } = fileManifest
  // Combine multiple extraction streams lazily - only create each stream when needed
  async function* combinedGenerator() {
    for (const extraction of extractions) {
      const stream = await readSingleExtraction(workspaceId, {
        libraryId,
        fileId,
        extractionMethod: extraction.extractionMethod,
        fragment,
      })
      yield `--- Extraction Start ---`
      for await (const line of stream) {
        yield line
      }
    }
  }

  return combinedGenerator()
}

export async function readSingleExtraction(
  workspaceId: string,
  args: {
    libraryId: string
    fileId: string
    extractionMethod: ExtractionMethod
    fragment?: number | null
  },
): Promise<AsyncIterable<string>> {
  const { libraryId, fileId, extractionMethod, fragment } = args
  const extractionDir = await getExtractionDir(workspaceId, libraryId, fileId, extractionMethod)

  // 1. Get Metadata (The Source of Truth)
  const metadata = await getExtractionMetadata(extractionDir)
  if (!metadata) {
    throw new Error(`Extraction metadata not found for extraction dir: ${extractionDir}`)
  }

  if (!metadata.hasFragments && fragment === undefined) {
    // 3. Handle Single File Extractions
    const filePath = path.join(extractionDir, 'output.md')
    await access(filePath, constants.R_OK)
    return getLineStream(filePath)
  }

  if (!metadata.hasFragments && fragment !== undefined) {
    logger.warn('Requested fragment for non-sharded extraction', {
      workspaceId,
      libraryId,
      fileId,
      extractionMethod,
      fragment,
    })
    throw new Error('Fragments are not available for this extraction')
  }

  if (metadata.hasFragments && fragment !== undefined) {
    const fragmentFileName = `${String(fragment).padStart(4, '0')}.md`
    const fragmentPath = path.join(extractionDir, 'fragments', fragmentFileName)
    await access(fragmentPath, constants.R_OK)

    return getLineStream(fragmentPath)
  }

  // 2. Handle Sharded Extractions
  if (metadata.hasFragments) {
    const fragmentsDir = path.join(extractionDir, 'fragments')

    // Verify directory exists
    await access(fragmentsDir, constants.R_OK)

    return createFragmentStream(fragmentsDir)
  }

  logger.error('Invalid extraction state', {
    workspaceId,
    libraryId,
    fileId,
    extractionMethod,
    fragment,
    metadata,
  })
  throw new Error('Invalid extraction state: unable to determine extraction file(s)')
}

async function* createFragmentStream(fragmentsDir: string): AsyncGenerator<string> {
  // Read and sort files to ensure 0001.md comes before 0002.md
  const files = (await readdir(fragmentsDir)).sort()

  for (const file of files) {
    const fragmentPath = path.join(fragmentsDir, file)
    const stream = getLineStream(fragmentPath)
    yield `--- Fragment: ${file} ---`
    for await (const line of stream) {
      yield line
    }
  }
}

async function* getLineStream(filePath: string): AsyncGenerator<string> {
  const source = createReadStream(filePath)
  try {
    for await (const line of lineSplitter(source)) {
      yield line
    }
  } finally {
    source.destroy()
  }
}
