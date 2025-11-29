/**
 * Shopware 5 API Provider
 * Legacy Shopware e-commerce platform
 */
import { createLogger } from '@george-ai/web-utils'

import type { ApiProvider, FetchConfig, RawApiItem } from './types'

const logger = createLogger('Shopware5 Provider')

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

export const shopware5Provider: ApiProvider = {
  id: 'shopware5',
  name: 'Shopware 5',

  async *fetchItems(config: FetchConfig): AsyncGenerator<RawApiItem, void, void> {
    const { baseUrl, endpoint, headers, requestDelay } = config
    const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`

    let offset = 0
    const limit = 100
    let hasMore = true

    logger.debug('Starting Shopware 5 fetch from:', url)

    while (hasMore) {
      logger.debug(`Fetching offset ${offset}...`)

      // Shopware 5 uses GET with query params for pagination
      const fetchUrl = `${url}?start=${offset}&limit=${limit}`

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      })

      if (!response.ok) {
        throw new Error(`Shopware 5 API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as {
        data?: RawApiItem[]
        total?: number
      }

      const items = data.data || []
      const total = data.total || 0

      logger.debug(`Offset ${offset}: ${items.length} items (total: ${total})`)

      for (const item of items) {
        yield item
      }

      // Check if there are more items
      offset += limit
      hasMore = offset < total

      // Rate limiting
      if (hasMore && requestDelay) {
        await delay(requestDelay)
      }
    }

    logger.debug('Shopware 5 fetch complete')
  },

  buildOriginUri(baseUrl: string, item: RawApiItem): string | undefined {
    const id = item.id as number | string | undefined
    if (!id) {
      return undefined
    }

    // Shopware 5 article endpoint: /api/articles/{id}
    const base = baseUrl.replace(/\/$/, '')
    return `${base}/api/articles/${id}`
  },

  extractTitle(item: RawApiItem): string | undefined {
    // Shopware 5 uses 'name' field
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

    // Product number from mainDetail
    const productNumber = getNestedValue(item, 'mainDetail.number') as string | undefined
    if (productNumber) {
      sections.push(`**Product Number:** ${productNumber}`)
    }

    // EAN from mainDetail
    const ean = getNestedValue(item, 'mainDetail.ean') as string | undefined
    if (ean) {
      sections.push(`**EAN:** ${ean}`)
    }

    // Supplier number
    const supplierNumber = getNestedValue(item, 'mainDetail.supplierNumber') as string | undefined
    if (supplierNumber) {
      sections.push(`**Supplier Number:** ${supplierNumber}`)
    }

    // Supplier/Manufacturer
    const supplierName = getNestedValue(item, 'supplier.name') as string | undefined
    if (supplierName) {
      sections.push(`**Manufacturer:** ${supplierName}`)
    }

    // Short description
    const description = item.description as string | undefined
    if (description) {
      sections.push('')
      sections.push('## Short Description')
      sections.push(description)
    }

    // Long description (HTML)
    const descriptionLong = item.descriptionLong as string | undefined
    if (descriptionLong) {
      sections.push('')
      sections.push('## Description')
      sections.push(htmlToText(descriptionLong))
    }

    // Prices from mainDetail
    const prices = getNestedValue(item, 'mainDetail.prices') as Array<{
      price?: number
      pseudoPrice?: number
      customerGroupKey?: string
      from?: number
    }> | undefined
    if (prices && prices.length > 0) {
      sections.push('')
      sections.push('## Pricing')

      for (const priceEntry of prices) {
        const group = priceEntry.customerGroupKey || 'Default'
        if (priceEntry.price !== undefined) {
          sections.push(`- **${group} Price:** ${formatPrice(priceEntry.price)} EUR`)
        }
        if (priceEntry.pseudoPrice !== undefined && priceEntry.pseudoPrice > 0) {
          sections.push(`  - Pseudo Price: ${formatPrice(priceEntry.pseudoPrice)} EUR`)
        }
      }
    }

    // Stock from mainDetail
    const inStock = getNestedValue(item, 'mainDetail.inStock') as number | undefined
    const stockMin = getNestedValue(item, 'mainDetail.stockMin') as number | undefined
    if (inStock !== undefined || stockMin !== undefined) {
      sections.push('')
      sections.push('## Stock')
      if (inStock !== undefined) {
        sections.push(`- **In Stock:** ${inStock}`)
      }
      if (stockMin !== undefined) {
        sections.push(`- **Minimum Stock:** ${stockMin}`)
      }
    }

    // Dimensions from mainDetail
    const weight = getNestedValue(item, 'mainDetail.weight') as number | undefined
    const width = getNestedValue(item, 'mainDetail.width') as number | undefined
    const length = getNestedValue(item, 'mainDetail.len') as number | undefined
    const height = getNestedValue(item, 'mainDetail.height') as number | undefined

    if (weight !== undefined || width !== undefined || length !== undefined || height !== undefined) {
      sections.push('')
      sections.push('## Dimensions')
      if (weight !== undefined && weight > 0) {
        sections.push(`- **Weight:** ${weight} kg`)
      }
      if (length !== undefined && length > 0) {
        sections.push(`- **Length:** ${length} cm`)
      }
      if (width !== undefined && width > 0) {
        sections.push(`- **Width:** ${width} cm`)
      }
      if (height !== undefined && height > 0) {
        sections.push(`- **Height:** ${height} cm`)
      }
    }

    // Categories
    const categories = item.categories as Array<{ name?: string }> | undefined
    if (categories && categories.length > 0) {
      const categoryNames = categories.map((c) => c.name).filter(Boolean)
      if (categoryNames.length > 0) {
        sections.push('')
        sections.push('## Categories')
        for (const name of categoryNames) {
          sections.push(`- ${name}`)
        }
      }
    }

    // Keywords and meta
    const keywords = item.keywords as string | undefined
    const metaTitle = item.metaTitle as string | undefined
    if (keywords || metaTitle) {
      sections.push('')
      sections.push('## SEO')
      if (metaTitle) {
        sections.push(`- **Meta Title:** ${metaTitle}`)
      }
      if (keywords) {
        sections.push(`- **Keywords:** ${keywords}`)
      }
    }

    // Status
    const active = item.active as boolean | undefined
    const highlight = item.highlight as boolean | undefined
    if (active !== undefined || highlight !== undefined) {
      sections.push('')
      sections.push('## Status')
      if (active !== undefined) {
        sections.push(`- **Active:** ${active ? 'Yes' : 'No'}`)
      }
      if (highlight !== undefined) {
        sections.push(`- **Highlight:** ${highlight ? 'Yes' : 'No'}`)
      }
    }

    return sections.join('\n')
  },
}
