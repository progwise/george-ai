/**
 * Weclapp API Provider
 * ERP system for article/product management
 */
import { createLogger } from '@george-ai/web-utils'

import type { ApiProvider, FetchConfig, RawApiItem } from './types'

const logger = createLogger('Weclapp Provider')

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

export const weclappProvider: ApiProvider = {
  id: 'weclapp',
  name: 'Weclapp',

  async *fetchItems(config: FetchConfig): AsyncGenerator<RawApiItem, void, void> {
    const { baseUrl, endpoint, headers, requestDelay } = config
    const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`

    let page = 1
    const pageSize = 100
    let hasMore = true

    logger.debug('Starting Weclapp fetch from:', url)

    while (hasMore) {
      logger.debug(`Fetching page ${page}...`)

      // Weclapp uses GET with page and pageSize params
      const fetchUrl = `${url}?page=${page}&pageSize=${pageSize}`

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      })

      if (!response.ok) {
        throw new Error(`Weclapp API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as {
        result?: RawApiItem[]
      }

      const items = data.result || []

      logger.debug(`Page ${page}: ${items.length} items`)

      for (const item of items) {
        yield item
      }

      // Check if there are more items (less than pageSize means last page)
      hasMore = items.length === pageSize
      page++

      // Rate limiting
      if (hasMore && requestDelay) {
        await delay(requestDelay)
      }
    }

    logger.debug('Weclapp fetch complete')
  },

  buildOriginUri(baseUrl: string, item: RawApiItem): string | undefined {
    const id = item.id as string | undefined
    if (!id) {
      return undefined
    }

    // Weclapp single article endpoint: /webapp/api/v1/article/id/{id}
    const base = baseUrl.replace(/\/$/, '')
    return `${base}/webapp/api/v1/article/id/${id}`
  },

  extractTitle(item: RawApiItem): string | undefined {
    // Weclapp uses 'name' field for article name
    const name = item.name as string | undefined
    if (name) {
      return name
    }

    // Fallback to articleNumber
    const articleNumber = item.articleNumber as string | undefined
    if (articleNumber) {
      return `Article ${articleNumber}`
    }

    return undefined
  },

  generateMarkdown(item: RawApiItem): string {
    const sections: string[] = []

    // Title
    const title = this.extractTitle(item) || 'Article'
    sections.push(`# ${title}`)

    // Article number
    const articleNumber = item.articleNumber as string | undefined
    if (articleNumber) {
      sections.push(`**Article Number:** ${articleNumber}`)
    }

    // EAN
    const ean = item.ean as string | undefined
    if (ean) {
      sections.push(`**EAN:** ${ean}`)
    }

    // Manufacturer part number
    const manufacturerPartNumber = item.manufacturerPartNumber as string | undefined
    if (manufacturerPartNumber) {
      sections.push(`**Manufacturer Part Number:** ${manufacturerPartNumber}`)
    }

    // Unit
    const unitName = getNestedValue(item, 'unit.name') || item.unitName
    if (unitName) {
      sections.push(`**Unit:** ${unitName}`)
    }

    // Description
    const description = item.description as string | undefined
    if (description) {
      sections.push('')
      sections.push('## Description')
      sections.push(description)
    }

    // Long description / additional info
    const longDescription = item.longDescription as string | undefined
    if (longDescription) {
      sections.push('')
      sections.push('## Details')
      sections.push(longDescription)
    }

    // Prices
    const salesPrice = item.salesPrice as number | undefined
    const purchasePrice = item.purchasePrice as number | undefined
    if (salesPrice !== undefined || purchasePrice !== undefined) {
      sections.push('')
      sections.push('## Pricing')
      if (salesPrice !== undefined) {
        sections.push(`- **Sales Price:** ${formatPrice(salesPrice)} EUR`)
      }
      if (purchasePrice !== undefined) {
        sections.push(`- **Purchase Price:** ${formatPrice(purchasePrice)} EUR`)
      }
    }

    // Article prices (more detailed pricing)
    const articlePrices = item.articlePrices as
      | Array<{
          price?: number
          priceScaleType?: string
          currencyId?: string
        }>
      | undefined
    if (articlePrices && articlePrices.length > 0) {
      sections.push('')
      sections.push('## Price List')
      for (const ap of articlePrices) {
        if (ap.price !== undefined) {
          const scaleType = ap.priceScaleType ? ` (${ap.priceScaleType})` : ''
          sections.push(`- ${formatPrice(ap.price)} EUR${scaleType}`)
        }
      }
    }

    // Stock information
    const availableStock = item.availableStock as number | undefined
    const stockWarningLevel = item.stockWarningLevel as number | undefined
    if (availableStock !== undefined || stockWarningLevel !== undefined) {
      sections.push('')
      sections.push('## Stock')
      if (availableStock !== undefined) {
        sections.push(`- **Available Stock:** ${availableStock}`)
      }
      if (stockWarningLevel !== undefined) {
        sections.push(`- **Warning Level:** ${stockWarningLevel}`)
      }
    }

    // Categories
    const articleCategoryId = item.articleCategoryId as string | undefined
    const articleCategory = item.articleCategory as { name?: string } | undefined
    if (articleCategory?.name || articleCategoryId) {
      sections.push('')
      sections.push('## Category')
      sections.push(articleCategory?.name || `Category ID: ${articleCategoryId}`)
    }

    // Custom attributes
    const customAttributes = item.customAttributes as
      | Array<{
          attributeDefinitionId?: string
          stringValue?: string
          numberValue?: number
          booleanValue?: boolean
          dateValue?: number
        }>
      | undefined
    if (customAttributes && customAttributes.length > 0) {
      sections.push('')
      sections.push('## Custom Attributes')
      for (const attr of customAttributes) {
        const value = attr.stringValue || attr.numberValue || attr.booleanValue || attr.dateValue
        if (value !== undefined) {
          sections.push(`- ${attr.attributeDefinitionId}: ${value}`)
        }
      }
    }

    // Status
    const active = item.active as boolean | undefined
    if (active !== undefined) {
      sections.push('')
      sections.push('## Status')
      sections.push(`- **Active:** ${active ? 'Yes' : 'No'}`)
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
