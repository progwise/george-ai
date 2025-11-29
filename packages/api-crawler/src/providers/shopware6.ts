/**
 * Shopware 6 API Provider
 */
import { createLogger } from '@george-ai/web-utils'

import type { ApiProvider, FetchConfig, RawApiItem } from './types'

const logger = createLogger('Shopware6 Provider')

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
 * Convert HTML to plain text (basic)
 */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Format price for display
 */
function formatPrice(price: unknown): string {
  if (typeof price === 'number') {
    return price.toFixed(2)
  }
  if (typeof price === 'string') {
    return parseFloat(price).toFixed(2)
  }
  return String(price)
}

export const shopware6Provider: ApiProvider = {
  id: 'shopware6',
  name: 'Shopware 6',

  async *fetchItems(config: FetchConfig): AsyncGenerator<RawApiItem, void, void> {
    const { baseUrl, endpoint, headers, requestDelay } = config
    const base = baseUrl.replace(/\/$/, '')

    let page = 1
    const limit = 50
    let hasMore = true

    logger.debug('Starting Shopware 6 fetch from:', `${base}${endpoint}`)

    while (hasMore) {
      // Shopware 6 uses GET with query parameters for pagination
      const url = `${base}${endpoint}?page=${page}&limit=${limit}`
      logger.debug(`Fetching page ${page}...`, url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      })

      if (!response.ok) {
        throw new Error(`Shopware 6 API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as {
        data?: RawApiItem[]
        total?: number
      }

      const items = data.data || []
      const total = data.total || 0

      logger.debug(`Page ${page}: ${items.length} items (total: ${total})`)

      for (const item of items) {
        yield item
      }

      // Check if there are more pages
      // If we got a full page of items, there might be more
      hasMore = items.length === limit
      page++

      // Rate limiting
      if (hasMore && requestDelay) {
        await delay(requestDelay)
      }
    }

    logger.debug('Shopware 6 fetch complete')
  },

  buildOriginUri(baseUrl: string, item: RawApiItem): string | undefined {
    const id = item.id as string | undefined
    if (!id) {
      return undefined
    }

    // Shopware 6 single product endpoint: /api/product/{id}
    const base = baseUrl.replace(/\/$/, '')
    return `${base}/api/product/${id}`
  },

  extractTitle(item: RawApiItem): string | undefined {
    // Shopware stores translated content in 'translated' object
    const translatedName = getNestedValue(item, 'translated.name')
    if (typeof translatedName === 'string' && translatedName) {
      return translatedName
    }

    // Fallback to name field
    const name = item.name as string | undefined
    if (name) {
      return name
    }

    return undefined
  },

  generateMarkdown(item: RawApiItem): string {
    const sections: string[] = []

    // Title
    const title = this.extractTitle(item) || 'Product'
    sections.push(`# ${title}`)

    // Product number
    const productNumber = item.productNumber as string | undefined
    if (productNumber) {
      sections.push(`**Product Number:** ${productNumber}`)
    }

    // EAN
    const ean = item.ean as string | undefined
    if (ean) {
      sections.push(`**EAN:** ${ean}`)
    }

    // Manufacturer
    const manufacturerName =
      getNestedValue(item, 'manufacturer.translated.name') || getNestedValue(item, 'manufacturer.name')
    if (manufacturerName) {
      sections.push(`**Manufacturer:** ${manufacturerName}`)
    }

    // Price
    const prices = item.price as Array<{ gross?: number; net?: number; currencyId?: string }> | undefined
    if (prices && prices.length > 0) {
      const price = prices[0]
      sections.push('')
      sections.push('## Price')
      if (price.gross !== undefined) {
        sections.push(`- **Gross:** ${formatPrice(price.gross)} EUR`)
      }
      if (price.net !== undefined) {
        sections.push(`- **Net:** ${formatPrice(price.net)} EUR`)
      }
    }

    // Description
    const description = getNestedValue(item, 'translated.description') || item.description
    if (typeof description === 'string' && description) {
      sections.push('')
      sections.push('## Description')
      sections.push(htmlToText(description))
    }

    // Categories
    const categories = item.categories as Array<{ translated?: { name?: string }; name?: string }> | undefined
    if (categories && categories.length > 0) {
      const categoryNames = categories.map((c) => c.translated?.name || c.name).filter(Boolean)
      if (categoryNames.length > 0) {
        sections.push('')
        sections.push('## Categories')
        for (const name of categoryNames) {
          sections.push(`- ${name}`)
        }
      }
    }

    // Properties
    const properties = item.properties as
      | Array<{
          group?: { translated?: { name?: string }; name?: string }
          translated?: { name?: string }
          name?: string
        }>
      | undefined
    if (properties && properties.length > 0) {
      sections.push('')
      sections.push('## Properties')
      sections.push('')
      sections.push('| Property | Value |')
      sections.push('|----------|-------|')
      for (const prop of properties) {
        const groupName = prop.group?.translated?.name || prop.group?.name || 'Property'
        const valueName = prop.translated?.name || prop.name || ''
        sections.push(`| ${groupName} | ${valueName} |`)
      }
    }

    // Stock
    const stock = item.stock as number | undefined
    const active = item.active as boolean | undefined
    if (stock !== undefined || active !== undefined) {
      sections.push('')
      sections.push('## Availability')
      if (stock !== undefined) {
        sections.push(`- **Stock:** ${stock}`)
      }
      if (active !== undefined) {
        sections.push(`- **Active:** ${active ? 'Yes' : 'No'}`)
      }
    }

    // Raw JSON data
    sections.push('')
    sections.push('## Raw Data')
    sections.push('')
    sections.push('```json')
    sections.push(JSON.stringify(item, null, 2))
    sections.push('```')

    return sections.join('\n')
  },
}
