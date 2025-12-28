/**
 * List item extraction logic (Simplified Architecture)
 *
 * Creates AiListItem records from library files:
 * - One list item per file part (for bucketed files like CSV rows)
 * - One list item per whole file (for unbucketed files)
 * - AiListItem.extractionIndex points to part number (or null for whole file)
 *
 * Content is read directly from file parts - no markdown duplication.
 */
import fs from 'fs'
import path from 'node:path'

import { prisma } from '@george-ai/app-domain'
import { getAvailableExtractions, getBucketPath, getExtractionFileInfo, getFileDir } from '@george-ai/file-management'

import { syncAutomationItemsForList } from '../automation'
import { getLatestExtractionMarkdownFileNames } from '../file/markdown'

/**
 * Get markdown content for a file (whole file, not parts).
 */
export async function getFileMarkdownContent(fileId: string, libraryId: string): Promise<string | null> {
  const markdownFileNames = await getLatestExtractionMarkdownFileNames({ fileId, libraryId })

  if (markdownFileNames.length === 0) {
    return null
  }

  const fileDir = getFileDir({ fileId, libraryId })
  const markdownPath = `${fileDir}/${markdownFileNames[0]}`

  try {
    return await fs.promises.readFile(markdownPath, 'utf-8')
  } catch {
    return null
  }
}

/**
 * Get markdown content for a file part (bucketed files).
 */
export async function getFilePartMarkdownContent({
  fileId,
  libraryId,
  partIndex,
  extractionMethod,
  extractionMethodParameter,
}: {
  fileId: string
  libraryId: string
  partIndex: number
  extractionMethod: string
  extractionMethodParameter?: string
}): Promise<string | null> {
  const bucketPath = getBucketPath({
    libraryId,
    fileId,
    extractionMethod,
    extractionMethodParameter,
    part: partIndex,
  })

  const partFileName = `part-${partIndex.toString().padStart(7, '0')}.md`
  const partFilePath = path.join(bucketPath, partFileName)

  try {
    return await fs.promises.readFile(partFilePath, 'utf-8')
  } catch {
    return null
  }
}

/**
 * Create list items for a file.
 *
 * Logic:
 * 1. Check available extractions for the file
 * 2. For each extraction, get file info (total parts, etc.)
 * 3. Create one list item per part (or one item for whole file if no parts)
 *
 * @returns Number of items created
 */
async function createListItemsForFile({
  sourceId,
  fileId,
  fileName,
  listId,
  libraryId,
}: {
  sourceId: string
  fileId: string
  fileName: string
  listId: string
  libraryId: string
}): Promise<number> {
  // Check if items already exist for this file/source combination
  const existingItemCount = await prisma.aiListItem.count({
    where: { sourceId, sourceFileId: fileId },
  })

  // Skip if items already exist
  if (existingItemCount > 0) {
    return 0
  }

  // Get available extractions for this file
  const extractions = await getAvailableExtractions({ fileId, libraryId })

  if (extractions.length === 0) {
    // No extractions found - file not processed yet
    return 0
  }

  // Use first extraction (typically there's only one)
  const extraction = extractions[0]

  // Get extraction metadata
  const extractionInfo = await getExtractionFileInfo({
    fileId,
    libraryId,
    extractionMethod: extraction.extractionMethod,
    extractionMethodParameter: extraction.extractionMethodParameter || undefined,
  })

  if (!extractionInfo) {
    // No metadata found - file not processed correctly
    return 0
  }

  let itemsCreated = 0

  if (extractionInfo.isBucketed && extractionInfo.totalParts > 0) {
    // Bucketed file - create one item per part
    for (let partIndex = 1; partIndex <= extractionInfo.totalParts; partIndex++) {
      // Read the part to get a meaningful item name (first line or first heading)
      let itemName = `${fileName} - Part ${partIndex}`

      try {
        // Read the part markdown file directly
        const bucketPath = getBucketPath({
          libraryId,
          fileId,
          extractionMethod: extraction.extractionMethod,
          extractionMethodParameter: extraction.extractionMethodParameter || undefined,
          part: partIndex,
        })
        const partFileName = `part-${partIndex.toString().padStart(7, '0')}.md`
        const partFilePath = path.join(bucketPath, partFileName)
        const partContent = await fs.promises.readFile(partFilePath, 'utf-8')

        if (partContent) {
          // Try to extract a meaningful name from the first heading
          const firstHeadingMatch = partContent.match(/^##?\s+(.+)$/m)
          if (firstHeadingMatch) {
            itemName = firstHeadingMatch[1].trim()
          }
        }
      } catch (error) {
        console.warn(`Failed to read part ${partIndex} for file ${fileId}:`, error)
        // Continue with default name
      }

      await prisma.aiListItem.create({
        data: {
          listId,
          sourceId,
          sourceFileId: fileId,
          extractionIndex: partIndex,
          itemName,
          metadata: {
            extractionMethod: extraction.extractionMethod,
            extractionMethodParameter: extraction.extractionMethodParameter || undefined,
          },
        },
      })

      itemsCreated++
    }
  } else {
    // Unbucketed file - create one item for whole file
    await prisma.aiListItem.create({
      data: {
        listId,
        sourceId,
        sourceFileId: fileId,
        extractionIndex: null, // Whole file
        itemName: fileName,
        metadata: {
          extractionMethod: extraction.extractionMethod,
          extractionMethodParameter: extraction.extractionMethodParameter || undefined,
        },
      },
    })

    itemsCreated++
  }

  return itemsCreated
}

/**
 * Create list items for all files in a list source.
 */
export async function createListItemsForSource(sourceId: string): Promise<{ created: number; files: number }> {
  const source = await prisma.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
  })

  if (!source.libraryId) {
    return { created: 0, files: 0 }
  }

  const files = await prisma.aiLibraryFile.findMany({
    where: {
      libraryId: source.libraryId,
      archivedAt: null,
    },
    select: { id: true, name: true },
  })

  let totalCreated = 0

  for (const file of files) {
    const created = await createListItemsForFile({
      sourceId,
      fileId: file.id,
      fileName: file.name,
      listId: source.listId,
      libraryId: source.libraryId,
    })
    totalCreated += created
  }

  return { created: totalCreated, files: files.length }
}

/**
 * Refresh list items for a source (delete existing and recreate).
 */
export async function refreshListItemsForSource(sourceId: string): Promise<{ created: number; deleted: number }> {
  const source = await prisma.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
  })

  if (!source.libraryId) {
    return { created: 0, deleted: 0 }
  }

  // Delete existing items from database
  const deleted = await prisma.aiListItem.deleteMany({
    where: { sourceId },
  })

  // Create new items
  const { created } = await createListItemsForSource(sourceId)

  // Sync automation items for the list
  await syncAutomationItemsForList(source.listId)

  return { created, deleted: deleted.count }
}

/**
 * Create list items for a file across all list sources that link to its library.
 * Called after file processing (markdown extraction) completes.
 */
export async function createListItemsForProcessedFile(
  fileId: string,
  libraryId: string,
): Promise<{ created: number; sources: number }> {
  // Get file info
  const file = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
    select: { name: true },
  })

  if (!file) {
    return { created: 0, sources: 0 }
  }

  // Find all list sources that link to this library
  const sources = await prisma.aiListSource.findMany({
    where: { libraryId },
  })

  if (sources.length === 0) {
    return { created: 0, sources: 0 }
  }

  let totalCreated = 0

  for (const source of sources) {
    const created = await createListItemsForFile({
      sourceId: source.id,
      fileId,
      fileName: file.name,
      listId: source.listId,
      libraryId,
    })
    totalCreated += created

    // Sync automation items for the list
    await syncAutomationItemsForList(source.listId)
  }

  return { created: totalCreated, sources: sources.length }
}
