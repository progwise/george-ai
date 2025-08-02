import fs from 'node:fs'
import path from 'node:path'

import { transformToMarkdown } from '@george-ai/file-converter'

import { CrawlOptions } from './crawler-options'
import { uriToMountedPath } from './smb-mount-manager'

interface SmbFileToProcess {
  uri: string
  name: string
  size: number
  modifiedTime: Date
  depth: number
}

export async function* crawlSmb({ uri, maxDepth, maxPages, crawlerId }: CrawlOptions) {
  console.log(`Start SMB crawling ${uri} with maxDepth: ${maxDepth} and maxPages: ${maxPages}`)
  console.log(`Using mount for crawler: ${crawlerId}`)

  let processedPages = 0
  const queue: SmbFileToProcess[] = []
  const processedUris = new Set<string>()

  try {
    // Start by discovering files and directories at the specified URI
    await discoverMountedFilesAndDirectories(uri, 0, queue, processedUris, maxDepth, crawlerId)

    console.log(`Discovery complete. Found ${queue.length} files to process`)

    // Process files in the queue
    while (queue.length > 0 && processedPages < maxPages) {
      const fileToProcess = queue.shift()!
      processedPages++

      try {
        console.log(`Processing SMB file: ${fileToProcess.uri}`)

        // Convert URI to mounted filesystem path
        const mountedFilePath = uriToMountedPath(fileToProcess.uri, crawlerId)

        // Determine MIME type from file extension
        const mimeType = getMimeTypeFromExtension(fileToProcess.name)

        // Convert to markdown using file converter directly on mounted file
        const markdown = await transformToMarkdown({
          name: fileToProcess.name,
          mimeType,
          path: mountedFilePath, // Direct access to mounted file - no copying!
        })

        // Create metadata
        const metaData = JSON.stringify({
          url: fileToProcess.uri,
          title: fileToProcess.name,
          size: fileToProcess.size,
          modifiedTime: fileToProcess.modifiedTime.toISOString(),
          type: 'file',
          source: 'smb',
          mimeType,
        })

        yield { metaData, markdown }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error processing SMB file ${fileToProcess.uri}:`, errorMessage)
        yield { uri: fileToProcess.uri, markdown: null, metaData: null, error: errorMessage }
      }
    }

    console.log(`Finished SMB crawling. Processed ${processedPages} files.`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in SMB crawler:', errorMessage)
    yield { uri, markdown: null, metaData: null, error: errorMessage }
  }
}

async function discoverMountedFilesAndDirectories(
  currentUri: string,
  currentDepth: number,
  queue: SmbFileToProcess[],
  processedUris: Set<string>,
  maxDepth: number,
  crawlerId: string,
): Promise<void> {
  if (currentDepth > maxDepth || processedUris.has(currentUri)) {
    return
  }

  processedUris.add(currentUri)
  console.log(`Discovering files in: ${currentUri} (depth: ${currentDepth})`)

  try {
    // Convert URI to mounted filesystem path
    const mountedPath = uriToMountedPath(currentUri, crawlerId)

    // Check if the path exists
    try {
      await fs.promises.access(mountedPath)
    } catch (error) {
      console.error(`SMB mount not found at ${mountedPath}.`, error)
      throw new Error(
        `SMB mount not found at ${mountedPath}. Ensure crawler has been updated with SMB credentials to create the mount.`,
      )
    }

    // List directory contents using fs
    console.log(`Listing files in mounted path: ${mountedPath}`)
    const entries = await fs.promises.readdir(mountedPath, { withFileTypes: true })
    console.log(`Found ${entries.length} entries in ${mountedPath}`)

    for (const entry of entries) {
      const entryUri = `${currentUri.endsWith('/') ? currentUri : currentUri + '/'}${entry.name}`
      const entryPath = path.join(mountedPath, entry.name)

      if (entry.isFile() && !processedUris.has(entryUri)) {
        // Only process text-like files
        if (isTextFile(entry.name)) {
          try {
            const stats = await fs.promises.stat(entryPath)
            queue.push({
              uri: entryUri,
              name: entry.name,
              size: stats.size,
              modifiedTime: stats.mtime,
              depth: currentDepth,
            })
          } catch (error) {
            console.warn(`Failed to stat file ${entryPath}:`, error)
          }
        } else {
          console.log(`Skipping non-text file: ${entryUri}`)
        }
      } else if (entry.isDirectory() && currentDepth < maxDepth) {
        // Recursively explore subdirectories
        await discoverMountedFilesAndDirectories(entryUri, currentDepth + 1, queue, processedUris, maxDepth, crawlerId)
      }
    }
  } catch (error) {
    // Re-throw mount errors so they propagate to the main function
    if (error instanceof Error && error.message.includes('SMB mount not found')) {
      throw error
    }

    console.error(`Error listing directory ${currentUri}:`, error)
    // Continue with other directories even if this one fails
  }
}

function isTextFile(filename: string): boolean {
  const textExtensions = [
    '.txt',
    '.md',
    '.markdown',
    '.json',
    '.xml',
    '.html',
    '.htm',
    '.css',
    '.js',
    '.ts',
    '.py',
    '.java',
    '.c',
    '.cpp',
    '.h',
    '.hpp',
    '.cs',
    '.php',
    '.rb',
    '.go',
    '.rs',
    '.sql',
    '.csv',
    '.tsv',
    '.log',
    '.ini',
    '.cfg',
    '.conf',
    '.yaml',
    '.yml',
    '.toml',
    '.sh',
    '.bat',
    '.ps1',
    '.dockerfile',
    '.gitignore',
    '.gitattributes',
    '.editorconfig',
    '.env',
    '.properties',
    '.gradle',
    '.pom',
    '.sbt',
    '.build',
    '.make',
    '.cmake',
    // Add file converter supported formats
    '.pdf',
    '.docx',
    '.doc',
    '.xlsx',
    '.xls',
  ]

  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return textExtensions.includes(extension) || !filename.includes('.')
}

function getMimeTypeFromExtension(filename: string): string {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))

  const mimeTypeMap: Record<string, string> = {
    // Text files
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ts': 'application/typescript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.yaml': 'application/x-yaml',
    '.yml': 'application/x-yaml',
    '.csv': 'text/csv',
    '.tsv': 'text/tab-separated-values',

    // Office documents
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',

    // Code files
    '.py': 'text/x-python',
    '.java': 'text/x-java-source',
    '.c': 'text/x-c',
    '.cpp': 'text/x-c++',
    '.h': 'text/x-c',
    '.hpp': 'text/x-c++',
    '.cs': 'text/x-csharp',
    '.php': 'application/x-httpd-php',
    '.rb': 'application/x-ruby',
    '.go': 'text/x-go',
    '.rs': 'text/x-rust',
    '.sql': 'application/sql',

    // Config files
    '.ini': 'text/plain',
    '.cfg': 'text/plain',
    '.conf': 'text/plain',
    '.env': 'text/plain',
    '.properties': 'text/plain',
    '.log': 'text/plain',

    // Scripts
    '.sh': 'application/x-sh',
    '.bat': 'application/x-msdos-program',
    '.ps1': 'application/x-powershell',
  }

  return mimeTypeMap[extension] || 'text/plain'
}
