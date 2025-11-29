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

/**
 * Build associations object for Shopware 6 Search API
 * Converts array of association names to nested object structure
 * Example: ['manufacturer', 'categories'] -> { manufacturer: {}, categories: {} }
 */
function buildAssociationsObject(associations?: string[]): Record<string, object> | undefined {
  if (!associations || associations.length === 0) {
    return undefined
  }

  const result: Record<string, object> = {}
  for (const assoc of associations) {
    // Support nested associations like 'cover.media'
    const parts = assoc.split('.')
    let current = result
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index]
      if (!current[part]) {
        current[part] = {}
      }
      if (index < parts.length - 1) {
        current = current[part] as Record<string, object>
      }
    }
  }
  return result
}

/**
 * Convert endpoint to search endpoint
 * /api/product -> /api/search/product
 * /api/category -> /api/search/category
 */
function toSearchEndpoint(endpoint: string): string {
  // If already a search endpoint, return as-is
  if (endpoint.includes('/search/')) {
    return endpoint
  }

  // Convert /api/{entity} to /api/search/{entity}
  return endpoint.replace(/^\/api\//, '/api/search/')
}

export const shopware6Provider: ApiProvider = {
  id: 'shopware6',
  name: 'Shopware 6',

  async *fetchItems(config: FetchConfig): AsyncGenerator<RawApiItem, void, void> {
    const { baseUrl, endpoint, headers, requestDelay, associations } = config
    const base = baseUrl.replace(/\/$/, '')

    // Use Search API endpoint for POST with associations
    const searchEndpoint = toSearchEndpoint(endpoint)
    const url = `${base}${searchEndpoint}`

    let page = 1
    const limit = 50
    let hasMore = true

    // Build associations object from array
    const associationsObject = buildAssociationsObject(associations)

    logger.debug('Starting Shopware 6 fetch from:', url)
    if (associations && associations.length > 0) {
      logger.debug('With associations:', associations.join(', '))
    }

    while (hasMore) {
      logger.debug(`Fetching page ${page}...`)

      // Build request body for Search API
      const body: Record<string, unknown> = {
        page,
        limit,
      }

      // Add associations if configured
      if (associationsObject) {
        body.associations = associationsObject
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
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

    // Basic product info section
    sections.push('')
    sections.push('## Product Information')

    // Product number
    const productNumber = item.productNumber as string | undefined
    if (productNumber) {
      sections.push(`- **Product Number:** ${productNumber}`)
    }

    // EAN
    const ean = item.ean as string | undefined
    if (ean) {
      sections.push(`- **EAN:** ${ean}`)
    }

    // Manufacturer number
    const manufacturerNumber = item.manufacturerNumber as string | undefined
    if (manufacturerNumber) {
      sections.push(`- **Manufacturer Number:** ${manufacturerNumber}`)
    }

    // Manufacturer
    const manufacturerName =
      getNestedValue(item, 'manufacturer.translated.name') || getNestedValue(item, 'manufacturer.name')
    if (manufacturerName) {
      sections.push(`- **Manufacturer:** ${manufacturerName}`)
    }

    // Manufacturer link
    const manufacturerLink = getNestedValue(item, 'manufacturer.link') as string | undefined
    if (manufacturerLink) {
      sections.push(`- **Manufacturer Link:** ${manufacturerLink}`)
    }

    // Unit (if loaded via associations)
    const unit = item.unit as
      | {
          translated?: { name?: string; shortCode?: string }
          name?: string
          shortCode?: string
        }
      | undefined
    if (unit) {
      const unitName = unit.translated?.name || unit.name
      const unitShort = unit.translated?.shortCode || unit.shortCode
      if (unitName || unitShort) {
        sections.push(`- **Unit:** ${unitName || ''}${unitShort ? ` (${unitShort})` : ''}`)
      }
    }

    // Tax rate
    const taxRate = getNestedValue(item, 'tax.taxRate') as number | undefined
    const taxName = getNestedValue(item, 'tax.name') as string | undefined
    if (taxRate !== undefined) {
      sections.push(`- **Tax Rate:** ${taxRate}%${taxName ? ` (${taxName})` : ''}`)
    }

    // Price section
    const prices = item.price as Array<{ gross?: number; net?: number; currencyId?: string }> | undefined
    const purchasePrices = item.purchasePrices as Array<{ gross?: number; net?: number }> | undefined
    if ((prices && prices.length > 0) || (purchasePrices && purchasePrices.length > 0)) {
      sections.push('')
      sections.push('## Pricing')
      if (prices && prices.length > 0) {
        const price = prices[0]
        if (price.gross !== undefined) {
          sections.push(`- **Gross Price:** ${formatPrice(price.gross)} EUR`)
        }
        if (price.net !== undefined) {
          sections.push(`- **Net Price:** ${formatPrice(price.net)} EUR`)
        }
      }
      if (purchasePrices && purchasePrices.length > 0) {
        const purchasePrice = purchasePrices[0]
        if (purchasePrice.net !== undefined && purchasePrice.net > 0) {
          sections.push(`- **Purchase Price (Net):** ${formatPrice(purchasePrice.net)} EUR`)
        }
      }
    }

    // Description
    const description = getNestedValue(item, 'translated.description') || item.description
    if (typeof description === 'string' && description) {
      sections.push('')
      sections.push('## Description')
      sections.push(htmlToText(description))
    }

    // Categories with breadcrumbs
    const categories = item.categories as
      | Array<{
          translated?: { name?: string; breadcrumb?: string[] }
          name?: string
          breadcrumb?: string[]
        }>
      | undefined
    if (categories && categories.length > 0) {
      sections.push('')
      sections.push('## Categories')
      for (const cat of categories) {
        const breadcrumb = cat.translated?.breadcrumb || cat.breadcrumb
        if (breadcrumb && breadcrumb.length > 0) {
          sections.push(`- ${breadcrumb.join(' > ')}`)
        } else {
          const catName = cat.translated?.name || cat.name
          if (catName) {
            sections.push(`- ${catName}`)
          }
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

    // Physical dimensions and weight
    const weight = item.weight as number | undefined
    const width = item.width as number | undefined
    const height = item.height as number | undefined
    const length = item.length as number | undefined
    if (weight !== undefined || width !== undefined || height !== undefined || length !== undefined) {
      sections.push('')
      sections.push('## Dimensions & Weight')
      if (weight !== undefined) {
        sections.push(`- **Weight:** ${weight} kg`)
      }
      if (length !== undefined) {
        sections.push(`- **Length:** ${length} mm`)
      }
      if (width !== undefined) {
        sections.push(`- **Width:** ${width} mm`)
      }
      if (height !== undefined) {
        sections.push(`- **Height:** ${height} mm`)
      }
    }

    // Availability and stock
    const stock = item.stock as number | undefined
    const availableStock = item.availableStock as number | undefined
    const available = item.available as boolean | undefined
    const active = item.active as boolean | undefined
    const shippingFree = item.shippingFree as boolean | undefined
    const isCloseout = item.isCloseout as boolean | undefined
    const minPurchase = item.minPurchase as number | undefined
    const maxPurchase = item.maxPurchase as number | undefined
    const purchaseSteps = item.purchaseSteps as number | undefined

    sections.push('')
    sections.push('## Availability & Stock')
    if (active !== undefined) {
      sections.push(`- **Active:** ${active ? 'Yes' : 'No'}`)
    }
    if (available !== undefined) {
      sections.push(`- **Available:** ${available ? 'Yes' : 'No'}`)
    }
    if (stock !== undefined) {
      sections.push(`- **Stock:** ${stock}`)
    }
    if (availableStock !== undefined && availableStock !== stock) {
      sections.push(`- **Available Stock:** ${availableStock}`)
    }
    if (isCloseout !== undefined && isCloseout) {
      sections.push(`- **Closeout:** Yes (sell until stock is 0)`)
    }
    if (shippingFree !== undefined && shippingFree) {
      sections.push(`- **Shipping Free:** Yes`)
    }

    // Purchase settings
    if (minPurchase !== undefined && minPurchase > 1) {
      sections.push(`- **Minimum Purchase:** ${minPurchase}`)
    }
    if (maxPurchase !== undefined) {
      sections.push(`- **Maximum Purchase:** ${maxPurchase}`)
    }
    if (purchaseSteps !== undefined && purchaseSteps > 1) {
      sections.push(`- **Purchase Steps:** ${purchaseSteps}`)
    }

    // Cover image (if loaded via associations)
    const cover = item.cover as
      | { media?: { url?: string; alt?: string; title?: string; fileName?: string } }
      | undefined
    if (cover?.media?.url) {
      sections.push('')
      sections.push('## Cover Image')
      const alt = cover.media.alt || cover.media.title || cover.media.fileName || 'Product image'
      sections.push(`![${alt}](${cover.media.url})`)
    }

    // Media gallery (if loaded via associations)
    const media = item.media as
      | Array<{
          media?: { url?: string; alt?: string; title?: string; fileName?: string }
        }>
      | undefined
    if (media && media.length > 0) {
      const mediaUrls = media.filter((m) => m.media?.url).map((m) => m.media!)
      if (mediaUrls.length > 0) {
        sections.push('')
        sections.push('## Product Images')
        for (const m of mediaUrls) {
          const alt = m.alt || m.title || m.fileName || 'Product image'
          sections.push(`- ![${alt}](${m.url})`)
        }
      }
    }

    // Custom fields
    const customFields = (getNestedValue(item, 'translated.customFields') || item.customFields) as
      | Record<string, unknown>
      | undefined
    if (customFields && Object.keys(customFields).length > 0) {
      const nonEmptyFields = Object.entries(customFields).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      )
      if (nonEmptyFields.length > 0) {
        sections.push('')
        sections.push('## Custom Fields')
        for (const [key, value] of nonEmptyFields) {
          if (typeof value === 'boolean') {
            sections.push(`- **${key}:** ${value ? 'Yes' : 'No'}`)
          } else if (typeof value === 'object') {
            sections.push(`- **${key}:** ${JSON.stringify(value)}`)
          } else {
            sections.push(`- **${key}:** ${value}`)
          }
        }
      }
    }

    // Metadata
    const createdAt = item.createdAt as string | undefined
    const updatedAt = item.updatedAt as string | undefined
    const releaseDate = item.releaseDate as string | undefined
    if (createdAt || updatedAt || releaseDate) {
      sections.push('')
      sections.push('## Metadata')
      if (releaseDate) {
        sections.push(`- **Release Date:** ${releaseDate}`)
      }
      if (createdAt) {
        sections.push(`- **Created:** ${createdAt}`)
      }
      if (updatedAt) {
        sections.push(`- **Last Updated:** ${updatedAt}`)
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
