import { transformToMarkdown } from '@george-ai/file-converter'
import { listDirectories, listFiles, readFile } from '@george-ai/smb-client'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

import { CrawlOptions } from './crawler-options'

// Hard-coded credentials for now (TODO: make this configurable)
const SMB_CREDENTIALS = {
  username: 'testuser1',
  password: 'password123',
}

interface SmbFileToProcess {
  uri: string
  name: string
  size: number
  modifiedTime: Date
  depth: number
}

export async function* crawlSmb({ uri, maxDepth, maxPages }: CrawlOptions) {
  console.log(`start smb crawling ${uri} and maxDepth: ${maxDepth} and maxPages ${maxPages}`)

  // Convert //host/share/path format to smb://host/share/path
  const smbUri = uri.startsWith('//') ? `smb:${uri}` : uri

  let processedPages = 0
  const queue: SmbFileToProcess[] = []
  const processedUris = new Set<string>()

  try {
    console.log(`SMB URI converted to: ${smbUri}`)
    console.log(`Using credentials: ${SMB_CREDENTIALS.username}`)
    
    // Start by listing files and directories at the root level
    await discoverFilesAndDirectories(smbUri, 0, queue, processedUris, maxDepth)
    
    console.log(`Discovery complete. Found ${queue.length} files to process`)

    // Process files in the queue
    while (queue.length > 0 && processedPages < maxPages) {
      const fileToProcess = queue.shift()!
      processedPages++

      try {
        console.log(`Processing SMB file: ${fileToProcess.uri}`)
        
        // Read file content
        const content = await readFile(fileToProcess.uri, SMB_CREDENTIALS)
        
        // Create temporary file for processing
        const tempDir = os.tmpdir()
        const tempFileName = `smb_crawl_${Date.now()}_${path.basename(fileToProcess.name)}`
        const tempFilePath = path.join(tempDir, tempFileName)
        
        // Write content to temporary file
        await fs.promises.writeFile(tempFilePath, content)
        
        try {
          // Determine MIME type from file extension
          const mimeType = getMimeTypeFromExtension(fileToProcess.name)
          
          // Convert to markdown using file converter
          const markdown = await transformToMarkdown({
            name: fileToProcess.name,
            mimeType,
            path: tempFilePath,
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
          
        } finally {
          // Clean up temporary file
          try {
            await fs.promises.unlink(tempFilePath)
          } catch (unlinkError) {
            console.warn(`Failed to delete temporary file ${tempFilePath}:`, unlinkError)
          }
        }
        
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
    yield { uri: smbUri, markdown: null, metaData: null, error: errorMessage }
  }
}

async function discoverFilesAndDirectories(
  currentUri: string,
  currentDepth: number,
  queue: SmbFileToProcess[],
  processedUris: Set<string>,
  maxDepth: number
): Promise<void> {
  if (currentDepth > maxDepth || processedUris.has(currentUri)) {
    return
  }

  processedUris.add(currentUri)
  console.log(`Discovering files in: ${currentUri} (depth: ${currentDepth})`)

  try {
    // List files in current directory
    console.log(`Listing files in: ${currentUri}`)
    const files = await listFiles(currentUri, SMB_CREDENTIALS)
    console.log(`Found ${files.length} files in ${currentUri}`)
    
    for (const file of files) {
      // Encode the filename to handle spaces and special characters
      const encodedFileName = encodeURIComponent(file.name)
      const fileUri = `${currentUri.endsWith('/') ? currentUri : currentUri + '/'}${encodedFileName}`
      if (!processedUris.has(fileUri)) {
        // Only process text-like files (you can extend this list)
        if (isTextFile(file.name)) {
          queue.push({
            uri: fileUri,
            name: file.name,
            size: file.size,
            modifiedTime: file.modifiedTime,
            depth: currentDepth,
          })
        } else {
          console.log(`Skipping non-text file: ${fileUri}`)
        }
      }
    }

    // If we haven't reached max depth, explore subdirectories
    if (currentDepth < maxDepth) {
      console.log(`Listing directories in: ${currentUri}`)
      const directories = await listDirectories(currentUri, SMB_CREDENTIALS)
      console.log(`Found ${directories.length} directories in ${currentUri}`)
      
      for (const dir of directories) {
        // Encode the directory name to handle spaces and special characters
        const encodedDirName = encodeURIComponent(dir.name)
        const dirUri = `${currentUri.endsWith('/') ? currentUri : currentUri + '/'}${encodedDirName}`
        await discoverFilesAndDirectories(dirUri, currentDepth + 1, queue, processedUris, maxDepth)
      }
    }
  } catch (error) {
    console.error(`Error listing directory ${currentUri}:`, error)
    // Continue with other directories even if this one fails
  }
}

function isTextFile(filename: string): boolean {
  const textExtensions = [
    '.txt', '.md', '.markdown', '.json', '.xml', '.html', '.htm', '.css', '.js', '.ts', 
    '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs',
    '.sql', '.csv', '.tsv', '.log', '.ini', '.cfg', '.conf', '.yaml', '.yml', '.toml',
    '.sh', '.bat', '.ps1', '.dockerfile', '.gitignore', '.gitattributes', '.editorconfig',
    '.env', '.properties', '.gradle', '.pom', '.sbt', '.build', '.make', '.cmake',
    // Add file converter supported formats
    '.pdf', '.docx', '.doc', '.xlsx', '.xls',
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
