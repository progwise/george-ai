import { listFolderItems } from './box-api'
import { BoxFileToProcess } from './common'

/**
 * Discovers and streams Box files for processing using async generator pattern.
 * Files are yielded immediately as they're discovered (not batched), enabling
 * real-time processing and immediate user feedback.
 *
 * Algorithm:
 * 1. Lists all items in current folder using Box API (with pagination)
 * 2. Yields files immediately as they're encountered
 * 3. Collects subfolders to process after all files in current folder
 * 4. Recursively processes subfolders (breadth-first within folders, depth-first across folders)
 *
 * @param folderId - Box folder ID to start discovery from (e.g., "0" for root)
 * @param currentPath - Current path for tracking folder hierarchy (e.g., "/Documents/2024")
 * @param currentDepth - Current depth in folder tree (starts at 0)
 * @param maxDepth - Maximum depth to traverse (prevents infinite recursion)
 * @param accessToken - Box API Bearer token for authentication
 * @param processedUris - Set to track already-processed folders (prevents duplicates)
 *
 * @yields {BoxFileToProcess} File metadata for each discovered file
 *
 * @example
 * ```typescript
 * for await (const file of discoverBoxFilesAndFoldersStreaming('0', '', 0, 3, token)) {
 *   console.log(`Found: ${file.name} (${file.size} bytes)`)
 *   // Process file immediately - no waiting for full discovery
 * }
 * ```
 */
export async function* discoverBoxFilesStreaming(
  folderId: string,
  currentPath: string,
  currentDepth: number,
  maxDepth: number,
  accessToken: string,
  processedUris: Set<string> = new Set<string>(),
): AsyncGenerator<BoxFileToProcess, void, void> {
  if (currentDepth > maxDepth) {
    return
  }

  const folderUri = `box://${currentPath}/${folderId}`.replace('//', '/')
  if (processedUris.has(folderUri)) {
    return
  }

  processedUris.add(folderUri)
  console.log(`Discovering files in Box folder ID: ${folderId} (depth: ${currentDepth})`)

  try {
    let offset = 0
    let hasMore = true
    const subfolders: Array<{ id: string; path: string }> = []

    // Box API uses pagination, so we need to fetch all pages
    while (hasMore) {
      const response = await listFolderItems(folderId, accessToken, offset)

      for (const item of response.entries) {
        const itemPath = `${currentPath}/${item.name}`.replace('//', '/')

        if (item.type === 'file') {
          const modifiedTime = new Date(item.content_modified_at || item.modified_at || Date.now())

          // Yield file immediately
          yield {
            id: item.id,
            name: item.name,
            size: item.size || 0,
            modifiedTime,
            parentPath: currentPath,
            depth: currentDepth,
          }
        } else if (item.type === 'folder' && currentDepth < maxDepth) {
          // Collect subfolders to process after current folder files
          subfolders.push({ id: item.id, path: itemPath })
        }
      }

      // Check if there are more items to fetch
      offset += response.entries.length
      hasMore = offset < response.total_count
    }

    // After yielding all files in current folder, recursively process subfolders
    for (const subfolder of subfolders) {
      yield* discoverBoxFilesStreaming(
        subfolder.id,
        subfolder.path,
        currentDepth + 1,
        maxDepth,
        accessToken,
        processedUris,
      )
    }
  } catch (error) {
    console.error(`Error listing Box folder ${folderId}:`, error)
    // Continue with other directories even if this one fails
  }
}
