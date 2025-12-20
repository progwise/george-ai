# @george-ai/smb2-client

**Zero-dependency SMB2/3 client for Node.js with NTLM authentication**

A modern, lightweight SMB2/3 client implementation in TypeScript. Access Windows file shares, NAS devices, and Samba servers without mounting filesystems or external dependencies.

## ⚠️ Development Status

This library is currently **under active development** as part of the George AI platform.

**Current Phase:** Protocol implementation (Phase 1/5)

See [Issue #968](https://github.com/progwise/george-ai/issues/968) for the complete implementation plan.

---

## ✨ Features

### Current (In Development)

- ✅ SMB 2.0, 2.1, and 3.0 protocol support
- ✅ NTLM v2 authentication (zero dependencies)
- ✅ Pure TypeScript with full type safety
- ✅ Zero external dependencies (only Node.js built-ins)

### Planned

- 🚧 Connection pooling for performance
- 🚧 Streaming support for large files
- 🚧 SMB 3.0 encryption
- 🚧 Kerberos authentication

---

## 🎯 Why @george-ai/smb2-client?

### Problem

Existing SMB libraries for Node.js have significant issues:

- **Archived dependencies**: Most depend on `ntlm` package (unmaintained for 8 years)
- **Native bindings**: Require compilation and platform-specific builds
- **Mount-based**: Need privileged containers and root access

### Solution

`@george-ai/smb2-client` provides:

- ✅ **Zero dependencies** - Only Node.js built-ins (`net`, `crypto`, `buffer`, `events`, `stream`)
- ✅ **No native code** - Pure JavaScript, works everywhere Node.js runs
- ✅ **Modern TypeScript** - Full type safety and IntelliSense support
- ✅ **No mounting** - Direct protocol implementation, no privileged mode needed
- ✅ **Better performance** - Direct SMB access faster than CIFS mounts

---

## 📦 Installation

```bash
pnpm add @george-ai/smb2-client
```

> **Note:** Package not yet published. Still in development.

---

## 🚀 Quick Start (Planned API)

```typescript
import { SMB2Client } from '@george-ai/smb2-client'

// Create client
const client = new SMB2Client({
  host: '192.168.1.100',
  port: 445, // default
  domain: 'WORKGROUP', // default
  username: 'user',
  password: 'password',
  share: 'Documents',
})

// Connect and authenticate
await client.connect()

// List directory contents
const files = await client.readdir('/reports')

// Read file
const content = await client.readFile('/reports/Q4-2024.pdf')

// Cleanup
await client.disconnect()
```

---

## 🏗️ Architecture

### Zero Dependencies

Only Node.js built-ins:

- `net` - TCP connections
- `crypto` - HMAC-MD5, MD4, SHA-256
- `buffer` - Binary protocol handling
- `events` - Event emitter
- `stream` - File streaming

### SMB2 Commands Implemented

For file operations (Phase 1-2 focus):

- ✅ NEGOTIATE - Protocol version negotiation
- ✅ SESSION_SETUP - Authentication
- 🚧 TREE_CONNECT - Connect to share
- 🚧 CREATE - Open files/directories
- 🚧 READ - Read file contents
- 🚧 QUERY_DIRECTORY - List directory contents
- 🚧 QUERY_INFO - Get file metadata
- 🚧 CLOSE - Close file handle

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

---

## 📚 Resources

- [Microsoft SMB2 Protocol Specification](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/5606ad47-5ee0-437a-817e-70c366052962)
- [NTLM Authentication Protocol](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/)
- [Implementation Plan (Issue #968)](https://github.com/progwise/george-ai/issues/968)

---

## 📄 License

See [LICENSE](../../LICENSE) for details.

Copyright (c) 2024 George AI / Michael H. Vogt
