/**
 * Custom API Provider
 * Generic provider for user-configured APIs
 */
import { createLogger } from '@george-ai/web-utils'

import type { ApiProvider, CustomProviderConfig, FetchConfig, RawApiItem } from './types'

const logger = createLogger('Custom Provider')

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: RawApiItem, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/**
 * Convert value to string safely
 */
function toString(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(toString).join(', ')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Create a custom provider with user configuration
 */
export function createCustomProvider(
  baseUrl: string,
  endpoint: string,
  config?: CustomProviderConfig,
): ApiProvider {
  return {
    id: 'custom',
    name: 'Custom API',

    async *fetchItems(fetchConfig: FetchConfig): AsyncGenerator<RawApiItem, void, void> {
      const { headers, requestDelay } = fetchConfig
      const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`

      let page = 1
      const pageSize = 100
      let hasMore = true

      logger.debug('Starting custom API fetch from:', url)

      while (hasMore) {
        logger.debug(`Fetching page ${page}...`)

        // Generic GET request with page-based pagination
        const fetchUrl = `${url}?page=${page}&limit=${pageSize}`

        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...headers,
          },
        })

        if (!response.ok) {
          throw new Error(`Custom API error: ${response.status} ${response.statusText}`)
        }

        const data = (await response.json()) as RawApiItem | RawApiItem[]

        // Handle various response formats
        let items: RawApiItem[]
        if (Array.isArray(data)) {
          items = data
        } else if (data.data && Array.isArray(data.data)) {
          items = data.data as RawApiItem[]
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items as RawApiItem[]
        } else if (data.results && Array.isArray(data.results)) {
          items = data.results as RawApiItem[]
        } else {
          // Single object response
          items = [data]
          hasMore = false
        }

        logger.debug(`Page ${page}: ${items.length} items`)

        for (const item of items) {
          yield item
        }

        // Check if there are more items
        if (items.length < pageSize) {
          hasMore = false
        } else {
          page++
        }

        // Rate limiting
        if (hasMore && requestDelay) {
          await delay(requestDelay)
        }
      }

      logger.debug('Custom API fetch complete')
    },

    buildOriginUri(_baseUrl: string, item: RawApiItem): string | undefined {
      const base = baseUrl.replace(/\/$/, '')
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

      // If identifier field is configured, use it
      if (config?.identifierField) {
        const identifier = getNestedValue(item, config.identifierField)
        if (identifier !== undefined && identifier !== null) {
          return `${base}${path}#${config.identifierField}=${toString(identifier)}`
        }
      }

      // Try common identifier fields
      const commonFields = ['id', 'uuid', 'sku', 'productNumber', 'articleNumber', 'code']
      for (const field of commonFields) {
        const value = item[field]
        if (value !== undefined && value !== null) {
          return `${base}${path}#${field}=${toString(value)}`
        }
      }

      // No identifier found
      return undefined
    },

    extractTitle(item: RawApiItem): string | undefined {
      // If title field is configured, use it
      if (config?.titleField) {
        const title = getNestedValue(item, config.titleField)
        if (typeof title === 'string' && title) {
          return title
        }
      }

      // Default: try common title fields
      const titleFields = ['name', 'title', 'label', 'displayName', 'subject', 'heading']
      for (const field of titleFields) {
        const value = item[field]
        if (typeof value === 'string' && value) {
          return value
        }
      }

      return undefined
    },

    generateMarkdown(item: RawApiItem): string {
      const title = this.extractTitle(item) || 'Item'
      const sections: string[] = [`# ${title}`]

      sections.push('')
      sections.push('## Data')
      sections.push('')

      // Format all fields as a list
      const entries = Object.entries(item)
        .filter(([, value]) => value !== null && value !== undefined)

      for (const [key, value] of entries) {
        if (typeof value === 'object') {
          sections.push(`- **${key}:**`)
          sections.push('```json')
          sections.push(JSON.stringify(value, null, 2))
          sections.push('```')
        } else {
          sections.push(`- **${key}:** ${toString(value)}`)
        }
      }

      return sections.join('\n')
    },
  }
}
