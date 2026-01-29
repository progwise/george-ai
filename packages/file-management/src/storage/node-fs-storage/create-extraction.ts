import { WriteStream, createWriteStream } from 'node:fs'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { pipeline } from 'node:stream/promises'

import { AttachmentMetadata, ExtractionMetadata } from '../../schemas/extraction-metadata'
import { FileManifest } from '../../schemas/file-manifest'
import { ExtractionWriter } from '../storage-interface'
import { logger } from './commons'
import { getFileDir } from './directories'
import { getFileManifest, saveExtractionMetadata, saveFileManifest } from './metadata-files'
import { fileUsageUpdate } from './usage-update'

interface ExtractionWriterArgs {
  libraryId: string
  fileId: string
  extractionMethod: string
  splitFragmentPattern?: string
}

/**
 * Create an extraction writer for streaming content and attachments to disk.
 * Supports optional fragment splitting via `splitFragmentPattern`.
 *
 * @example
 * ```typescript
 * const writer = await createExtractionWriter(workspaceId, {
 *   libraryId,
 *   fileId,
 *   extractionMethod: 'pdf-extraction',
 *   splitFragmentPattern: '^# Page \\d+', // Optional: split on page headers
 * })
 *
 * try {
 *   for await (const item of pdfExtractor.extract(pdfStream)) {
 *     if (item.type === 'text') {
 *       writer.write(item.content)
 *     } else if (item.type === 'image') {
 *       writer.addAttachment(item.filename, item.stream, item.mimeType)
 *       writer.write(`![${item.alt}](attachments/${item.filename})\n\n`)
 *     }
 *   }
 *   const metadata = await writer.finish()
 * } catch (error) {
 *   await writer.abort(error)
 *   throw error
 * }
 * ```
 */
export async function createExtraction(workspaceId: string, args: ExtractionWriterArgs): Promise<ExtractionWriter> {
  const { libraryId, fileId, extractionMethod, splitFragmentPattern } = args
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  const finalDir = path.join(fileDir, 'extractions', extractionMethod)
  const tempDir = `${finalDir}.tmp-${Date.now()}`
  const attachmentsDir = path.join(tempDir, 'attachments')

  const fileManifest = await getFileManifest(fileDir)
  if (!fileManifest) {
    throw new Error(`File manifest not found for file dir: ${fileDir}`)
  }

  await mkdir(tempDir, { recursive: true })

  // Choose implementation based on whether fragment splitting is enabled
  if (splitFragmentPattern) {
    return createFragmentedWriter({
      workspaceId,
      libraryId,
      fileId,
      extractionMethod,
      splitFragmentPattern,
      tempDir,
      finalDir,
      attachmentsDir,
      fileDir,
      fileManifest,
    })
  }

  return createSimpleWriter({
    workspaceId,
    libraryId,
    fileId,
    extractionMethod,
    tempDir,
    finalDir,
    attachmentsDir,
    fileDir,
    fileManifest,
  })
}

interface WriterContext {
  workspaceId: string
  libraryId: string
  fileId: string
  extractionMethod: string
  tempDir: string
  finalDir: string
  attachmentsDir: string
  fileDir: string
  fileManifest: FileManifest
}

/**
 * Simple writer - writes all content to a single output.md file
 */
function createSimpleWriter(ctx: WriterContext): ExtractionWriter {
  const { workspaceId, libraryId, fileId, extractionMethod, tempDir, attachmentsDir, fileManifest } = ctx

  const outputPath = path.join(ctx.tempDir, 'output.md')
  const markdownWriter = createWriteStream(outputPath)
  let markdownBytes = 0
  let isAborted = false
  let attachmentsDirCreated = false

  const pendingAttachments: Promise<AttachmentMetadata>[] = []

  return {
    write(chunk: string | Buffer) {
      if (isAborted) return
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      markdownBytes += buffer.length
      markdownWriter.write(buffer)
    },

    addAttachment(filename: string, stream: Readable, mimeType?: string) {
      if (isAborted) {
        stream.destroy()
        return
      }
      pendingAttachments.push(
        writeAttachment(
          attachmentsDir,
          filename,
          stream,
          mimeType,
          () => attachmentsDirCreated,
          (v) => {
            attachmentsDirCreated = v
          },
        ),
      )
    },

    async finish(): Promise<ExtractionMetadata> {
      if (isAborted) {
        throw new Error('Extraction was aborted')
      }

      try {
        markdownWriter.end()
        await finished(markdownWriter)

        const attachments = await Promise.all(pendingAttachments)
        const totalAttachmentBytes = attachments.reduce((sum, a) => sum + a.size, 0)

        const metadata: ExtractionMetadata = {
          version: 1,
          extractionMethod,
          sourceHash: fileManifest.sourceHash,
          extractedAt: new Date().toISOString(),
          extractedBytes: markdownBytes,
          physicalBytes: markdownBytes + totalAttachmentBytes,
          extractionFiles: 1,
          physicalFiles: 1 + attachments.length + 1,
          hasFragments: false,
          attachments: attachments.length > 0 ? attachments : undefined,
        }

        await finalizeExtraction(ctx, metadata)
        return metadata
      } catch (error) {
        logger.error('Error finishing extraction', { workspaceId, libraryId, fileId, extractionMethod, error })
        await rm(tempDir, { recursive: true, force: true })
        throw error
      }
    },

    async abort(error?: Error) {
      isAborted = true
      markdownWriter.destroy()
      if (error) {
        logger.error('Extraction aborted', { workspaceId, libraryId, fileId, extractionMethod, error })
      }
      await rm(tempDir, { recursive: true, force: true })
    },
  }
}

interface FragmentedWriterContext extends WriterContext {
  splitFragmentPattern: string
}

/**
 * Fragmented writer - splits content into numbered fragment files based on pattern
 */
function createFragmentedWriter(ctx: FragmentedWriterContext): ExtractionWriter {
  const {
    workspaceId,
    libraryId,
    fileId,
    extractionMethod,
    splitFragmentPattern,
    tempDir,
    attachmentsDir,
    fileManifest,
  } = ctx

  const fragmentsDir = path.join(ctx.tempDir, 'fragments')
  const regex = new RegExp(splitFragmentPattern, 'gm')
  const fragmentBytes: number[] = []

  let contentBuffer = ''
  let currentWriter: WriteStream | null = null
  let currentFragmentBytes = 0
  let isAborted = false
  let attachmentsDirCreated = false
  let fragmentsDirCreated = false

  const pendingAttachments: Promise<AttachmentMetadata>[] = []

  const ensureFragmentsDir = async () => {
    if (!fragmentsDirCreated) {
      await mkdir(fragmentsDir, { recursive: true })
      fragmentsDirCreated = true
    }
  }

  const openFragment = async () => {
    await ensureFragmentsDir()
    const name = String(fragmentBytes.length + 1).padStart(4, '0') + '.md'
    currentWriter = createWriteStream(path.join(fragmentsDir, name))
    currentFragmentBytes = 0
  }

  const closeFragment = async () => {
    if (currentWriter) {
      currentWriter.end()
      await finished(currentWriter)
      fragmentBytes.push(currentFragmentBytes)
      currentWriter = null
    }
  }

  const writeToFragment = async (text: string) => {
    if (!currentWriter) await openFragment()
    const buf = Buffer.from(text)
    currentWriter!.write(buf)
    currentFragmentBytes += buf.length
  }

  const processBuffer = async () => {
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(contentBuffer)) !== null) {
      const contentBefore = contentBuffer.slice(lastIndex, match.index)
      if (contentBefore.trim()) {
        await writeToFragment(contentBefore)
        await closeFragment()
        await openFragment()
      }
      lastIndex = match.index
    }

    contentBuffer = contentBuffer.slice(lastIndex)
    regex.lastIndex = 0
  }

  // Queue for sequential processing of writes (to maintain order with async fragment operations)
  let writeQueue = Promise.resolve()

  return {
    write(chunk: string | Buffer) {
      if (isAborted) return
      const text = Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk
      contentBuffer += text

      // Queue the buffer processing
      writeQueue = writeQueue.then(() => processBuffer()).catch(() => {})
    },

    addAttachment(filename: string, stream: Readable, mimeType?: string) {
      if (isAborted) {
        stream.destroy()
        return
      }
      pendingAttachments.push(
        writeAttachment(
          attachmentsDir,
          filename,
          stream,
          mimeType,
          () => attachmentsDirCreated,
          (v) => {
            attachmentsDirCreated = v
          },
        ),
      )
    },

    async finish(): Promise<ExtractionMetadata> {
      if (isAborted) {
        throw new Error('Extraction was aborted')
      }

      try {
        // Wait for all queued writes to complete
        await writeQueue

        // Write any remaining content
        if (contentBuffer) {
          await writeToFragment(contentBuffer)
        }
        await closeFragment()

        const attachments = await Promise.all(pendingAttachments)
        const totalAttachmentBytes = attachments.reduce((sum, a) => sum + a.size, 0)
        const totalFragmentBytes = fragmentBytes.reduce((sum, b) => sum + b, 0)

        // Write summary file
        const summary = [
          `# Extraction Fragments`,
          ``,
          `Split into ${fragmentBytes.length} fragments using pattern: \`${JSON.stringify(splitFragmentPattern).slice(1, -1)}\``,
          ``,
          ...fragmentBytes.map(
            (bytes, i) => `- Fragment ${i + 1}: ${String(i + 1).padStart(4, '0')}.md (${bytes} bytes)`,
          ),
        ].join('\n')

        await writeFile(path.join(tempDir, 'output.md'), summary)
        const summaryBytes = Buffer.byteLength(summary)

        const metadata: ExtractionMetadata = {
          version: 1,
          extractionMethod,
          sourceHash: fileManifest.sourceHash,
          extractedAt: new Date().toISOString(),
          extractedBytes: totalFragmentBytes,
          physicalBytes: totalFragmentBytes + summaryBytes + totalAttachmentBytes,
          extractionFiles: fragmentBytes.length,
          physicalFiles: fragmentBytes.length + (fragmentBytes.length > 1 ? 2 : 1) + attachments.length,
          splitFragmentPattern,
          hasFragments: fragmentBytes.length > 1,
          fragmentCount: fragmentBytes.length > 1 ? fragmentBytes.length : undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        }

        await finalizeExtraction(ctx, metadata)
        return metadata
      } catch (error) {
        logger.error('Error finishing extraction', { workspaceId, libraryId, fileId, extractionMethod, error })
        await rm(tempDir, { recursive: true, force: true })
        throw error
      }
    },

    async abort(error?: Error) {
      isAborted = true
      if (currentWriter) {
        currentWriter.destroy()
      }
      if (error) {
        logger.error('Extraction aborted', { workspaceId, libraryId, fileId, extractionMethod, error })
      }
      await rm(tempDir, { recursive: true, force: true })
    },
  }
}

/**
 * Write an attachment stream to disk
 */
async function writeAttachment(
  attachmentsDir: string,
  filename: string,
  stream: Readable,
  mimeType: string | undefined,
  getDirCreated: () => boolean,
  setDirCreated: (v: boolean) => void,
): Promise<AttachmentMetadata> {
  if (!getDirCreated()) {
    await mkdir(attachmentsDir, { recursive: true })
    setDirCreated(true)
  }

  const attachmentPath = path.join(attachmentsDir, filename)
  const writer = createWriteStream(attachmentPath)
  let size = 0

  await pipeline(
    stream,
    async function* (source) {
      for await (const chunk of source) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        size += buf.length
        yield buf
      }
    },
    writer,
  )

  return { filename, size, mimeType }
}

/**
 * Finalize extraction: save metadata, swap directories, update usage
 */
async function finalizeExtraction(ctx: WriterContext, metadata: ExtractionMetadata): Promise<void> {
  const { tempDir, finalDir, fileDir, fileManifest, extractionMethod } = ctx

  await saveExtractionMetadata(tempDir, metadata)
  await rm(finalDir, { recursive: true, force: true })
  await rename(tempDir, finalDir)

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

  await saveFileManifest(fileDir, {
    ...fileManifest,
    extractions: [
      ...fileManifest.extractions.filter((ex) => ex.extractionMethod !== extractionMethod),
      { extractionMethod, extractionDate: new Date().toISOString(), extractionHash: fileManifest.sourceHash },
    ],
  })
}
