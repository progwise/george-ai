# @george-ai/smb2-client

Zero-dependency SMB2/3 client library for Node.js with NTLM v2 authentication.

## Features

- ✅ **Pure TypeScript** - No native dependencies, runs anywhere Node.js runs
- ✅ **SMB2/3 Protocol** - Direct binary protocol implementation
- ✅ **NTLM v2 Authentication** - Secure authentication with Windows servers
- ✅ **Connection Pooling** - Efficient connection reuse for better performance
- ✅ **Node.js-like API** - Familiar `readFile()`, `readdir()`, `stat()` methods
- ✅ **Streaming Support** - Memory-efficient reading of large files
- ✅ **TypeScript First** - Full type safety and IntelliSense support
- ✅ **Production Ready** - Comprehensive tests against real SMB servers

## Why @george-ai/smb2-client?

Existing SMB libraries for Node.js have significant issues:

- **Archived dependencies**: Most depend on `ntlm` package (unmaintained for 8 years)
- **Native bindings**: Require compilation and platform-specific builds
- **Mount-based**: Need privileged containers and root access

`@george-ai/smb2-client` provides:

- ✅ **Zero dependencies** - Only Node.js built-ins (`net`, `crypto`, `buffer`, `events`, `stream`)
- ✅ **No native code** - Pure JavaScript, works everywhere Node.js runs
- ✅ **Modern TypeScript** - Full type safety and IntelliSense support
- ✅ **No mounting** - Direct protocol implementation, no privileged mode needed
- ✅ **Better performance** - Direct SMB access faster than CIFS mounts

## Installation

```bash
pnpm add @george-ai/smb2-client
```

> **Note:** Package not yet published. Still in development as part of George AI platform.

## Quick Start

```typescript
import { SMB2Client } from '@george-ai/smb2-client'

const client = new SMB2Client({
  host: 'fileserver.local',
  share: 'documents',
  username: 'user',
  password: 'password',
  domain: 'WORKGROUP', // Optional, defaults to 'WORKGROUP'
})

try {
  // Auto-connects on first operation
  const files = await client.readdir('/')
  console.log(
    'Files:',
    files.map((f) => f.name),
  )

  const content = await client.readFile('/readme.txt')
  console.log('Content:', content.toString('utf8'))
} finally {
  await client.disconnect()
}
```

## API Reference

### SMB2Client

High-level client with intuitive Node.js-like API.

#### Constructor Options

```typescript
interface SMB2ClientOptions {
  /** SMB server hostname or IP */
  host: string

  /** Share name (e.g., 'documents', 'public') */
  share: string

  /** Username for authentication */
  username: string

  /** Password for authentication */
  password: string

  /** SMB server port (default: 445) */
  port?: number

  /** Windows domain (default: 'WORKGROUP') */
  domain?: string

  /** Workstation name (default: 'NODE-SMB2-CLIENT') */
  workstation?: string

  /** Connection timeout in milliseconds (default: 10000) */
  timeout?: number

  /** Auto-connect on first operation (default: true) */
  autoConnect?: boolean
}
```

#### Methods

##### `connect(): Promise<void>`

Manually connect to the SMB server. Usually not needed as the client auto-connects on first operation.

```typescript
await client.connect()
console.log('Connected to', client.options.host)
```

##### `disconnect(): Promise<void>`

Disconnect from the server and cleanup resources. Always call this when done.

```typescript
await client.disconnect()
```

##### `isConnected(): boolean`

Check if the client is currently connected.

```typescript
if (!client.isConnected()) {
  await client.connect()
}
```

##### `readFile(path: string, options?: ReadFileOptions): Promise<Buffer>`

Read entire file into a Buffer.

**Options:**

- `offset?: bigint` - Start reading from this position (default: 0)
- `length?: number` - Maximum bytes to read (default: entire file)
- `chunkSize?: number` - Chunk size for reading (default: 65536)

```typescript
// Read entire file
const content = await client.readFile('/documents/report.pdf')

// Read specific range
const chunk = await client.readFile('/large.bin', {
  offset: 0n,
  length: 1024,
})
```

##### `createReadStream(path: string, options?: ReadFileOptions): Readable`

Create a Node.js Readable stream for efficient reading of large files.

```typescript
const stream = client.createReadStream('/large-file.zip')
stream.pipe(fs.createWriteStream('./download.zip'))

stream.on('end', () => console.log('Download complete'))
stream.on('error', (err) => console.error('Error:', err))
```

##### `readdir(path: string): Promise<FileMetadata[]>`

List directory contents. Returns metadata for all files and subdirectories.

```typescript
const entries = await client.readdir('/documents')

for (const entry of entries) {
  if (entry.isDirectory) {
    console.log('[DIR]', entry.name)
  } else {
    console.log('[FILE]', entry.name, entry.size.toString(), 'bytes')
  }
}
```

**FileMetadata interface:**

```typescript
interface FileMetadata {
  name: string // File/directory name
  path: string // Full path
  isDirectory: boolean // true if directory
  size: bigint // Size in bytes
  createdAt: Date // Creation time
  modifiedAt: Date // Last modification time
  attributes: number // Windows file attributes
}
```

##### `stat(path: string): Promise<FileMetadata>`

Get metadata for a single file or directory.

```typescript
const metadata = await client.stat('/documents/report.pdf')

console.log('Name:', metadata.name)
console.log('Size:', metadata.size.toString(), 'bytes')
console.log('Modified:', metadata.modifiedAt)
console.log('Is directory:', metadata.isDirectory)
```

### ConnectionPool

Advanced connection pooling for high-performance scenarios with multiple concurrent operations.

#### Constructor Options

```typescript
interface ConnectionPoolOptions {
  /** Maximum connections per server:port:share (default: 10) */
  maxConnections?: number

  /** Idle timeout in milliseconds (default: 60000 = 1 minute) */
  idleTimeout?: number

  /** Connection timeout in milliseconds (default: 10000) */
  connectionTimeout?: number
}
```

#### Basic Usage

```typescript
import { ConnectionPool } from '@george-ai/smb2-client'

const pool = new ConnectionPool({
  maxConnections: 10,
  idleTimeout: 60000,
})

try {
  // Acquire connection
  const pooled = await pool.acquire({
    host: 'fileserver.local',
    share: 'documents',
    username: 'user',
    password: 'password',
  })

  // Use low-level API (connection, sessionManager, treeManager)
  const message = await pooled.connection.sendMessage(request)

  // Release back to pool (for reuse)
  pool.release(pooled)

  // Acquire again - reuses the same connection!
  const pooled2 = await pool.acquire({
    host: 'fileserver.local',
    share: 'documents',
    username: 'user',
    password: 'password',
  })

  pool.release(pooled2)
} finally {
  // Clean up all connections
  await pool.cleanup()
}
```

#### Pool Statistics

```typescript
const stats = pool.getStats()
console.log('Total connections:', stats.total)
console.log('In use:', stats.inUse)
console.log('Idle:', stats.idle)
console.log('By server:', stats.byServer)
```

#### When to Use ConnectionPool

Use `ConnectionPool` instead of `SMB2Client` when:

- You need to perform many operations concurrently (100+ operations/minute)
- You want fine-grained control over connection lifecycle
- You're building a service that handles multiple users/credentials
- You need to minimize NEGOTIATE + SESSION_SETUP overhead

Use `SMB2Client` for most applications - it's simpler and handles connections automatically.

## Usage Examples

### Reading a Text File

```typescript
const client = new SMB2Client({
  host: '192.168.1.100',
  share: 'public',
  username: 'john',
  password: 'secret123',
})

try {
  const content = await client.readFile('/readme.txt')
  console.log(content.toString('utf8'))
} finally {
  await client.disconnect()
}
```

### Listing Directory Contents

```typescript
const client = new SMB2Client({
  host: 'fileserver.local',
  share: 'documents',
  username: 'admin',
  password: 'admin123',
})

async function listRecursive(path: string, indent = '') {
  const entries = await client.readdir(path)

  for (const entry of entries) {
    console.log(indent + entry.name)

    if (entry.isDirectory && !entry.name.startsWith('.')) {
      const subPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`
      await listRecursive(subPath, indent + '  ')
    }
  }
}

try {
  await listRecursive('/')
} finally {
  await client.disconnect()
}
```

### Streaming Large Files

```typescript
import { createWriteStream } from 'fs'

const client = new SMB2Client({
  host: 'fileserver.local',
  share: 'backups',
  username: 'backup',
  password: 'backup123',
})

try {
  const stream = client.createReadStream('/backup-2024.tar.gz')
  const writeStream = createWriteStream('./local-backup.tar.gz')

  stream.pipe(writeStream)

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
  })

  console.log('Download complete!')
} finally {
  await client.disconnect()
}
```

### Connection Pooling for High Performance

```typescript
import { ConnectionPool } from '@george-ai/smb2-client'

const pool = new ConnectionPool({ maxConnections: 5 })

async function processFiles(files: string[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      // Acquire connection from pool
      const pooled = await pool.acquire({
        host: 'fileserver.local',
        share: 'documents',
        username: 'processor',
        password: 'process123',
      })

      try {
        // Use low-level connection API
        // (Implementation depends on your needs)
        const result = await processFile(pooled, file)
        return result
      } finally {
        // Always release back to pool
        pool.release(pooled)
      }
    }),
  )

  return results
}

try {
  const files = ['file1.txt', 'file2.txt', 'file3.txt' /* ... 100 files */]
  const results = await processFiles(files)
  console.log('Processed', results.length, 'files')
} finally {
  await pool.cleanup()
}
```

### Error Handling

```typescript
import { SMB2Client, SMB2ClientError } from '@george-ai/smb2-client'

const client = new SMB2Client({
  host: 'fileserver.local',
  share: 'documents',
  username: 'user',
  password: 'password',
})

try {
  const content = await client.readFile('/nonexistent.txt')
} catch (error) {
  if (error instanceof SMB2ClientError) {
    console.error('SMB Error:', error.message)
    console.error('Code:', error.code)
    console.error('Operation:', error.operation)
    console.error('Path:', error.path)

    // Handle specific error codes
    if (error.code === 'ENOENT') {
      console.error('File not found')
    } else if (error.code === 'EACCES') {
      console.error('Permission denied')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused')
    }
  } else {
    console.error('Unexpected error:', error)
  }
} finally {
  await client.disconnect()
}
```

### Manual Connection Control

```typescript
const client = new SMB2Client({
  host: 'fileserver.local',
  share: 'documents',
  username: 'user',
  password: 'password',
  autoConnect: false, // Disable auto-connect
})

try {
  // Connect manually
  await client.connect()
  console.log('Connected!')

  // Perform operations
  const files = await client.readdir('/')
  console.log('Files:', files.length)

  // Connection remains active between operations
  const content = await client.readFile('/readme.txt')
  console.log('Read file successfully')
} catch (error) {
  console.error('Error:', error)
} finally {
  // Always disconnect
  await client.disconnect()
  console.log('Disconnected')
}
```

## Error Codes

| Code           | Description                      |
| -------------- | -------------------------------- |
| `ENOENT`       | File or directory not found      |
| `EACCES`       | Permission denied                |
| `EEXIST`       | File or directory already exists |
| `ENOTDIR`      | Path is not a directory          |
| `EISDIR`       | Path is a directory              |
| `EINVAL`       | Invalid argument                 |
| `EIO`          | I/O error                        |
| `ECONNREFUSED` | Connection refused               |
| `ENOTCONN`     | Not connected                    |
| `ETIMEDOUT`    | Connection timeout               |
| `EALREADY`     | Connection already in progress   |

## Compatibility

- **Node.js**: 18.x or higher
- **SMB Servers**: Windows Server, Samba 4.x+, Synology NAS, QNAP, etc.
- **SMB Versions**: SMB 2.0, 2.1, 3.0, 3.1.1
- **Authentication**: NTLM v2 (NTLMv1 not supported)

## Performance Tips

1. **Use Connection Pooling** for high-throughput scenarios (100+ operations/minute)
2. **Use Streaming** for large files to avoid loading entire file into memory
3. **Reuse Connections** - Don't create a new client for every operation
4. **Set Timeouts** appropriately for your network conditions
5. **Handle Errors** gracefully and retry with exponential backoff

## Architecture

The library is organized into layers:

1. **High-Level API** (`SMB2Client`) - Node.js-friendly interface
2. **Connection Pooling** (`ConnectionPool`) - Session reuse for performance
3. **Session Management** (`SessionManager`, `TreeManager`) - Authentication and tree connections
4. **Protocol Layer** (`SMB2Connection`, `SMB2Message`) - Binary SMB2 protocol implementation
5. **File Operations** (`readdir`, `readFile`, `stat`) - High-level file operations

### SMB2 Commands Implemented

All core file operations are fully implemented:

- ✅ NEGOTIATE - Protocol version negotiation
- ✅ SESSION_SETUP - Authentication with NTLM v2
- ✅ TREE_CONNECT - Connect to share
- ✅ CREATE - Open files/directories
- ✅ READ - Read file contents
- ✅ QUERY_DIRECTORY - List directory contents
- ✅ QUERY_INFO - Get file metadata
- ✅ CLOSE - Close file handle

### Zero Dependencies

Only Node.js built-ins:

- `net` - TCP connections
- `crypto` - HMAC-MD5, MD4, SHA-256 for NTLM v2
- `buffer` - Binary protocol handling
- `events` - Event emitter
- `stream` - File streaming

## Testing

The library includes comprehensive integration tests against real SMB servers:

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test integration-client.test.ts

# Run in watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

Tests require a running SMB server. The devcontainer includes `gai-smb-test` for this purpose.

## Resources

- [Implementation Status (Issue #968)](https://github.com/progwise/george-ai/issues/968)
- [Microsoft SMB2 Protocol Specification](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/5606ad47-5ee0-437a-817e-70c366052962)
- [NTLM Authentication Protocol](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/)

## License

Business Source License 1.1 (BSL 1.1)

See [LICENSE](../../LICENSE) file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../.github/CONTRIBUTING.md) for guidelines.

## Support

- GitHub Issues: https://github.com/progwise/george-ai/issues
- Documentation: https://george-ai.net/docs
- Discord: https://discord.gg/GbQFKb2MNJ
