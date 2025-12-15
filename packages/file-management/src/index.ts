import fs from 'fs'
import path from 'node:path'

import { getFileCreationDate } from './file-utils'

export const BUCKET_SIZE = 100

interface ExtractionMetadata {
  extractionMethod: string
  extractionMethodParameter: string | null
  totalParts: number
  totalSize: number
  createdAt: string
  lastUpdated: string
}

export const getUploadsDir = () => {
  const dir = process.env.UPLOADS_PATH || './uploads'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export const getLibraryDir = (libraryId: string) => {
  const uploadsDir = getUploadsDir()
  const libraryDir = `${uploadsDir}/${libraryId}`
  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true })
  }
  return libraryDir
}

export const getFileDir = ({
  fileId,
  libraryId,
  errorIfNotExists = false,
}: {
  fileId: string
  libraryId: string
  errorIfNotExists?: boolean
}) => {
  const libraryDir = getLibraryDir(libraryId)
  const fileDir = `${libraryDir}/${fileId}`
  if (fs.existsSync(fileDir)) {
    return fileDir
  } else if (errorIfNotExists) {
    throw new Error('Directory does not exist')
  }
  fs.mkdirSync(fileDir, { recursive: true })
  return fileDir
}

export const fileDirExists = (fileId: string, libraryId: string) => {
  const libraryDir = getLibraryDir(libraryId)
  const fileDir = `${libraryDir}/${fileId}`
  return fs.existsSync(fileDir)
}

export const fileDirIsEmpty = async (fileId: string, libraryId: string) => {
  if (!fileDirExists(fileId, libraryId)) {
    return true
  }
  const fileDir = getFileDir({ fileId, libraryId })
  const files = await fs.promises.readdir(fileDir)
  return files.length === 0
}

export const deleteFileDir = async (fileId: string, libraryId: string) => {
  const fileDir = getFileDir({ fileId, libraryId, errorIfNotExists: true })
  await fs.promises.rm(fileDir, { recursive: true, force: true })
}

export const getUploadFilePath = ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileDir = getFileDir({ fileId, libraryId })
  return `${fileDir}/upload`
}

const getExtractionMainName = ({
  extractionMethod,
  extractionMethodParameter,
}: {
  extractionMethod: string
  extractionMethodParameter?: string // e.g., model name to keep more than one file per method
}) => {
  return extractionMethod + (extractionMethodParameter !== undefined ? '_' + extractionMethodParameter : '')
}

export const parseExtractionMainName = (
  mainName: string,
): {
  extractionMethod: string
  extractionMethodParameter: string | null
} => {
  const parts = mainName.split('_')

  if (parts.length === 1) {
    return {
      extractionMethod: parts[0],
      extractionMethodParameter: null,
    }
  }

  // First part is method, rest is parameter (handles underscores in parameter)
  const extractionMethod = parts[0]
  const extractionMethodParameter = parts.slice(1).join('_')

  return { extractionMethod, extractionMethodParameter }
}

export const getBucketPath = (args: {
  libraryId: string
  fileId: string
  extractionMethod: string
  extractionMethodParameter?: string // e.g., model name to keep more than one file per method
  part: number
}) => {
  const { libraryId, fileId, extractionMethod, extractionMethodParameter, part } = args

  const mainName = getExtractionMainName({ extractionMethod, extractionMethodParameter })
  const baseDir = getFileDir({ libraryId, fileId })
  const bucketDirName = Math.floor((part - 1) / BUCKET_SIZE) * BUCKET_SIZE + 1

  return path.join(baseDir, `${mainName}_buckets`, `bucket-${bucketDirName.toString().padStart(7, '0')}`)
}

export const saveMarkdownContent = async (args: {
  fileId: string
  libraryId: string
  markdown: string
  extractionMethod: string
  extractionMethodParameter?: string // e.g., model name to keep more than one file per method
  part?: number // undefined if you want a single file without bucketing
}): Promise<string> => {
  const { fileId, libraryId, markdown, extractionMethod, extractionMethodParameter, part } = args

  const mainName = getExtractionMainName({ extractionMethod, extractionMethodParameter })
  const mainFileName = `${mainName}.md`
  const fileDir = getFileDir({ fileId, libraryId })
  const mainFilePath = path.join(fileDir, mainFileName)

  // Single file (no bucketing)
  if (part === undefined || part < 1) {
    await fs.promises.writeFile(mainFilePath, markdown, 'utf-8')
    return mainFileName
  }

  // Bucketed file - save part
  const bucketPath = getBucketPath({ libraryId, fileId, extractionMethod, extractionMethodParameter, part })
  await fs.promises.mkdir(bucketPath, { recursive: true })
  const partFileName = `part-${part.toString().padStart(7, '0')}.md`
  const partFilePath = path.join(bucketPath, partFileName)
  await fs.promises.writeFile(partFilePath, markdown, 'utf-8')

  // Read existing metadata from main file (if exists)
  let currentTotalParts = 0
  let currentTotalSize = 0
  let createdAt = new Date().toISOString()

  if (fs.existsSync(mainFilePath)) {
    const mainFileContent = await fs.promises.readFile(mainFilePath, 'utf-8')

    // Try new JSON code block format first
    let metadataMatch = mainFileContent.match(/## Metadata\s*```json\s*([\s\S]+?)\s*```/)
    if (!metadataMatch) {
      // Fallback to old HTML comment format for backwards compatibility
      metadataMatch = mainFileContent.match(/<!-- METADATA\n([\s\S]+?)\n-->/)
    }

    if (metadataMatch) {
      try {
        const existingMetadata: ExtractionMetadata = JSON.parse(metadataMatch[1])
        currentTotalParts = existingMetadata.totalParts || 0
        currentTotalSize = existingMetadata.totalSize || 0
        createdAt = existingMetadata.createdAt || createdAt
      } catch (error) {
        console.warn(`Failed to parse metadata from ${mainFilePath}:`, error)
      }
    }
  }

  // Increment with current part
  const currentPartSize = Buffer.byteLength(markdown, 'utf-8')
  const newTotalParts = currentTotalParts + 1
  const newTotalSize = currentTotalSize + currentPartSize

  // Write updated metadata
  const metadata: ExtractionMetadata = {
    extractionMethod,
    extractionMethodParameter: extractionMethodParameter || null,
    totalParts: newTotalParts,
    totalSize: newTotalSize,
    createdAt,
    lastUpdated: new Date().toISOString(),
  }

  const extractionDisplayName = extractionMethod
    .replace('-extraction', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const mainFileContent = `# ${extractionDisplayName} Extraction${extractionMethodParameter ? ` - ${extractionMethodParameter}` : ''}

This file contains **${newTotalParts.toLocaleString()} parts** organized into **${Math.ceil(newTotalParts / BUCKET_SIZE).toLocaleString()} buckets** (${BUCKET_SIZE} parts per bucket).

## Summary

| Property | Value |
|----------|-------|
| **Total Parts** | ${newTotalParts.toLocaleString()} |
| **Total Size** | ${(newTotalSize / 1024 / 1024).toFixed(2)} MB |
| **Extraction Method** | ${extractionMethod}${extractionMethodParameter ? ` (${extractionMethodParameter})` : ''} |
| **Created** | ${new Date(createdAt).toLocaleString()} |
| **Last Updated** | ${new Date().toLocaleString()} |

## Accessing Parts

Use the GraphQL API \`availableExtractions\` field or the backend route to access specific parts:

\`\`\`graphql
query GetFile($fileId: String!) {
  aiLibraryFile(fileId: $fileId) {
    availableExtractions {
      extractionMethod
      totalParts
      mainFileUrl
    }
  }
}
\`\`\`

## Metadata

\`\`\`json
${JSON.stringify(metadata, null, 2)}
\`\`\`
`

  await fs.promises.writeFile(mainFilePath, mainFileContent, 'utf-8')

  return mainFileName
}

const cleanupFileDir = async (fileDir: string, mainName: string) => {
  // find latest main file among all existing files matching mainName_*.md and remove others and rename it to mainName.md
  const files = await fs.promises.readdir(fileDir)
  const matchingFiles = files.filter((file) => file.startsWith(mainName) && file.endsWith('.md'))
  if (matchingFiles.length <= 1) {
    return
  }
  let latestFile: { name: string; mtime: number } | null = null
  for (const file of matchingFiles) {
    const filePath = path.join(fileDir, file)
    const stats = await fs.promises.stat(filePath)
    if (!latestFile || stats.mtimeMs > latestFile.mtime) {
      latestFile = { name: file, mtime: stats.mtimeMs }
    }
  }
  if (latestFile) {
    for (const file of matchingFiles) {
      if (file !== latestFile.name) {
        const filePath = path.join(fileDir, file)
        await fs.promises.unlink(filePath)
      }
    }
    const latestFilePath = path.join(fileDir, latestFile.name)
    const mainFilePath = path.join(fileDir, `${mainName}.md`)
    if (latestFile.name !== `${mainName}.md`) {
      await fs.promises.rename(latestFilePath, mainFilePath)
    }
  }
}

const getBucketsInfo = async (args: { fileDir: string; mainName: string }) => {
  const { fileDir, mainName } = args
  const bucketsDir = path.join(fileDir, `${mainName}_buckets`)

  if (!fs.existsSync(bucketsDir)) {
    return null
  }
  const bucketDirs = await fs.promises.readdir(bucketsDir)
  const bucketDirsPromises: Promise<{ partCount: number; partSize: number }>[] = []
  for (const bucketDir of bucketDirs) {
    const bucketDirPath = path.join(bucketsDir, bucketDir)
    const promise = fs.promises.readdir(bucketDirPath).then(async (partFiles) => {
      let bucketPartCount = 0
      let bucketPartSize = 0
      for (const partFile of partFiles) {
        const partFilePath = path.join(bucketDirPath, partFile)
        const stats = await fs.promises.stat(partFilePath)
        bucketPartCount += 1
        bucketPartSize += stats.size
      }
      return { partCount: bucketPartCount, partSize: bucketPartSize }
    })
    bucketDirsPromises.push(promise)
  }
  const bucketsResults = await Promise.all(bucketDirsPromises)
  return bucketsResults.map((res, index) => ({
    bucketIndex: index,
    partCount: res.partCount,
    partSize: res.partSize,
  }))
}

export const getExtractionFileInfo = async ({
  fileId,
  libraryId,
  extractionMethod,
  extractionMethodParameter,
}: {
  fileId: string
  libraryId: string
  extractionMethod: string
  extractionMethodParameter?: string // e.g., model name to keep more than one file per method
}) => {
  const mainName = getExtractionMainName({ extractionMethod, extractionMethodParameter })
  const fileDir = getFileDir({ fileId, libraryId })
  await cleanupFileDir(fileDir, mainName)

  const mainFileName = `${mainName}.md`
  const mainFilePath = path.join(fileDir, mainFileName)

  if (!fs.existsSync(mainFilePath)) {
    throw new Error('Extraction file does not exist')
  }

  const mainFileSize = (await fs.promises.stat(mainFilePath)).size
  const lastModified = await getFileCreationDate(mainFilePath)

  // Try to read metadata from main file (fast path)
  const mainFileContent = await fs.promises.readFile(mainFilePath, 'utf-8')

  // Try new JSON code block format first
  let metadataMatch = mainFileContent.match(/## Metadata\s*```json\s*([\s\S]+?)\s*```/)
  if (!metadataMatch) {
    // Fallback to old HTML comment format for backwards compatibility
    metadataMatch = mainFileContent.match(/<!-- METADATA\n([\s\S]+?)\n-->/)
  }

  if (metadataMatch) {
    // Use cached metadata (fast!)
    const metadata: ExtractionMetadata = JSON.parse(metadataMatch[1])
    return {
      mainFileName,
      mainFileSize,
      lastModified,
      extractionMethod: metadata.extractionMethod,
      extractionMethodParameter: metadata.extractionMethodParameter,
      totalParts: metadata.totalParts,
      totalSize: metadata.totalSize,
      isBucketed: true,
    }
  } else {
    // Fallback: scan buckets (slow path for old files or single files)
    const buckets = await getBucketsInfo({ fileDir, mainName })
    const totalParts = buckets ? buckets.reduce((sum, b) => sum + b.partCount, 0) : 0
    const totalSize = buckets ? buckets.reduce((sum, b) => sum + b.partSize, 0) : 0

    // ✅ Update main file with discovered metadata for next time (if bucketed)
    if (buckets) {
      const metadata: ExtractionMetadata = {
        extractionMethod,
        extractionMethodParameter: extractionMethodParameter || null,
        totalParts,
        totalSize,
        createdAt: lastModified.toISOString(),
        lastUpdated: new Date().toISOString(),
      }

      const mainFileContent = `<!-- METADATA
${JSON.stringify(metadata, null, 2)}
-->

# Bucketed Extraction: ${mainName}

**Extraction Method:** ${extractionMethod}${extractionMethodParameter ? ` (${extractionMethodParameter})` : ''}
**Total Parts:** ${totalParts.toLocaleString()}
**Total Size:** ${(totalSize / 1024 / 1024).toFixed(2)} MB
**Buckets:** ${Math.ceil(totalParts / BUCKET_SIZE).toLocaleString()} (${BUCKET_SIZE} parts per bucket)

Use the GraphQL API or backend route to access specific parts.
`

      await fs.promises.writeFile(mainFilePath, mainFileContent, 'utf-8')
    }

    return {
      mainFileName,
      mainFileSize,
      lastModified,
      extractionMethod,
      extractionMethodParameter: extractionMethodParameter || null,
      totalParts,
      totalSize,
      isBucketed: buckets !== null,
    }
  }
}

export const getAvailableExtractions = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}): Promise<
  Array<{
    extractionMethod: string
    extractionMethodParameter: string | null
  }>
> => {
  const fileDir = getFileDir({ fileId, libraryId })

  if (!fs.existsSync(fileDir)) {
    return []
  }

  const files = await fs.promises.readdir(fileDir)
  const extractionsMap = new Map<
    string,
    {
      extractionMethod: string
      extractionMethodParameter: string | null
    }
  >()

  for (const file of files) {
    let mainName: string | null = null

    // Match *.md files (excluding 'upload')
    if (file.endsWith('.md') && file !== 'upload') {
      mainName = file.slice(0, -3)
    }

    // Match *_buckets directories
    if (file.endsWith('_buckets')) {
      mainName = file.slice(0, -8)
    }

    if (mainName) {
      const parsed = parseExtractionMainName(mainName)
      // Use mainName as key to deduplicate (same extraction may have both .md and _buckets)
      extractionsMap.set(mainName, parsed)
    }
  }

  return Array.from(extractionsMap.values())
}

/**
 * Get detailed information about all available extractions for a file.
 * Returns structured data WITHOUT URLs (URLs should be added by the caller as they are context-specific).
 */
export const getAvailableExtractionsWithInfo = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}): Promise<
  Array<{
    extractionMethod: string
    extractionMethodParameter: string | null
    totalParts: number
    totalSize: number
    isBucketed: boolean
    mainFileName: string
  }>
> => {
  const availableExtractions = await getAvailableExtractions({ fileId, libraryId })

  const extractionInfos = await Promise.all(
    availableExtractions.map(async (extraction) => {
      const info = await getExtractionFileInfo({
        fileId,
        libraryId,
        extractionMethod: extraction.extractionMethod,
        extractionMethodParameter: extraction.extractionMethodParameter || undefined,
      })

      if (!info) {
        return null
      }

      const mainName =
        extraction.extractionMethod +
        (extraction.extractionMethodParameter ? `_${extraction.extractionMethodParameter}` : '')
      const mainFileName = `${mainName}.md`

      return {
        extractionMethod: extraction.extractionMethod,
        extractionMethodParameter: extraction.extractionMethodParameter,
        totalParts: info.totalParts,
        totalSize: info.totalSize,
        isBucketed: info.isBucketed,
        mainFileName,
      }
    }),
  )

  return extractionInfos.filter((info): info is NonNullable<typeof info> => info !== null)
}

/**
 * Delete existing bucketed extraction (both buckets directory and main file)
 * Call this before starting a new extraction to avoid appending to old data
 */
export const deleteExistingExtraction = async ({
  fileId,
  libraryId,
  extractionMethod,
  extractionMethodParameter,
}: {
  fileId: string
  libraryId: string
  extractionMethod: string
  extractionMethodParameter?: string
}) => {
  const mainName = getExtractionMainName({ extractionMethod, extractionMethodParameter })
  const fileDir = getFileDir({ fileId, libraryId })

  // Delete buckets directory if it exists
  const bucketsDir = path.join(fileDir, `${mainName}_buckets`)
  if (fs.existsSync(bucketsDir)) {
    await fs.promises.rm(bucketsDir, { recursive: true, force: true })
    console.log(`[File Management] Deleted buckets directory: ${bucketsDir}`)
  }

  // Delete main file if it exists
  const mainFilePath = path.join(fileDir, `${mainName}.md`)
  if (fs.existsSync(mainFilePath)) {
    await fs.promises.unlink(mainFilePath)
    console.log(`[File Management] Deleted main file: ${mainFilePath}`)
  }
}

/**
 * Iterator that yields all markdown files for an extraction
 * - For bucketed extractions: yields each part file with its part number
 * - For non-bucketed extractions: yields the main file
 *
 * This encapsulates all the complexity of bucket paths, part numbering, etc.
 *
 * @param startPart - Optional starting part number (inclusive, for batch processing)
 * @param endPart - Optional ending part number (inclusive, for batch processing)
 */
export async function* iterateExtractionFiles({
  fileId,
  libraryId,
  extractionMethod,
  extractionMethodParameter,
  startPart,
  endPart,
}: {
  fileId: string
  libraryId: string
  extractionMethod: string
  extractionMethodParameter?: string
  startPart?: number
  endPart?: number
}): AsyncGenerator<{ filePath: string; part?: number }> {
  const mainName = getExtractionMainName({ extractionMethod, extractionMethodParameter })
  const fileDir = getFileDir({ fileId, libraryId })

  // Check if extraction exists and is bucketed
  try {
    const info = await getExtractionFileInfo({
      fileId,
      libraryId,
      extractionMethod,
      extractionMethodParameter,
    })

    if (info.isBucketed && info.totalParts > 0) {
      // Determine range to process
      const firstPart = startPart || 1
      const lastPart = endPart || info.totalParts

      // Yield each part file in the specified range
      for (let partNumber = firstPart; partNumber <= lastPart; partNumber++) {
        const bucketPath = getBucketPath({
          libraryId,
          fileId,
          extractionMethod,
          extractionMethodParameter,
          part: partNumber,
        })

        const partFileName = `part-${partNumber.toString().padStart(7, '0')}.md`
        const partFilePath = path.join(bucketPath, partFileName)

        if (fs.existsSync(partFilePath)) {
          yield { filePath: partFilePath, part: partNumber }
        } else {
          console.warn(`[File Management] Part file not found: ${partFilePath}`)
        }
      }
    } else {
      // Non-bucketed: yield main file (ignore range parameters)
      const mainFilePath = path.join(fileDir, `${mainName}.md`)
      if (fs.existsSync(mainFilePath)) {
        yield { filePath: mainFilePath }
      } else {
        console.warn(`[File Management] Main file not found: ${mainFilePath}`)
      }
    }
  } catch (error) {
    console.error(`[File Management] Error iterating extraction files:`, error)
    throw error
  }
}

/**
 * Get bucketed part file path for serving
 * Validates extraction method, parameter, and part number to prevent path traversal
 * Returns file path, name, and stats - or null if validation fails or file doesn't exist
 */
export const getBucketedPartFilePath = async (args: {
  libraryId: string
  fileId: string
  extractionMethod: string
  extractionMethodParameter: string | null
  part: number
}): Promise<{ filePath: string; fileName: string; size: number } | null> => {
  const { libraryId, fileId, extractionMethod, extractionMethodParameter, part } = args

  // Validate part number
  if (!Number.isInteger(part) || part < 1) {
    console.warn(`[File Management] Invalid part number: ${part}`)
    return null
  }

  // Validate extraction method and parameter to prevent path traversal
  const safePattern = /^[a-zA-Z0-9\-_]+$/
  if (!safePattern.test(extractionMethod)) {
    console.warn(`[File Management] Invalid extraction method: ${extractionMethod}`)
    return null
  }
  if (extractionMethodParameter && !safePattern.test(extractionMethodParameter)) {
    console.warn(`[File Management] Invalid extraction method parameter: ${extractionMethodParameter}`)
    return null
  }

  // Get bucket path and construct part file path
  const bucketPath = getBucketPath({
    libraryId,
    fileId,
    extractionMethod,
    extractionMethodParameter: extractionMethodParameter || undefined,
    part,
  })

  const partFileName = `part-${part.toString().padStart(7, '0')}.md`
  const fullFilePath = path.join(bucketPath, partFileName)

  // Check if part file exists and is readable, get stats in one operation
  try {
    const stats = await fs.promises.stat(fullFilePath)

    // Verify it's a file and readable
    if (!stats.isFile()) {
      console.warn(`[File Management] Path is not a file: ${fullFilePath}`)
      return null
    }

    return { filePath: fullFilePath, fileName: partFileName, size: stats.size }
  } catch (error) {
    console.warn(`[File Management] Part file not readable: ${fullFilePath}`, error)
    return null
  }
}
