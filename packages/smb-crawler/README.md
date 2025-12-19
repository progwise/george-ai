# @george-ai/smb-crawler

TypeScript client library for crawling SMB/CIFS file shares using Server-Sent Events (SSE) for efficient streaming.

## Features

- 🔄 **SSE Streaming** - Real-time file discovery events
- 📁 **Large File Support** - No Base64 encoding overhead
- 🔒 **Authentication** - Username/password support
- 🎯 **File Filtering** - Include/exclude patterns
- 📊 **Progress Tracking** - Real-time crawl statistics
- ⚡ **Parallel Downloads** - Efficient file retrieval
- 🛡️ **Type Safe** - Full TypeScript support

## Installation

```bash
pnpm add @george-ai/smb-crawler
```

## Usage

### Basic Example

```typescript
import { SmbCrawlerClient } from '@george-ai/smb-crawler'

const client = new SmbCrawlerClient('http://localhost:3006')

const options = {
  uri: '//fileserver/share',
  username: 'user',
  password: 'pass',
  includePatterns: ['*.pdf', '*.docx'],
  excludePatterns: ['**/temp/**'],
  maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB
}

// Start crawl and get job ID
const { jobId } = await client.startCrawl(options)

// Listen to crawl events
for await (const event of client.streamEvents(jobId)) {
  switch (event.type) {
    case 'file-found':
      console.log(`Found: ${event.data.name}`)

      // Download file content
      const content = await client.downloadFile(jobId, event.data.fileId)
      console.log(`Downloaded ${content.byteLength} bytes`)
      break

    case 'progress':
      console.log(`Progress: ${event.data.filesProcessed}/${event.data.filesFound}`)
      break

    case 'complete':
      console.log(`Completed: ${event.data.totalFiles} files`)
      break

    case 'error':
      console.error(`Error: ${event.data.message}`)
      break
  }
}
```

### Advanced Example with Error Handling

```typescript
import { SmbCrawlerClient } from '@george-ai/smb-crawler'

const client = new SmbCrawlerClient('http://localhost:3006')

try {
  const { jobId } = await client.startCrawl({
    uri: '//fileserver/documents',
    username: 'admin',
    password: 'secret',
    includePatterns: ['*.pdf'],
  })

  const files: Array<{ id: string; name: string; size: number }> = []

  for await (const event of client.streamEvents(jobId)) {
    if (event.type === 'file-found') {
      files.push({
        id: event.data.fileId,
        name: event.data.name,
        size: event.data.size,
      })
    }
  }

  console.log(`Found ${files.length} PDF files`)

  // Download files in parallel (limit concurrency)
  const concurrency = 5
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency)
    await Promise.all(
      batch.map(async (file) => {
        const content = await client.downloadFile(jobId, file.id)
        console.log(`Downloaded ${file.name} (${content.byteLength} bytes)`)
      }),
    )
  }

  // Cleanup job
  await client.cancelJob(jobId)
} catch (error) {
  console.error('Crawl failed:', error)
}
```

## API Reference

### `SmbCrawlerClient`

#### Constructor

```typescript
new SmbCrawlerClient(baseUrl: string)
```

- `baseUrl` - SMB crawler service URL (e.g., `http://localhost:3006`)

#### Methods

##### `startCrawl(options: SmbCrawlOptions): Promise<{ jobId: string; streamUrl: string }>`

Start a new SMB crawl job.

**Options:**

- `uri` (required) - SMB share URI (e.g., `//server/share`)
- `username` (required) - SMB username
- `password` (required) - SMB password
- `includePatterns` (optional) - Array of glob patterns (e.g., `['*.pdf', '*.docx']`)
- `excludePatterns` (optional) - Array of glob patterns (e.g., `['**/temp/**']`)
- `maxFileSizeBytes` (optional) - Maximum file size in bytes

**Returns:**

- `jobId` - Unique job identifier
- `streamUrl` - SSE stream endpoint URL

##### `streamEvents(jobId: string): AsyncGenerator<SmbCrawlEvent>`

Stream crawl events via SSE.

**Event Types:**

- `file-found` - New file discovered

  ```typescript
  {
    type: 'file-found',
    data: {
      fileId: string
      name: string
      path: string
      size: number
      mimeType: string
      lastModified: string
      downloadUrl: string
    }
  }
  ```

- `progress` - Crawl progress update

  ```typescript
  {
    type: 'progress',
    data: {
      filesFound: number
      filesProcessed: number
    }
  }
  ```

- `complete` - Crawl finished successfully

  ```typescript
  {
    type: 'complete',
    data: {
      totalFiles: number
    }
  }
  ```

- `error` - Error occurred
  ```typescript
  {
    type: 'error',
    data: {
      message: string
    }
  }
  ```

##### `downloadFile(jobId: string, fileId: string): Promise<Buffer>`

Download file content as binary buffer.

**Parameters:**

- `jobId` - Job identifier
- `fileId` - File identifier from `file-found` event

**Returns:**

- Binary file content as Buffer

##### `cancelJob(jobId: string): Promise<void>`

Cancel job and cleanup resources (unmounts share, deletes temporary files).

## File Patterns

The crawler uses glob patterns for filtering:

```typescript
// Include only PDFs and Word documents
includePatterns: ['*.pdf', '*.docx', '*.doc']

// Exclude temporary files and system folders
excludePatterns: [
  '**/~$*', // Office temp files
  '**/.git/**', // Git directories
  '**/node_modules/**', // Node modules
  '**/temp/**', // Temp folders
]
```

**Pattern Syntax:**

- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/` (recursive)
- `?` - Matches single character
- `[abc]` - Matches any character in set
- `{pdf,doc}` - Matches either pattern

## Error Handling

The client throws errors for:

- Invalid URIs or credentials
- Network failures
- Service unavailable
- Invalid job IDs
- File not found

Always wrap client calls in try/catch:

```typescript
try {
  const { jobId } = await client.startCrawl(options)
  // ...
} catch (error) {
  if (error instanceof Error) {
    console.error('Crawl error:', error.message)
  }
}
```

## TypeScript Types

All types are exported:

```typescript
import type { SmbCrawlEvent, SmbCrawlOptions, SmbCrawlProgress, SmbFileMetadata } from '@george-ai/smb-crawler'
```

## Performance Tips

1. **Limit file size** - Use `maxFileSizeBytes` to skip large files
2. **Use specific patterns** - More specific `includePatterns` = faster crawls
3. **Parallel downloads** - Download files in batches for better throughput
4. **Cleanup jobs** - Always call `cancelJob()` to free resources

## Architecture

The crawler uses a two-step process:

1. **Discovery Phase** - Walks directory tree, streams file metadata via SSE
2. **Download Phase** - Downloads file content on-demand via HTTP

This design:

- ✅ Avoids Base64 encoding overhead (33% bandwidth savings)
- ✅ Supports large files (GB+)
- ✅ Enables parallel downloads
- ✅ Provides real-time progress feedback

## License

SEE LICENSE IN LICENSE (Business Source License 1.1)
