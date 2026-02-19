import { constants, createReadStream, promises } from 'node:fs'
import path from 'node:path'

import { fs, getUri } from '../commons'
import { logger } from '../commons'
import { getEntryOrThrow, getEntryPath } from '../entry'
import { getFragmentsPath } from '../entry/get-entry-path'
import { DocumentIdentifier, ExtractionIdentifier, ExtractionManifest } from '../schema'
import { lineSplitter } from './line-splitter'

const { access } = promises

export async function readExtraction(
  identifier: ExtractionIdentifier | DocumentIdentifier,
  fragment?: number,
): Promise<AsyncIterable<string>> {
  if (identifier.type === 'extraction') {
    logger.debug('Reading single extraction', { identifier, fragment })
    return readSingleExtraction(identifier, fragment)
  }

  logger.debug('Reading all extractions for document', { documentId: identifier.documentId })

  const documentManifest = await getEntryOrThrow(identifier)

  if (documentManifest.extractions.length === 0) {
    throw new Error(`No extractions found for document ${getUri(identifier)}`)
  }

  const extractionIdentifiers: ExtractionIdentifier[] = documentManifest.extractions.map((extraction) => ({
    ...identifier,
    type: 'extraction',
    extractionMethod: extraction.extractionMethod,
    documentId: identifier.documentId,
  }))
  // Combine multiple extraction streams lazily - only create each stream when needed
  async function* combinedGenerator() {
    for (const extractionIdentifier of extractionIdentifiers) {
      const stream = await readSingleExtraction(extractionIdentifier)
      logger.debug('Reading extraction', { extractionIdentifier })
      yield `--- Extraction Start ---`
      for await (const line of stream) {
        yield line
      }
    }
  }

  return combinedGenerator()
}

export async function readSingleExtraction(
  identifier: ExtractionIdentifier,
  fragment?: number,
): Promise<AsyncIterable<string>> {
  const extractionDir = getEntryPath(identifier)

  const manifest = await getEntryOrThrow(identifier)

  if (!manifest.fragmentCount && fragment !== undefined) {
    throw new Error(`Fragments are not available for ${getUri(identifier)}.`)
  }

  // 3. Handle Single File Extractions
  const outputMdPath = path.join(extractionDir, 'output.md')
  await access(outputMdPath, constants.R_OK)
  const outputMdStream = getLineStream(outputMdPath)

  if (!manifest.fragmentCount) {
    return outputMdStream
  }

  const mainStream = createExtractionMainContentStream(manifest)

  if (fragment !== undefined) {
    const fragmentFileName = `${String(fragment).padStart(4, '0')}.md`

    const fragmentStream = createFragmentStream(manifest, fragmentFileName, fragment)

    const resultStream = async function* () {
      for await (const line of mainStream) {
        // Ensure each line from the stream is yielded properly
        yield `${line}`
      }

      for await (const line of fragmentStream) {
        // Ensure each line from the stream is yielded properly
        yield `${line}`
      }
      yield `\n\n---\n**End of Extraction for ${getUri(identifier)}**\n\n`
    }

    return resultStream()
  }

  return createFragmentsStream(manifest)
}

async function* createExtractionMainContentStream(manifest: ExtractionManifest): AsyncGenerator<string> {
  const extractionDir = getEntryPath(manifest)
  const outputMdPath = await fs.getFilePathOrThrow(
    [extractionDir, 'output.md'],
    `Main extraction file does not exist for ${getUri(manifest)}`,
  )
  const outputMdStream = getLineStream(outputMdPath)
  yield `# Extraction Start\n\n`
  yield `
| Setting | Value |
| ---: | :--- |
| **Extraction method** | ${manifest.extractionMethod} |
| **URI** | ${getUri(manifest)} |
| **Extraction date** | ${manifest.created} |
  `
  yield `\n\n---\n**Manifest**\n\`\`\`json\n${JSON.stringify(manifest, null, 2)}\n\`\`\`\n\n`
  yield `\n\n---\n**Main Content Start**\n\n`

  for await (const line of outputMdStream) {
    // Ensure each line from the stream is yielded properly
    yield `${line}\n`
  }
  yield `\n\n`
  yield `**Main Content End**\n\n`
}

async function* createFragmentsStream(manifest: ExtractionManifest): AsyncGenerator<string> {
  const fragmentsPath = getFragmentsPath(manifest)

  const fragmentFiles = await fs.listFiles(fragmentsPath)
  // Read and sort files to ensure 0001.md comes before 0002.md
  const files = fragmentFiles.sort()

  let fragmentIndex = 1
  yield `\n\n**Retrieving ${files.length} fragments for ${getUri(manifest)}**\n\n`
  for (const fileName of files) {
    for await (const line of createFragmentStream(manifest, fileName, fragmentIndex)) {
      yield line
    }
    fragmentIndex++
  }

  yield `\n\n---\n**End of Extraction for Fragments of ${getUri(manifest)}**\n\n`
}

async function* createFragmentStream(
  manifest: ExtractionManifest,
  fragmentFileName: string,
  fragment: number,
): AsyncGenerator<string> {
  yield `**Fragment Start**\n\n`
  yield `Retrieving fragment ${fragment} of ${manifest.fragmentCount}\n`
  yield `File name: ${fragmentFileName}\n\n`

  const fragmentsPath = getFragmentsPath(manifest)
  const fragmentFilePath = await fs.getFilePathOrThrow(
    [fragmentsPath, fragmentFileName],
    `Fragment ${fragment} does not exist for ${getUri(manifest)}`,
  )
  yield `**Fragment Content Start ${fragmentFileName}**\n\n`
  for await (const line of getLineStream(fragmentFilePath)) {
    yield `${line}\n`
  }
  yield `\n\n`
  yield `**Fragment Content End ${fragmentFileName}**\n\n---\n`
}

async function* getLineStream(filePath: string): AsyncGenerator<string> {
  const source = createReadStream(filePath)
  try {
    for await (const line of lineSplitter(source)) {
      // line splitter not used currently as we want to preserve the original formatting of the extraction files, which may not be line-based
      yield line
    }
  } finally {
    source.destroy()
  }
}
