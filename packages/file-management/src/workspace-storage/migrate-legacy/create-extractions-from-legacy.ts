import { Dirent, createReadStream } from 'node:fs'
import { lstat, readdir } from 'node:fs/promises'
import path from 'node:path'

import { ExtractionMethod } from '@george-ai/app-schema'

import { logger } from '../commons'
import { getEntryPath } from '../entry'
import { createExtraction } from '../extraction'
import { ExtractionWriter } from '../extraction/extraction.writer'
import { DocumentManifest, ExtractionManifest } from '../schema'

export async function createExtractionsFromLegacy(documentManifest: DocumentManifest): Promise<ExtractionManifest[]> {
  const documentDir = getEntryPath(documentManifest)
  const entries = await readdir(documentDir, { withFileTypes: true })
  const result: Array<ExtractionManifest> = []

  const markdownFileEntries = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))

  for (const entry of markdownFileEntries) {
    let extractionMethod: ExtractionMethod | undefined

    if (entry.name.toLowerCase() === 'converted.md') {
      extractionMethod = 'legacyExtraction'
    } else if (entry.name.toLowerCase().startsWith('text-extraction')) {
      extractionMethod = 'textExtraction'
    } else if (entry.name.toLowerCase().startsWith('html-extraction')) {
      extractionMethod = 'htmlExtraction'
    } else if (entry.name.toLowerCase().startsWith('csv-extraction')) {
      extractionMethod = 'csvExtraction'
    }

    if (!extractionMethod) {
      logger.warn(
        'Skipping markdown file during legacy extraction creation as it does not match expected naming conventions',
        {
          entryName: entry.name,
          documentManifest,
        },
      )
      continue
    }
    logger.debug('Creating extraction from legacy markdown file', {
      entryName: entry.name,
      extractionMethod,
      documentManifest,
    })
    const extractionWriter = await createExtraction(documentManifest, extractionMethod)
    try {
      logger.debug('Writing extraction from legacy markdown file', {
        entryName: entry.name,
        extractionMethod,
        documentManifest,
      })
      const extractionManifest = await writeExtractionData(entry, extractionWriter)
      result.push(extractionManifest)
      logger.debug('writeExtractionData success', {
        entryName: entry.name,
        extractionManifest,
        extractionMethod,
      })
    } catch (error) {
      logger.error('Error creating legacy extraction for entry, skipping this extraction', {
        entryName: entry.name,
        documentManifest,
        error,
      })
      await extractionWriter.nack()
    }
  }
  logger.debug('Finished creating extractions from legacy markdown files', {
    documentManifest,
    result,
  })
  return result
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
        logger.debug('Adding part file to extraction from legacy markdown file', {
          partFilePath,
          entryName: entry.name,
        })
        return extractionWriter.addFragment(createReadStream(partFilePath))
      }
    }),
  )
  const legacyExtractionFilePath = path.join(entry.parentPath, entry.name)
  logger.debug('Reading legacy markdown file to write extraction', {
    legacyExtractionFilePath,
    entryName: entry.name,
  })
  const reader = createReadStream(legacyExtractionFilePath, { encoding: 'utf-8' })
  for await (const chunk of reader) {
    await extractionWriter.write(chunk)
  }
  logger.debug('Finished reading legacy markdown file to write extraction', {
    legacyExtractionFilePath,
    entryName: entry.name,
  })
  await addPartsPromise
  logger.debug('Finished adding part files to extraction from legacy markdown file', {
    legacyExtractionFilePath,
    entryName: entry.name,
  })
  return extractionWriter.ack()
}

async function getPartFiles(mainEntry: Dirent<string>): Promise<Dirent<string>[]> {
  return getPartFilesInDir(mainEntry.parentPath)
}

async function getPartFilesInDir(dirPath: string): Promise<Dirent<string>[]> {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const result: Dirent<string>[] = []
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().startsWith('part-')) {
      result.push(entry)
    } else if (entry.isDirectory()) {
      const subDirPartFiles = await getPartFilesInDir(path.join(dirPath, entry.name))
      result.push(...subDirPartFiles)
    }
  }

  return result.sort((a, b) => {
    const aFullPath = path.join(a.parentPath, a.name)
    const bFullPath = path.join(b.parentPath, b.name)
    return aFullPath.localeCompare(bFullPath)
  })
}
