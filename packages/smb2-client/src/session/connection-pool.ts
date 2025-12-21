/**
 * SMB2 Connection Pool
 *
 * Manages a pool of SMB2 connections for better performance.
 * Pools complete sessions including authentication and tree connections.
 */
import { SMB2Connection } from '../protocol/connection'
import { SessionManager } from './session-manager'
import { TreeManager } from './tree-manager'

export interface ConnectionPoolOptions {
  maxConnections?: number // Maximum connections per server:port:share (default: 10)
  idleTimeout?: number // Idle timeout in ms (default: 60000 = 1 minute)
  connectionTimeout?: number // Connection timeout in ms (default: 10000)
}

/**
 * Credentials for establishing SMB2 connection
 */
export interface ConnectionCredentials {
  host: string
  port?: number
  domain?: string
  username: string
  password: string
  share: string
  workstation?: string
  timeout?: number
}

/**
 * Pooled connection with full SMB2 session state
 */
export interface PooledConnection {
  connection: SMB2Connection
  sessionManager: SessionManager
  treeManager: TreeManager
  sessionId: bigint
  treeId: number
  host: string
  port: number
  share: string
  domain: string
  username: string
  inUse: boolean
  lastUsed: Date
  createdAt: Date
}

export class ConnectionPool {
  private connections: PooledConnection[] = []
  private maxConnections: number
  private idleTimeout: number
  private connectionTimeout: number
  private cleanupInterval?: NodeJS.Timeout

  constructor(options: ConnectionPoolOptions = {}) {
    this.maxConnections = options.maxConnections ?? 10
    this.idleTimeout = options.idleTimeout ?? 60000 // 1 minute
    this.connectionTimeout = options.connectionTimeout ?? 10000 // 10 seconds

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections()
    }, this.idleTimeout / 2)
  }

  /**
   * Get pool key for connection matching
   */
  private getKey(creds: ConnectionCredentials): string {
    const port = creds.port ?? 445
    const domain = creds.domain ?? 'WORKGROUP'
    return `${creds.host}:${port}:${creds.share}:${domain}:${creds.username}`
  }

  /**
   * Acquire a connection from the pool
   *
   * Returns a complete SMB2 session with authentication and tree connection.
   * Reuses existing idle connections when possible.
   *
   * @param credentials - Connection credentials
   * @returns Pooled connection with session and tree info
   */
  async acquire(credentials: ConnectionCredentials): Promise<PooledConnection> {
    const port = credentials.port ?? 445
    const domain = credentials.domain ?? 'WORKGROUP'
    const poolKey = this.getKey(credentials)

    // Look for existing idle connection
    const existingPooled = this.connections.find(
      (c) =>
        c.host === credentials.host &&
        c.port === port &&
        c.share === credentials.share &&
        c.domain === domain &&
        c.username === credentials.username &&
        !c.inUse &&
        c.connection.isConnected(),
    )

    if (existingPooled) {
      existingPooled.inUse = true
      existingPooled.lastUsed = new Date()
      return existingPooled
    }

    // Check if we can create a new connection
    const matchingConnections = this.connections.filter(
      (c) =>
        c.host === credentials.host &&
        c.port === port &&
        c.share === credentials.share &&
        c.domain === domain &&
        c.username === credentials.username,
    )
    if (matchingConnections.length >= this.maxConnections) {
      throw new Error(`Connection pool limit reached for ${poolKey} (max: ${this.maxConnections})`)
    }

    // Create new connection with full session/tree setup
    const connection = new SMB2Connection({
      host: credentials.host,
      port,
      timeout: credentials.timeout ?? this.connectionTimeout,
    })

    await connection.connect()

    // Session setup (NEGOTIATE + SESSION_SETUP)
    const sessionManager = new SessionManager(connection, {
      domain,
      username: credentials.username,
      password: credentials.password,
      workstation: credentials.workstation ?? 'NODE-SMB2-CLIENT',
    })

    const sessionId = await sessionManager.authenticate()

    // Tree connect to share
    const treeManager = new TreeManager(connection, sessionId)
    const sharePath = `\\\\${credentials.host}\\${credentials.share}`
    const treeId = await treeManager.connect(sharePath)

    const newPooled: PooledConnection = {
      connection,
      sessionManager,
      treeManager,
      sessionId,
      treeId,
      host: credentials.host,
      port,
      share: credentials.share,
      domain,
      username: credentials.username,
      inUse: true,
      lastUsed: new Date(),
      createdAt: new Date(),
    }

    this.connections.push(newPooled)
    return newPooled
  }

  /**
   * Release a connection back to the pool
   *
   * Marks the connection as available for reuse.
   *
   * @param pooled - Pooled connection to release
   */
  release(pooled: PooledConnection): void {
    pooled.inUse = false
    pooled.lastUsed = new Date()
  }

  /**
   * Remove a connection from the pool
   *
   * Closes the connection and removes it from the pool.
   *
   * @param pooled - Pooled connection to remove
   */
  async remove(pooled: PooledConnection): Promise<void> {
    const index = this.connections.findIndex((c) => c === pooled)
    if (index !== -1) {
      await pooled.connection.close()
      this.connections.splice(index, 1)
    }
  }

  /**
   * Clean up idle connections
   */
  private async cleanupIdleConnections(): Promise<void> {
    const now = new Date()
    const idleConnections = this.connections.filter((c) => {
      if (c.inUse) return false
      const idleTime = now.getTime() - c.lastUsed.getTime()
      return idleTime > this.idleTimeout
    })

    for (const idlePooled of idleConnections) {
      await this.remove(idlePooled)
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number
    inUse: number
    idle: number
    byServer: Map<string, { total: number; inUse: number; idle: number }>
  } {
    const total = this.connections.length
    const inUse = this.connections.filter((c) => c.inUse).length
    const idle = total - inUse

    const byServer = new Map<string, { total: number; inUse: number; idle: number }>()
    for (const pooled of this.connections) {
      const key = `${pooled.host}:${pooled.port}`
      const stats = byServer.get(key) ?? { total: 0, inUse: 0, idle: 0 }
      stats.total++
      if (pooled.inUse) {
        stats.inUse++
      } else {
        stats.idle++
      }
      byServer.set(key, stats)
    }

    return { total, inUse, idle, byServer }
  }

  /**
   * Close all connections and stop cleanup
   */
  async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }

    // Close all connections
    for (const pooled of this.connections) {
      await pooled.connection.close()
    }

    this.connections = []
  }
}
