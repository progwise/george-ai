/**
 * List item extraction logic.
 *
 * Handles creating AiListItem records from library files based on extraction strategy:
 * - per_file: 1 file → 1 item (default, uses file markdown directly)
 * - per_row: 1 file → N items (one per table row, content stored as .md files)
 * - per_column: 1 file → N items (one per table column, content stored as .md files)
 * - llm_prompt: 1 file → N items (LLM extracts items based on prompt, content stored as .md files)
 *
 * Content storage:
 * - per_file: No .md file, content comes from file's markdown
 * - per_row/per_column/llm_prompt: <fileDir>/listItems/<listId>/<itemId>.md
 *
 * All extraction results are logged to AiFileExtraction for debugging/transparency.
 */
import fs from 'fs'

import { type ServiceProviderType, chat } from '@george-ai/ai-service-client'
import { deleteListItemDir, getFileDir, saveListItemContent } from '@george-ai/file-management'

import { Prisma } from '../../../prisma/generated/client'
import { prisma } from '../../prisma'
import { getLatestExtractionMarkdownFileNames } from '../file/markdown'
import { logModelUsage } from '../languageModel'
import { getLibraryWorkspace } from '../workspace'

export const EXTRACTION_STRATEGIES = ['per_file', 'per_row', 'per_column', 'llm_prompt'] as const
export type ExtractionStrategy = (typeof EXTRACTION_STRATEGIES)[number]

// Internal interfaces - not exported
interface ExtractedRow {
  rowIndex: number
  headers: string[]
  values: string[]
  data: Record<string, string>
  markdown: string
}

interface ExtractedColumn {
  columnIndex: number
  columnName: string
  rowTitles: string[]
  values: string[]
  markdown: string
}

interface ExtractedLlmItem {
  itemIndex: number
  itemName: string
  content: string
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
function extractRowsFromMarkdownTable(markdown: string): ExtractedRow[] {
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
 * Format a column as markdown with row titles.
 * Output format:
 * # ColumnName
 * - RowTitle1: value1
 * - RowTitle2: value2
 */
function formatColumnAsMarkdown(columnName: string, rowTitles: string[], values: string[]): string {
  const lines = [`# ${columnName}`, '']
  for (let i = 0; i < values.length; i++) {
    const title = rowTitles[i] || `Row ${i + 1}`
    const value = values[i] || ''
    lines.push(`- ${title}: ${value}`)
  }
  return lines.join('\n')
}

/**
 * Extract columns from a markdown table.
 * First row = column headers (become item names)
 * First column = row titles (become labels for each value)
 * Each column (except first) becomes one item.
 */
function extractColumnsFromMarkdownTable(markdown: string): ExtractedColumn[] {
  if (!markdown || typeof markdown !== 'string') {
    return []
  }

  const lines = markdown.split('\n').filter((line) => line.trim().length > 0)
  const tableLines = lines.filter((line) => line.includes('|'))

  if (tableLines.length < 2) {
    return []
  }

  const headers = parseTableRow(tableLines[0])
  if (headers.length < 2) {
    // Need at least 2 columns (first for row titles, rest for items)
    return []
  }

  let dataStartIndex = 1
  if (tableLines.length > 1 && isSeparatorRow(tableLines[1])) {
    dataStartIndex = 2
  }

  // Collect all row data
  const rowTitles: string[] = []
  const rowData: string[][] = []

  for (let i = dataStartIndex; i < tableLines.length; i++) {
    const line = tableLines[i]
    if (isSeparatorRow(line)) continue

    const values = parseTableRow(line)
    rowTitles.push(values[0] || `Row ${rowData.length + 1}`)
    rowData.push(values)
  }

  // Create columns (skip first column which contains row titles)
  const columns: ExtractedColumn[] = []

  for (let colIndex = 1; colIndex < headers.length; colIndex++) {
    const columnName = headers[colIndex]
    const values = rowData.map((row) => row[colIndex] || '')

    columns.push({
      columnIndex: colIndex - 1, // 0-based index excluding the title column
      columnName,
      rowTitles,
      values,
      markdown: formatColumnAsMarkdown(columnName, rowTitles, values),
    })
  }

  return columns
}

/**
 * Parse LLM response into items.
 * Expected format: Each item starts with "## ItemName" followed by content until next "##".
 */
function extractItemsFromLlmResponse(llmResponse: string): ExtractedLlmItem[] {
  if (!llmResponse || typeof llmResponse !== 'string') {
    return []
  }

  const items: ExtractedLlmItem[] = []
  // Split by ## at the start of a line
  const sections = llmResponse.split(/^## /m).filter((s) => s.trim().length > 0)

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const firstNewline = section.indexOf('\n')

    if (firstNewline === -1) {
      // Single line - item name only, no content
      items.push({
        itemIndex: i,
        itemName: section.trim(),
        content: `## ${section.trim()}`,
      })
    } else {
      const itemName = section.substring(0, firstNewline).trim()
      const content = section.substring(firstNewline + 1).trim()
      items.push({
        itemIndex: i,
        itemName,
        content: `## ${itemName}\n\n${content}`,
      })
    }
  }

  return items
}

/**
 * Call LLM to extract items from file content.
 * Returns extracted items or throws an error.
 */
async function callLlmForExtraction({
  workspaceId,
  libraryId,
  listId,
  fileContent,
  userPrompt,
  modelId,
  modelName,
  modelProvider,
}: {
  workspaceId: string
  libraryId: string
  listId: string
  fileContent: string
  userPrompt: string
  modelId: string
  modelName: string
  modelProvider: string
}): Promise<{ items: ExtractedLlmItem[]; rawResponse: string; tokensInput?: number; tokensOutput?: number }> {
  const systemPrompt = `You are an item extraction assistant. Your task is to analyze the provided content and extract individual items based on the user's instructions.

IMPORTANT: Format your response as a series of items, where each item starts with "## " followed by the item name, then the item content on subsequent lines.

Example output format:
## Item Name 1
Content for item 1 goes here.
Can span multiple lines.

## Item Name 2
Content for item 2 goes here.

Rules:
- Each item MUST start with "## " (h2 markdown heading)
- The item name should be descriptive and unique
- Include all relevant content for each item
- Do not include any text before the first "## " heading
- Do not include explanations or meta-commentary`

  const userMessage = `${userPrompt}

Here is the content to process:

${fileContent}`

  const startTime = Date.now()

  const response = await chat(workspaceId, modelProvider as ServiceProviderType, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    modelName,
  })

  const durationMs = Date.now() - startTime

  // Log model usage
  await logModelUsage({
    modelId,
    libraryId,
    listId,
    usageType: 'chat',
    tokensInput: response.metadata?.promptTokens || response.metadata?.tokensProcessed,
    tokensOutput: response.metadata?.completionTokens,
    durationMs,
  })

  if (response.error) {
    throw new Error(`LLM error: ${response.error}`)
  }

  const rawResponse = response.content.trim()
  const items = extractItemsFromLlmResponse(rawResponse)

  return {
    items,
    rawResponse,
    tokensInput: response.metadata?.promptTokens || response.metadata?.tokensProcessed,
    tokensOutput: response.metadata?.completionTokens,
  }
}

/**
 * Save extraction metadata to AiFileExtraction table.
 */
async function saveFileExtraction({
  sourceId,
  fileId,
  extractionInput,
  extractionOutput,
  error,
  itemsCreated,
}: {
  sourceId: string
  fileId: string
  extractionInput: Prisma.InputJsonValue
  extractionOutput?: Prisma.InputJsonValue
  error?: string
  itemsCreated: number
}): Promise<void> {
  await prisma.aiFileExtraction.upsert({
    where: {
      sourceId_fileId: { sourceId, fileId },
    },
    create: {
      sourceId,
      fileId,
      extractionInput,
      extractionOutput,
      error,
      itemsCreated,
    },
    update: {
      extractionInput,
      extractionOutput,
      error,
      itemsCreated,
      updatedAt: new Date(),
    },
  })
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
 *
 * Behavior on re-processing:
 * - per_file: Skip if item exists (item is just a reference to file markdown)
 * - per_row/per_column/llm_prompt: Delete existing items and .md files, recreate
 *
 * All extraction results are logged to AiFileExtraction for debugging.
 */
export async function createListItemsForFile({
  sourceId,
  fileId,
  fileName,
  listId,
  libraryId,
  extractionStrategy,
  extractionConfig,
  extractionModel,
}: {
  sourceId: string
  fileId: string
  fileName: string
  listId: string
  libraryId: string
  extractionStrategy: ExtractionStrategy
  extractionConfig?: { prompt?: string } | null
  extractionModel?: { id: string; name: string; provider: string } | null
}): Promise<{ created: number; deleted: number; strategy: ExtractionStrategy; error?: string }> {
  // Check if items already exist for this file/source combination
  const existingItemCount = await prisma.aiListItem.count({
    where: { sourceId, sourceFileId: fileId },
  })

  // For per_file: skip if item exists (it's just a reference)
  // For other strategies: delete existing and recreate (content stored in .md files)
  if (existingItemCount > 0) {
    if (extractionStrategy === 'per_file') {
      return { created: 0, deleted: 0, strategy: extractionStrategy }
    }

    // Delete existing items and their .md files
    await prisma.aiListItem.deleteMany({
      where: { sourceId, sourceFileId: fileId },
    })
    await deleteListItemDir({ fileId, libraryId, listId })
  }

  const deletedCount = extractionStrategy !== 'per_file' ? existingItemCount : 0
  const markdown = extractionStrategy !== 'per_file' ? await getFileMarkdownContent(fileId, libraryId) : null

  // Build extraction input for logging
  const extractionInput = {
    strategy: extractionStrategy,
    fileId,
    fileName,
    contentLength: markdown?.length || 0,
    contentPreview: markdown?.substring(0, 500),
    ...(extractionStrategy === 'llm_prompt' && {
      llmPrompt: extractionConfig?.prompt,
      llmModel: extractionModel?.name,
      llmProvider: extractionModel?.provider,
    }),
  }

  // === per_file strategy ===
  if (extractionStrategy === 'per_file') {
    await prisma.aiListItem.create({
      data: { listId, sourceId, sourceFileId: fileId },
    })
    await saveFileExtraction({
      sourceId,
      fileId,
      extractionInput,
      extractionOutput: { itemsFound: 1, itemNames: [fileName] },
      itemsCreated: 1,
    })
    return { created: 1, deleted: deletedCount, strategy: 'per_file' }
  }

  // For other strategies, we need markdown content
  if (!markdown) {
    await prisma.aiListItem.create({
      data: { listId, sourceId, sourceFileId: fileId, metadata: { fallback: 'no_markdown_content' } },
    })
    await saveFileExtraction({
      sourceId,
      fileId,
      extractionInput,
      extractionOutput: {
        itemsFound: 1,
        itemNames: [fileName],
        warnings: ['no_markdown_content, fell back to per_file'],
      },
      itemsCreated: 1,
    })
    return { created: 1, deleted: deletedCount, strategy: 'per_file' }
  }

  // === per_row strategy ===
  if (extractionStrategy === 'per_row') {
    const rows = extractRowsFromMarkdownTable(markdown)

    if (rows.length === 0) {
      await prisma.aiListItem.create({
        data: { listId, sourceId, sourceFileId: fileId, metadata: { fallback: 'no_table_rows' } },
      })
      await saveFileExtraction({
        sourceId,
        fileId,
        extractionInput,
        extractionOutput: { itemsFound: 1, itemNames: [fileName], warnings: ['no_table_rows, fell back to per_file'] },
        itemsCreated: 1,
      })
      return { created: 1, deleted: deletedCount, strategy: 'per_file' }
    }

    const itemNames: string[] = []
    for (const row of rows) {
      const item = await prisma.aiListItem.create({
        data: {
          listId,
          sourceId,
          sourceFileId: fileId,
          extractionIndex: row.rowIndex,
          metadata: { headers: row.headers, values: row.values },
        },
      })
      await saveListItemContent({ fileId, libraryId, listId, itemId: item.id, content: row.markdown })
      itemNames.push(row.values[0] || `Row ${row.rowIndex + 1}`)
    }

    await saveFileExtraction({
      sourceId,
      fileId,
      extractionInput,
      extractionOutput: { itemsFound: rows.length, itemNames },
      itemsCreated: rows.length,
    })
    return { created: rows.length, deleted: deletedCount, strategy: 'per_row' }
  }

  // === per_column strategy ===
  if (extractionStrategy === 'per_column') {
    const columns = extractColumnsFromMarkdownTable(markdown)

    if (columns.length === 0) {
      await prisma.aiListItem.create({
        data: { listId, sourceId, sourceFileId: fileId, metadata: { fallback: 'no_table_columns' } },
      })
      await saveFileExtraction({
        sourceId,
        fileId,
        extractionInput,
        extractionOutput: {
          itemsFound: 1,
          itemNames: [fileName],
          warnings: ['no_table_columns, fell back to per_file'],
        },
        itemsCreated: 1,
      })
      return { created: 1, deleted: deletedCount, strategy: 'per_file' }
    }

    const itemNames: string[] = []
    for (const column of columns) {
      const item = await prisma.aiListItem.create({
        data: {
          listId,
          sourceId,
          sourceFileId: fileId,
          extractionIndex: column.columnIndex,
          metadata: { columnName: column.columnName, rowTitles: column.rowTitles, values: column.values },
        },
      })
      await saveListItemContent({ fileId, libraryId, listId, itemId: item.id, content: column.markdown })
      itemNames.push(column.columnName)
    }

    await saveFileExtraction({
      sourceId,
      fileId,
      extractionInput,
      extractionOutput: { itemsFound: columns.length, itemNames },
      itemsCreated: columns.length,
    })
    return { created: columns.length, deleted: deletedCount, strategy: 'per_column' }
  }

  // === llm_prompt strategy ===
  if (extractionStrategy === 'llm_prompt') {
    const userPrompt = extractionConfig?.prompt
    if (!userPrompt) {
      await saveFileExtraction({
        sourceId,
        fileId,
        extractionInput,
        error: 'No extraction prompt configured',
        itemsCreated: 0,
      })
      return { created: 0, deleted: deletedCount, strategy: 'llm_prompt', error: 'No extraction prompt configured' }
    }

    if (!extractionModel) {
      await saveFileExtraction({
        sourceId,
        fileId,
        extractionInput,
        error: 'No extraction model configured on library',
        itemsCreated: 0,
      })
      return {
        created: 0,
        deleted: deletedCount,
        strategy: 'llm_prompt',
        error: 'No extraction model configured on library',
      }
    }

    // Get workspace for LLM call
    const workspaceId = await getLibraryWorkspace(libraryId)
    if (!workspaceId) {
      await saveFileExtraction({
        sourceId,
        fileId,
        extractionInput,
        error: 'Library has no workspace',
        itemsCreated: 0,
      })
      return { created: 0, deleted: deletedCount, strategy: 'llm_prompt', error: 'Library has no workspace' }
    }

    try {
      const llmResult = await callLlmForExtraction({
        workspaceId,
        libraryId,
        listId,
        fileContent: markdown,
        userPrompt,
        modelId: extractionModel.id,
        modelName: extractionModel.name,
        modelProvider: extractionModel.provider,
      })

      if (llmResult.items.length === 0) {
        await saveFileExtraction({
          sourceId,
          fileId,
          extractionInput,
          extractionOutput: {
            itemsFound: 0,
            rawLlmResponse: llmResult.rawResponse,
            warnings: ['LLM returned no valid items (no ## headings found)'],
          },
          itemsCreated: 0,
        })
        return { created: 0, deleted: deletedCount, strategy: 'llm_prompt', error: 'LLM returned no valid items' }
      }

      const itemNames: string[] = []
      for (const llmItem of llmResult.items) {
        const item = await prisma.aiListItem.create({
          data: {
            listId,
            sourceId,
            sourceFileId: fileId,
            extractionIndex: llmItem.itemIndex,
            metadata: { itemName: llmItem.itemName },
          },
        })
        await saveListItemContent({ fileId, libraryId, listId, itemId: item.id, content: llmItem.content })
        itemNames.push(llmItem.itemName)
      }

      await saveFileExtraction({
        sourceId,
        fileId,
        extractionInput,
        extractionOutput: {
          itemsFound: llmResult.items.length,
          itemNames,
          rawLlmResponse: llmResult.rawResponse,
          tokensInput: llmResult.tokensInput,
          tokensOutput: llmResult.tokensOutput,
        },
        itemsCreated: llmResult.items.length,
      })
      return { created: llmResult.items.length, deleted: deletedCount, strategy: 'llm_prompt' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown LLM error'
      await saveFileExtraction({
        sourceId,
        fileId,
        extractionInput,
        error: errorMessage,
        itemsCreated: 0,
      })
      return { created: 0, deleted: deletedCount, strategy: 'llm_prompt', error: errorMessage }
    }
  }

  // Unknown strategy, default to per_file
  await prisma.aiListItem.create({
    data: { listId, sourceId, sourceFileId: fileId },
  })
  await saveFileExtraction({
    sourceId,
    fileId,
    extractionInput: { ...extractionInput, warnings: ['unknown_strategy, fell back to per_file'] },
    extractionOutput: { itemsFound: 1, itemNames: [fileName] },
    itemsCreated: 1,
  })
  return { created: 1, deleted: deletedCount, strategy: 'per_file' }
}

/**
 * Create list items for all files in a list source.
 */
export async function createListItemsForSource(sourceId: string): Promise<{ created: number; files: number }> {
  const source = await prisma.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
    include: {
      library: {
        include: {
          extractionModel: { select: { id: true, name: true, provider: true } },
        },
      },
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
    select: { id: true, name: true },
  })

  let totalCreated = 0
  const strategy = (source.extractionStrategy as ExtractionStrategy) || 'per_file'
  const extractionConfig = source.extractionConfig as { prompt?: string } | null
  const extractionModel = source.library.extractionModel

  for (const file of files) {
    const result = await createListItemsForFile({
      sourceId,
      fileId: file.id,
      fileName: file.name,
      listId: source.listId,
      libraryId: source.libraryId,
      extractionStrategy: strategy,
      extractionConfig,
      extractionModel,
    })
    totalCreated += result.created
  }

  return { created: totalCreated, files: files.length }
}

/**
 * Refresh list items for a source (delete existing and recreate).
 * Also cleans up .md files for per_row items.
 */
export async function refreshListItemsForSource(sourceId: string): Promise<{ created: number; deleted: number }> {
  const source = await prisma.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
    include: {
      items: { select: { sourceFileId: true } },
    },
  })

  if (!source.libraryId) {
    return { created: 0, deleted: 0 }
  }

  // Get unique file IDs for cleanup
  const fileIds = [...new Set(source.items.map((item) => item.sourceFileId))]

  // Delete .md files for each file's listItems/<listId>/ directory
  for (const fileId of fileIds) {
    await deleteListItemDir({ fileId, libraryId: source.libraryId, listId: source.listId })
  }

  // Delete existing items from database
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
  // Get file info
  const file = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
    select: { name: true },
  })

  if (!file) {
    return { created: 0, sources: 0 }
  }

  // Find all list sources that link to this library, with library extraction model
  const sources = await prisma.aiListSource.findMany({
    where: { libraryId },
    include: {
      library: {
        include: {
          extractionModel: { select: { id: true, name: true, provider: true } },
        },
      },
    },
  })

  if (sources.length === 0) {
    return { created: 0, sources: 0 }
  }

  let totalCreated = 0

  for (const source of sources) {
    const strategy = (source.extractionStrategy as ExtractionStrategy) || 'per_file'
    const extractionConfig = source.extractionConfig as { prompt?: string } | null
    const extractionModel = source.library?.extractionModel

    const result = await createListItemsForFile({
      sourceId: source.id,
      fileId,
      fileName: file.name,
      listId: source.listId,
      libraryId,
      extractionStrategy: strategy,
      extractionConfig,
      extractionModel,
    })
    totalCreated += result.created
  }

  return { created: totalCreated, sources: sources.length }
}
