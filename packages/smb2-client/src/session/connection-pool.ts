/**
 * SMB2 Connection Pool
 *
 * Manages a pool of SMB2 connections for better performance
 */
import { SMB2Connection } from '../protocol/connection'

export interface ConnectionPoolOptions {
  maxConnections?: number // Maximum connections per server (default: 10)
  idleTimeout?: number // Idle timeout in ms (default: 60000 = 1 minute)
  connectionTimeout?: number // Connection timeout in ms (default: 10000)
}

interface PooledConnection {
  connection: SMB2Connection
  host: string
  port: number
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
   * Acquire a connection from the pool
   */
  async acquire(host: string, port: number = 445): Promise<SMB2Connection> {
    // Look for existing idle connection
    const existingPooled = this.connections.find(
      (c) => c.host === host && c.port === port && !c.inUse && c.connection.isConnected(),
    )

    if (existingPooled) {
      existingPooled.inUse = true
      existingPooled.lastUsed = new Date()
      return existingPooled.connection
    }

    // Check if we can create a new connection
    const serverConnections = this.connections.filter((c) => c.host === host && c.port === port)
    if (serverConnections.length >= this.maxConnections) {
      throw new Error(`Connection pool limit reached for ${host}:${port} (max: ${this.maxConnections})`)
    }

    // Create new connection
    const connection = new SMB2Connection({
      host,
      port,
      timeout: this.connectionTimeout,
    })

    await connection.connect()

    const newPooled: PooledConnection = {
      connection,
      host,
      port,
      inUse: true,
      lastUsed: new Date(),
      createdAt: new Date(),
    }

    this.connections.push(newPooled)
    return connection
  }

  /**
   * Release a connection back to the pool
   */
  release(connection: SMB2Connection): void {
    const pooled = this.connections.find((c) => c.connection === connection)
    if (pooled) {
      pooled.inUse = false
      pooled.lastUsed = new Date()
    }
  }

  /**
   * Remove a connection from the pool
   */
  async remove(connection: SMB2Connection): Promise<void> {
    const index = this.connections.findIndex((c) => c.connection === connection)
    if (index !== -1) {
      const pooled = this.connections[index]
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
      await this.remove(idlePooled.connection)
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
