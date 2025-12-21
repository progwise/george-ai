/**
 * @george-ai/smb2-client
 *
 * Zero-dependency SMB2 client library for Node.js
 *
 * @example
 * ```typescript
 * import { SMB2Client } from '@george-ai/smb2-client'
 *
 * const client = new SMB2Client({
 *   host: 'fileserver.local',
 *   share: 'documents',
 *   username: 'user',
 *   password: 'password',
 * })
 *
 * const files = await client.readdir('/')
 * console.log('Files:', files.map(f => f.name))
 *
 * await client.disconnect()
 * ```
 */

// ============================================================================
// High-Level API (Primary)
// ============================================================================

/**
 * High-level SMB2 client with intuitive Node.js-like API
 */
export { SMB2Client, type SMB2ClientOptions } from './client'

/**
 * Custom error class for SMB2 operations
 */
export { SMB2ClientError } from './utils/errors'

/**
 * File and directory metadata types
 */
export type { FileMetadata } from './file-operations/directory'

/**
 * File read options
 */
export type { ReadFileOptions } from './file-operations/file'

// ============================================================================
// Low-Level Protocol API (Advanced Users)
// ============================================================================

/**
 * Low-level SMB2 connection
 */
export { SMB2Connection } from './protocol/connection'

/**
 * SMB2 message structure
 */
export { SMB2Message } from './protocol/message'

/**
 * SMB2 protocol constants
 */
export * from './protocol/constants'

/**
 * SMB2 protocol types
 */
export type {
  SMB2Header,
  NegotiateResponse,
  SessionSetupResponse,
  TreeConnectResponse,
  CreateResponse,
  ReadResponse,
  CloseResponse,
  QueryDirectoryResponse,
  QueryInfoResponse,
} from './protocol/types'

// ============================================================================
// Session Management (Advanced Users)
// ============================================================================

/**
 * Session manager for NEGOTIATE + SESSION_SETUP
 */
export { SessionManager, SessionState, type SessionCredentials } from './session/session-manager'

/**
 * Tree manager for TREE_CONNECT
 */
export { TreeManager, type TreeConnection } from './session/tree-manager'

/**
 * Connection pool for managing multiple connections
 */
export {
  ConnectionPool,
  type ConnectionPoolOptions,
  type ConnectionCredentials,
  type PooledConnection,
} from './session/connection-pool'
