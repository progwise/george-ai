/**
 * List item extraction logic.
 *
 * Handles creating AiListItem records from library files based on extraction strategy:
 * - per_file: 1 file → 1 item (default)
 * - per_row: 1 file → N items (one per table row)
 */
import fs from 'fs'

import { getFileDir } from '@george-ai/file-management'

import { prisma } from '../../prisma'
import { getLatestExtractionMarkdownFileNames } from '../file/markdown'

export const EXTRACTION_STRATEGIES = ['per_file', 'per_row'] as const
export type ExtractionStrategy = (typeof EXTRACTION_STRATEGIES)[number]

export interface ExtractedRow {
  rowIndex: number
  headers: string[]
  values: string[]
  data: Record<string, string>
  markdown: string
}

/**
 * Parse a markdown table row into cells.
 */
function parseTableRow(row: string): string[] {
  const trimmed = row.trim().replace(/^\||\|$/g, '')
  const cells: string[] = []
  let currentCell = ''
  let i = 0

  while (i < trimmed.length) {
    if (trimmed[i] === '\\' && i + 1 < trimmed.length && trimmed[i + 1] === '|') {
      currentCell += '|'
      i += 2
    } else if (trimmed[i] === '|') {
      cells.push(currentCell.trim())
      currentCell = ''
      i++
    } else {
      currentCell += trimmed[i]
      i++
    }
  }
  cells.push(currentCell.trim())
  return cells
}

/**
 * Check if a row is a separator row (contains only dashes and pipes).
 */
function isSeparatorRow(row: string): boolean {
  const trimmed = row.trim()
  return /^[\s|:-]+$/.test(trimmed) && trimmed.includes('-')
}

/**
 * Format a single row as a standalone markdown table.
 */
function formatRowAsMarkdown(headers: string[], values: string[]): string {
  const escapedHeaders = headers.map((h) => h.replace(/\|/g, '\\|'))
  const escapedValues = values.map((v) => (v || '').replace(/\|/g, '\\|'))

  while (escapedValues.length < escapedHeaders.length) {
    escapedValues.push('')
  }

  const headerRow = '| ' + escapedHeaders.join(' | ') + ' |'
  const separatorRow = '| ' + escapedHeaders.map(() => '---').join(' | ') + ' |'
  const dataRow = '| ' + escapedValues.join(' | ') + ' |'

  return `${headerRow}\n${separatorRow}\n${dataRow}`
}

/**
 * Extract rows from a markdown table.
 */
export function extractRowsFromMarkdownTable(markdown: string): ExtractedRow[] {
  if (!markdown || typeof markdown !== 'string') {
    return []
  }

  const lines = markdown.split('\n').filter((line) => line.trim().length > 0)
  const tableLines = lines.filter((line) => line.includes('|'))

  if (tableLines.length < 2) {
    return []
  }

  const headers = parseTableRow(tableLines[0])
  if (headers.length === 0) {
    return []
  }

  let dataStartIndex = 1
  if (tableLines.length > 1 && isSeparatorRow(tableLines[1])) {
    dataStartIndex = 2
  }

  const rows: ExtractedRow[] = []

  for (let i = dataStartIndex; i < tableLines.length; i++) {
    const line = tableLines[i]
    if (isSeparatorRow(line)) continue

    const values = parseTableRow(line)
    const data: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      data[headers[j]] = values[j] || ''
    }

    rows.push({
      rowIndex: rows.length,
      headers,
      values,
      data,
      markdown: formatRowAsMarkdown(headers, values),
    })
  }

  return rows
}

/**
 * Get markdown content for a file.
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
 * Create list items for a file based on extraction strategy.
 */
export async function createListItemsForFile({
  sourceId,
  fileId,
  listId,
  libraryId,
  extractionStrategy,
}: {
  sourceId: string
  fileId: string
  listId: string
  libraryId: string
  extractionStrategy: ExtractionStrategy
}): Promise<{ created: number; strategy: ExtractionStrategy }> {
  // Check if items already exist for this file/source combination
  const existingItems = await prisma.aiListItem.count({
    where: { sourceId, sourceFileId: fileId },
  })

  if (existingItems > 0) {
    // Items already exist, skip
    return { created: 0, strategy: extractionStrategy }
  }

  if (extractionStrategy === 'per_file') {
    // Simple: 1 file = 1 item
    await prisma.aiListItem.create({
      data: {
        listId,
        sourceId,
        sourceFileId: fileId,
        // extractionIndex, content, metadata are null for per_file (uses file markdown directly)
      },
    })
    return { created: 1, strategy: 'per_file' }
  }

  if (extractionStrategy === 'per_row') {
    const markdown = await getFileMarkdownContent(fileId, libraryId)

    if (!markdown) {
      // No markdown content, fall back to per_file
      await prisma.aiListItem.create({
        data: {
          listId,
          sourceId,
          sourceFileId: fileId,
          metadata: { fallback: 'no_markdown_content' },
        },
      })
      return { created: 1, strategy: 'per_file' }
    }

    const rows = extractRowsFromMarkdownTable(markdown)

    if (rows.length === 0) {
      // No table rows found, fall back to per_file
      await prisma.aiListItem.create({
        data: {
          listId,
          sourceId,
          sourceFileId: fileId,
          metadata: { fallback: 'no_table_rows' },
        },
      })
      return { created: 1, strategy: 'per_file' }
    }

    // Create one item per row
    await prisma.aiListItem.createMany({
      data: rows.map((row) => ({
        listId,
        sourceId,
        sourceFileId: fileId,
        extractionIndex: row.rowIndex,
        content: row.markdown,
        metadata: { headers: row.headers, values: row.values },
      })),
    })

    return { created: rows.length, strategy: 'per_row' }
  }

  // Unknown strategy, default to per_file
  await prisma.aiListItem.create({
    data: {
      listId,
      sourceId,
      sourceFileId: fileId,
    },
  })
  return { created: 1, strategy: 'per_file' }
}

/**
 * Create list items for all files in a list source.
 */
export async function createListItemsForSource(sourceId: string): Promise<{ created: number; files: number }> {
  const source = await prisma.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
    include: {
      library: true,
    },
  })

  if (!source.libraryId || !source.library) {
    return { created: 0, files: 0 }
  }

  const files = await prisma.aiLibraryFile.findMany({
    where: {
      libraryId: source.libraryId,
      archivedAt: null,
    },
    select: { id: true },
  })

  let totalCreated = 0
  const strategy = (source.extractionStrategy as ExtractionStrategy) || 'per_file'

  for (const file of files) {
    const result = await createListItemsForFile({
      sourceId,
      fileId: file.id,
      listId: source.listId,
      libraryId: source.libraryId,
      extractionStrategy: strategy,
    })
    totalCreated += result.created
  }

  return { created: totalCreated, files: files.length }
}

/**
 * Refresh list items for a source (delete existing and recreate).
 */
export async function refreshListItemsForSource(sourceId: string): Promise<{ created: number; deleted: number }> {
  // Delete existing items for this source
  const deleted = await prisma.aiListItem.deleteMany({
    where: { sourceId },
  })

  // Create new items
  const { created } = await createListItemsForSource(sourceId)

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
  // Find all list sources that link to this library
  const sources = await prisma.aiListSource.findMany({
    where: { libraryId },
  })

  if (sources.length === 0) {
    return { created: 0, sources: 0 }
  }

  let totalCreated = 0

  for (const source of sources) {
    const strategy = (source.extractionStrategy as ExtractionStrategy) || 'per_file'
    const result = await createListItemsForFile({
      sourceId: source.id,
      fileId,
      listId: source.listId,
      libraryId,
      extractionStrategy: strategy,
    })
    totalCreated += result.created
  }

  return { created: totalCreated, sources: sources.length }
}
