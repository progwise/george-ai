import { createLogger } from '@george-ai/web-utils'

import type { ServiceProviderConfig } from './types'

const logger = createLogger('Provider Cache (obsolete)')

interface CacheEntry {
  providers: ServiceProviderConfig[]
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 60000 = 1 minute)
  maxSize?: number // Maximum number of workspaces to cache (default: 1000)
}

class ProviderCache {
  private cache = new Map<string, CacheEntry>()
  private loader: ((workspaceId: string) => Promise<ServiceProviderConfig[]>) | null = null
  private ttl = 60000 // 1 minute default
  private maxSize = 1000

  /**
   * Initialize the provider cache with a loader function
   * This must be called once on startup before using chat() or getEmbedding()
   *
   * @param loader - Function that fetches providers for a workspace from the database
   * @param options - Cache configuration options
   */
  initialize(loader: (workspaceId: string) => Promise<ServiceProviderConfig[]>, options?: CacheOptions): void {
    this.loader = loader
    if (options?.ttl !== undefined) {
      this.ttl = options.ttl
    }
    if (options?.maxSize !== undefined) {
      this.maxSize = options.maxSize
    }
    logger.info(`Provider cache initialized with TTL=${this.ttl}ms, maxSize=${this.maxSize}`)
  }

  /**
   * Get providers for a workspace (uses cache with TTL)
   */
  async getProviders(workspaceId: string): Promise<ServiceProviderConfig[]> {
    if (!this.loader) {
      throw new Error('Provider cache not initialized. Call initializeProviderCache() on startup.')
    }

    // Check cache
    const cached = this.cache.get(workspaceId)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.providers
    }

    // Load from database via injected loader
    const providers = await this.loader(workspaceId)

    // Enforce max size (LRU eviction)
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    // Cache with expiration
    this.cache.set(workspaceId, {
      providers,
      expiresAt: Date.now() + this.ttl,
    })

    return providers
  }

  /**
   * Invalidate cached providers for a workspace
   * Call this when admin updates provider configurations
   */
  invalidate(workspaceId: string): void {
    this.cache.delete(workspaceId)
    logger.info(`Invalidated provider cache for workspace: ${workspaceId}`)
  }

  /**
   * Clear all cached providers
   */
  clearAll(): void {
    this.cache.clear()
    logger.info('Cleared all provider cache entries')
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    }
  }
}

// Export singleton instance
export const providerCache = new ProviderCache()
