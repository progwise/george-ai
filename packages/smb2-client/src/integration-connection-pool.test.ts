/**
 * Connection Pool Integration Tests
 *
 * Tests connection pooling against real SMB server
 */
import { describe, expect, it } from 'vitest'

import { type ConnectionCredentials, ConnectionPool } from './session/connection-pool'

const testConfig: ConnectionCredentials = {
  host: process.env.SMB_TEST_HOST || 'gai-smb-test',
  port: 445,
  domain: 'WORKGROUP',
  username: 'testuser1',
  password: 'password123',
  share: 'public',
}

describe('ConnectionPool Integration', () => {
  it('should create and reuse connections', async () => {
    const pool = new ConnectionPool()

    try {
      // Acquire first connection
      const conn1 = await pool.acquire(testConfig)
      expect(conn1).toBeDefined()
      expect(conn1.sessionId).toBeDefined()
      expect(conn1.treeId).toBeDefined()
      expect(conn1.inUse).toBe(true)

      // Release it
      pool.release(conn1)
      expect(conn1.inUse).toBe(false)

      // Acquire again - should reuse same connection
      const conn2 = await pool.acquire(testConfig)
      expect(conn2).toBe(conn1) // Same object
      expect(conn2.inUse).toBe(true)

      pool.release(conn2)
    } finally {
      await pool.cleanup()
    }
  })

  it('should handle multiple concurrent connections', async () => {
    const pool = new ConnectionPool({ maxConnections: 3 })

    try {
      // Acquire multiple connections without releasing
      const conn1 = await pool.acquire(testConfig)
      const conn2 = await pool.acquire(testConfig)
      const conn3 = await pool.acquire(testConfig)

      expect(conn1).toBeDefined()
      expect(conn2).toBeDefined()
      expect(conn3).toBeDefined()

      // All should be different objects
      expect(conn2).not.toBe(conn1)
      expect(conn3).not.toBe(conn1)
      expect(conn3).not.toBe(conn2)

      // All should be in use
      expect(conn1.inUse).toBe(true)
      expect(conn2.inUse).toBe(true)
      expect(conn3.inUse).toBe(true)

      // Check stats
      const stats = pool.getStats()
      expect(stats.total).toBe(3)
      expect(stats.inUse).toBe(3)
      expect(stats.idle).toBe(0)

      // Release all
      pool.release(conn1)
      pool.release(conn2)
      pool.release(conn3)

      // Check stats after release
      const statsAfter = pool.getStats()
      expect(statsAfter.total).toBe(3)
      expect(statsAfter.inUse).toBe(0)
      expect(statsAfter.idle).toBe(3)
    } finally {
      await pool.cleanup()
    }
  })

  it('should enforce max connections limit', async () => {
    const pool = new ConnectionPool({ maxConnections: 2 })

    try {
      // Acquire max connections
      const conn1 = await pool.acquire(testConfig)
      const conn2 = await pool.acquire(testConfig)

      expect(conn1).toBeDefined()
      expect(conn2).toBeDefined()

      // Try to acquire one more - should throw
      await expect(pool.acquire(testConfig)).rejects.toThrow(/Connection pool limit reached/)

      // Release one and try again - should succeed
      pool.release(conn1)
      const conn3 = await pool.acquire(testConfig)
      expect(conn3).toBe(conn1) // Reused the released connection

      pool.release(conn2)
      pool.release(conn3)
    } finally {
      await pool.cleanup()
    }
  })

  it('should provide accurate statistics', async () => {
    const pool = new ConnectionPool()

    try {
      // Initially empty
      let stats = pool.getStats()
      expect(stats.total).toBe(0)
      expect(stats.inUse).toBe(0)
      expect(stats.idle).toBe(0)

      // Acquire 2, release 1
      const conn1 = await pool.acquire(testConfig)
      const conn2 = await pool.acquire(testConfig)
      pool.release(conn1)

      stats = pool.getStats()
      expect(stats.total).toBe(2)
      expect(stats.inUse).toBe(1)
      expect(stats.idle).toBe(1)

      // Release all
      pool.release(conn2)

      stats = pool.getStats()
      expect(stats.total).toBe(2)
      expect(stats.inUse).toBe(0)
      expect(stats.idle).toBe(2)
    } finally {
      await pool.cleanup()
    }
  })

  it('should cleanup idle connections after timeout', async () => {
    const pool = new ConnectionPool({
      idleTimeout: 1000, // 1 second
    })

    try {
      // Acquire and release a connection
      const conn = await pool.acquire(testConfig)
      pool.release(conn)

      // Verify it's in the pool
      let stats = pool.getStats()
      expect(stats.total).toBe(1)
      expect(stats.idle).toBe(1)

      // Wait for idle timeout + cleanup interval
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Should be cleaned up now
      stats = pool.getStats()
      expect(stats.total).toBe(0)
    } finally {
      await pool.cleanup()
    }
  })

  it('should maintain separate pools for different users', async () => {
    const pool = new ConnectionPool()

    try {
      // Acquire with first user
      const conn1 = await pool.acquire(testConfig)
      expect(conn1.username).toBe('testuser1')
      pool.release(conn1)

      // Acquire with different user - should create new connection
      const conn2 = await pool.acquire({
        ...testConfig,
        username: 'testuser2',
        password: 'password456', // testuser2's password
      })
      expect(conn2.username).toBe('testuser2')
      expect(conn2).not.toBe(conn1)

      // Verify stats show 2 connections
      const stats = pool.getStats()
      expect(stats.total).toBe(2)

      pool.release(conn2)
    } finally {
      await pool.cleanup()
    }
  })
})
