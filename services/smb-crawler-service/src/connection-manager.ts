/**
 * SMB2 Connection Manager
 *
 * Manages SMB2 client connections for crawling
 * Replaces the mount-based approach with direct SMB2 protocol access
 */
import { SMB2Client } from '@george-ai/smb2-client'

import { logger } from './common'

interface ConnectionOptions {
  crawlerId: string
  uri: string
  username: string
  password: string
}

interface ConnectionResult {
  success: boolean
  client?: SMB2Client
  sharePath?: string
  error?: string
}

// Store active connections
const connections = new Map<string, { client: SMB2Client; sharePath: string }>()

/**
 * Parse SMB URI into components
 */
function parseUri(uri: string): { host: string; share: string; path?: string } {
  // Handle both smb://server/share/path and //server/share/path formats
  const cleanUri = uri.replace(/^smb:/, '')
  const match = cleanUri.match(/^\/\/([^/]+)\/([^/]+)(?:\/(.*))?$/)

  if (!match) {
    logger.error('Invalid SMB URI format', { uri })
    throw new Error(`Invalid SMB URI format: ${uri}`)
  }

  return {
    host: match[1],
    share: match[2],
    path: match[3] || '',
  }
}

/**
 * Initialize connection manager
 */
export async function initializeConnectionManager(): Promise<void> {
  logger.info('ConnectionManager initialized')
}

/**
 * Create SMB2 connection and connect to share
 */
export async function createConnection(options: ConnectionOptions): Promise<ConnectionResult> {
  const { crawlerId, uri, username, password } = options

  logger.debug('Connection request', { crawlerId, uri })

  try {
    // Check if already connected
    if (connections.has(crawlerId)) {
      logger.debug('Already connected', { crawlerId })
      const existing = connections.get(crawlerId)!
      return { success: true, client: existing.client, sharePath: existing.sharePath }
    }

    // Parse URI
    const { host, share, path } = parseUri(uri)

    // Extract port if specified (e.g., server:445)
    const [hostname, portStr] = host.split(':')
    const port = portStr ? parseInt(portStr, 10) : 445

    // Extract domain from username - supports multiple formats:
    // 1. DOMAIN\username (NetBIOS format)
    // 2. username@domain.com (UPN format)
    // 3. username (plain, defaults to WORKGROUP)
    let domain = ''
    let actualUsername = username

    if (username.includes('\\')) {
      // Format: DOMAIN\username (NetBIOS)
      // Use lastIndexOf to handle edge cases with multiple backslashes
      const lastBackslashIndex = username.lastIndexOf('\\')
      if (lastBackslashIndex > 0 && lastBackslashIndex < username.length - 1) {
        domain = username.slice(0, lastBackslashIndex)
        actualUsername = username.slice(lastBackslashIndex + 1)
      }
    } else if (username.includes('@')) {
      // Format: username@domain.com (UPN)
      // Use lastIndexOf to handle edge cases with multiple @ symbols
      const lastAtIndex = username.lastIndexOf('@')
      if (lastAtIndex > 0 && lastAtIndex < username.length - 1) {
        actualUsername = username.slice(0, lastAtIndex)
        domain = username.slice(lastAtIndex + 1)
      }
    }
    // else: plain username, domain stays empty (defaults to WORKGROUP below)

    logger.info('Connecting to SMB share', { hostname, port, share })
    logger.info('Auth details - Parsed username', { actualUsername })
    logger.info('Auth details - Parsed domain', { domain: domain || 'WORKGROUP' })
    logger.info('Auth details - Password', { provided: password.length > 0 })

    // Create SMB2 client (share is required in constructor)
    const client = new SMB2Client({
      host: hostname,
      port,
      share,
      username: actualUsername,
      password,
      domain: domain || 'WORKGROUP',
    })

    // Connect to server and share (single operation)
    await client.connect()

    // Store the base path within the share (if any)
    const sharePath = path || ''

    // Store connection
    connections.set(crawlerId, { client, sharePath })

    logger.info('Connection success', { crawlerId })
    return { success: true, client, sharePath }
  } catch (error) {
    logger.error('Connection error', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Close SMB2 connection
 */
export async function closeConnection(crawlerId: string): Promise<{ success: boolean; error?: string }> {
  logger.info('Disconnect request', { crawlerId })

  try {
    const connection = connections.get(crawlerId)
    if (!connection) {
      logger.info('Not connected', { crawlerId })
      return { success: true }
    }

    // Disconnect the client
    await connection.client.disconnect()

    // Remove from map
    connections.delete(crawlerId)

    logger.info('Disconnect success', { crawlerId })
    return { success: true }
  } catch (error) {
    logger.error('Disconnect error', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get connection for a crawler ID
 */
export function getConnection(crawlerId: string): { client: SMB2Client; sharePath: string } | undefined {
  return connections.get(crawlerId)
}

/**
 * List all active connections
 */
export function listConnections(): Array<{ crawlerId: string; sharePath: string }> {
  return Array.from(connections.entries()).map(([crawlerId, { sharePath }]) => ({
    crawlerId,
    sharePath,
  }))
}
