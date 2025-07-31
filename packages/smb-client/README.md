# @george-ai/smb-client

SMB client library for connecting to SMB/CIFS shares using the native `smbclient` utility.

## Features

- ✅ **SMBClient class** with configurable connection options
- ✅ **configure()** function to avoid passing options on every call
- ✅ **Native smbclient utility** integration (no additional npm packages)
- ✅ **Type-safe interfaces** with `SMBFileInfo`
- ✅ **Comprehensive test suite** with Vitest

## Installation

This package is part of the George AI monorepo and uses the native `smbclient` utility.

## Usage

### Basic Usage with Configuration

```typescript
import { configure, listDirectories, listFiles, readFile } from '@george-ai/smb-client'

// Configure once (recommended)
configure({
  username: 'testuser1',
  password: 'password123',
})

// Use without passing options each time
const files = await listFiles('smb://gai-smb-test/public/')
const content = await readFile('smb://gai-smb-test/public/readme.txt')
const directories = await listDirectories('smb://gai-smb-test/documents/')
```

### Per-Call Options

```typescript
import { listFiles, readFile } from '@george-ai/smb-client'

// Pass options for each call
const options = {
  username: 'admin',
  password: 'admin123',
}

const files = await listFiles('smb://gai-smb-test/private/', options)
const content = await readFile('smb://gai-smb-test/private/secret.txt', options)
```

### Using SMBClient Class Directly

```typescript
import { SMBClient } from '@george-ai/smb-client'

const client = new SMBClient({
  username: 'testuser1',
  password: 'password123',
})

const files = await client.listFiles('smb://gai-smb-test/documents/')
const content = await client.readFile('smb://gai-smb-test/documents/file.txt')
const directories = await client.listDirectories('smb://gai-smb-test/engineering/')
```

## API Reference

### Types

```typescript
interface smbClientOptions {
  username: string
  password: string
}

interface SMBFileInfo {
  name: string
  size: number
  isDirectory: boolean
  modifiedTime: Date
}
```

### Functions

#### `configure(options: smbClientOptions): void`

Set default connection options for all subsequent calls.

#### `listFiles(uri: string, options?: smbClientOptions): Promise<SMBFileInfo[]>`

List files in the specified SMB directory.

#### `readFile(uri: string, options?: smbClientOptions): Promise<string>`

Read the contents of a file from an SMB share.

#### `listDirectories(uri: string, options?: smbClientOptions): Promise<SMBFileInfo[]>`

List subdirectories in the specified SMB directory.

### Classes

#### `SMBClient`

Main client class for SMB operations.

```typescript
const client = new SMBClient(options)
await client.listFiles(uri)
await client.readFile(uri)
await client.listDirectories(uri)
```

## URI Format

SMB URIs should follow this format:

```
smb://server/share/path
```

Examples:

- `smb://gai-smb-test/public/`
- `smb://192.168.1.100/documents/reports/`
- `smb://fileserver/share/folder/file.txt`

Port specification is optional and uses SMB default (445):

- `smb://server:445/share/path` (explicit port)
- `smb://server/share/path` (uses default port 445)

## Testing

The package includes comprehensive tests that connect to the SMB test server:

```bash
# Run all tests
pnpm test

# Run debug tests to check server connection
pnpm test debug.test.ts
```

### Test Server Configuration

For development and testing, the package connects to `gai-smb-test` with these test users:

- **testuser1**: `password123` (readers, writers groups)
- **testuser2**: `password456` (readers, writers groups)
- **readonly**: `readonly123` (readers group)
- **admin**: `admin123` (all groups)

Available shares:

- `public/` - Read-only for all authenticated users
- `documents/` - Read/write for writers and admins
- `private/` - Admin only
- `engineering/` - Read/write for writers and admins
- `marketing/` - Read/write for writers and admins

## Implementation Details

### Native smbclient Integration

This library uses the system's native `smbclient` utility rather than installing additional npm packages. The client:

1. Parses SMB URIs to extract server, share, and path components
2. Executes `smbclient` commands with proper authentication
3. Parses the output to return structured data
4. Handles errors appropriately

### Container Environment

When running in the devcontainer environment:

- SMB server hostname: `gai-smb-test`
- Internal port: `445`
- External port: `10445` (for external access)

### Error Handling

The client properly handles various error conditions:

- Invalid URIs
- Authentication failures
- Non-existent shares or files
- Network timeouts
- Permission denied

## Development

### SMB Test Server

The test server configuration has been completely rewritten for reliability:

#### Key Files:

- `apps/smb-test-server/config/smb.conf` - Proper Samba configuration
- `apps/smb-test-server/scripts/setup-samba.sh` - User/group setup script
- `apps/smb-test-server/Dockerfile` - Clean container build

#### Rebuild Test Server:

```bash
# Outside devcontainer
docker-compose -f .devcontainer/docker-compose.yml up --build -d gai-smb-test-server
```

#### Verify Server:

```bash
# List available shares
smbclient -L gai-smb-test -U testuser1%password123

# Test connection to a specific share
smbclient //gai-smb-test/public -U testuser1%password123 -c "ls"
```

## Troubleshooting

### Common Issues

1. **Connection failures**: Ensure SMB test server is running
2. **Authentication errors**: Verify username/password combination
3. **Share not found**: Check that shares are properly configured
4. **Permission denied**: Ensure user has access to the requested share

### Debug Information

Use the debug test to check server status:

```bash
pnpm test debug.test.ts
```

This will show:

- Available shares on the server
- Authentication status
- Connection test results

## Previous Issues Fixed

### Original Problems (now resolved):

1. **❌ Groups not created properly** - Used usernames as GIDs
2. **❌ Share configs with literal `\n`** - Environment variables weren't parsing newlines
3. **❌ All shares flagged unavailable** - No proper paths configured

### Solutions Applied:

1. **✅ Proper group creation** - Used numeric GIDs in setup script
2. **✅ Real config files** - Replaced env vars with proper `smb.conf`
3. **✅ Build-time setup** - Users/groups created during Docker build
