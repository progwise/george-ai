import { Dirent, createReadStream } from 'node:fs'
import { lstat, readdir } from 'node:fs/promises'
import path from 'node:path'

import { logger } from '../commons'
import { getEntryPath } from '../entry'
import { createExtraction } from '../extraction'
import { ExtractionWriter } from '../extraction/extraction.writer'
import { DocumentManifest, ExtractionManifest } from '../schema'

export async function createExtractionsFromLegacy(documentManifest: DocumentManifest): Promise<ExtractionManifest[]> {
  const documentDir = getEntryPath(documentManifest)
  const entries = await readdir(documentDir, { withFileTypes: true })
  const result: Array<Promise<ExtractionManifest>> = []

  const markdownFileEntries = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))

  for (const entry of markdownFileEntries) {
    try {
      if (entry.name.toLowerCase() === 'converted.md') {
        const extractionWriter = await createExtraction(documentManifest, 'legacyExtraction')
        // extractionWriter.addAttachment(entry.name, createReadStream(path.join(targetDir, entry.name)), 'text/markdown')
        result.push(writeExtractionData(entry, extractionWriter))
        continue
      }

      if (entry.name.toLowerCase().startsWith('text-extraction')) {
        const extractionWriter = await createExtraction(documentManifest, 'textExtraction')
        result.push(writeExtractionData(entry, extractionWriter))
        continue
      }

      if (entry.name.toLowerCase().startsWith('html-extraction')) {
        const extractionWriter = await createExtraction(documentManifest, 'htmlExtraction')
        result.push(writeExtractionData(entry, extractionWriter))
        continue
      }

      if (entry.name.toLowerCase().startsWith('csv-extraction')) {
        const extractionWriter = await createExtraction(documentManifest, 'csvExtraction')
        result.push(writeExtractionData(entry, extractionWriter))
        continue
      }
    } catch (error) {
      logger.error('Error creating legacy extraction for entry, skipping this extraction', {
        entryName: entry.name,
        documentManifest,
        error,
      })
    }
  }
  return await Promise.all(result)
}

async function writeExtractionData(
  entry: Dirent<string>,
  extractionWriter: ExtractionWriter,
): Promise<ExtractionManifest> {
  const partEntries = await getPartFiles(entry)
  const addPartsPromise = Promise.all(
    partEntries.map(async (partEntry) => {
      const partFilePath = path.join(partEntry.parentPath, partEntry.name)
      const stats = await lstat(partFilePath)
      if (stats.isFile()) {
        return extractionWriter.addFragment(createReadStream(partFilePath))
      }
    }),
  )
  const legacyExtractionFilePath = path.join(entry.parentPath, entry.name)
  const reader = createReadStream(legacyExtractionFilePath, { encoding: 'utf-8' })
  for await (const chunk of reader) {
    await extractionWriter.write(chunk)
  }
  await addPartsPromise
  return extractionWriter.ack()
}

async function getPartFiles(mainEntry: Dirent<string>): Promise<Dirent<string>[]> {
  const dirPath = mainEntry.parentPath
  const entries = await readdir(dirPath, { withFileTypes: true })
  const result: Dirent<string>[] = []
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().startsWith('part-')) {
      result.push(entry)
    } else if (entry.isDirectory()) {
      const subDirPartFiles = await getPartFiles(entry)
      result.push(...subDirPartFiles)
    }
  }

  return result.sort((a, b) => {
    const aFullPath = path.join(a.parentPath, a.name)
    const bFullPath = path.join(b.parentPath, b.name)
    return aFullPath.localeCompare(bFullPath)
  })
}
