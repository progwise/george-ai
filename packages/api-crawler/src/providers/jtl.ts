/**
 * JTL-Wawi API Provider
 * German e-commerce and warehouse management system
 */
import { createLogger } from '@george-ai/web-utils'

import type { ApiProvider, FetchConfig, RawApiItem } from './types'

const logger = createLogger('JTL Provider')

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

export const jtlProvider: ApiProvider = {
  id: 'jtl',
  name: 'JTL-Wawi',

  async *fetchItems(config: FetchConfig): AsyncGenerator<RawApiItem, void, void> {
    const { baseUrl, endpoint, headers, requestDelay } = config
    const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`

    let page = 1
    const pageSize = 100
    let hasMore = true

    logger.debug('Starting JTL-Wawi fetch from:', url)

    while (hasMore) {
      logger.debug(`Fetching page ${page}...`)

      // JTL uses GET with page and pageSize params
      const fetchUrl = `${url}?page=${page}&pageSize=${pageSize}`

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      })

      if (!response.ok) {
        throw new Error(`JTL-Wawi API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as {
        items?: RawApiItem[]
        data?: RawApiItem[]
        totalCount?: number
      }

      // JTL may use 'items' or 'data' as the array key
      const items = data.items || data.data || []

      logger.debug(`Page ${page}: ${items.length} items`)

      for (const item of items) {
        yield item
      }

      // Check if there are more items
      hasMore = items.length === pageSize
      page++

      // Rate limiting
      if (hasMore && requestDelay) {
        await delay(requestDelay)
      }
    }

    logger.debug('JTL-Wawi fetch complete')
  },

  buildOriginUri(baseUrl: string, item: RawApiItem): string | undefined {
    // JTL uses various ID fields
    const id = (item.id || item.kArtikel || item.articleId) as string | number | undefined
    if (!id) {
      return undefined
    }

    // JTL-Wawi API product endpoint
    const base = baseUrl.replace(/\/$/, '')
    return `${base}/api/v1/products/${id}`
  },

  extractTitle(item: RawApiItem): string | undefined {
    // JTL uses 'Name' or German field names
    const name = (item.Name || item.name || item.cName) as string | undefined
    if (name) {
      return name
    }

    // Fallback to article number (Artikelnummer/SKU)
    const sku = (item.Artikelnummer || item.cArtNr || item.sku || item.SKU) as string | undefined
    if (sku) {
      return `Article ${sku}`
    }

    return undefined
  },

  generateMarkdown(item: RawApiItem): string {
    const sections: string[] = []

    // Title
    const title = this.extractTitle(item) || 'Article'
    sections.push(`# ${title}`)

    // Article number (SKU)
    const sku = (item.Artikelnummer || item.cArtNr || item.sku || item.SKU) as string | undefined
    if (sku) {
      sections.push(`**Article Number (SKU):** ${sku}`)
    }

    // EAN/GTIN
    const ean = (item.EAN || item.cBarcode || item.GTIN || item.gtin) as string | undefined
    if (ean) {
      sections.push(`**EAN/GTIN:** ${ean}`)
    }

    // Manufacturer part number
    const mpn = (item.cHAN || item.HAN || item.ManufacturerPartNumber) as string | undefined
    if (mpn) {
      sections.push(`**Manufacturer Part Number:** ${mpn}`)
    }

    // Manufacturer
    const manufacturer = (item.Hersteller || item.cHersteller || item.Manufacturer) as string | undefined
    if (manufacturer) {
      sections.push(`**Manufacturer:** ${manufacturer}`)
    }

    // Short description
    const shortDesc = (item.Kurzbeschreibung || item.cKurzBeschreibung || item.ShortDescription) as string | undefined
    if (shortDesc) {
      sections.push('')
      sections.push('## Short Description')
      sections.push(shortDesc)
    }

    // Description
    const description = (item.Beschreibung || item.cBeschreibung || item.Description) as string | undefined
    if (description) {
      sections.push('')
      sections.push('## Description')
      sections.push(description)
    }

    // Prices
    const grossPrice = (item.BruttoVK || item.fVKBrutto || item.GrossPrice || item.priceGross) as number | undefined
    const netPrice = (item.NettoVK || item.fVKNetto || item.NetPrice || item.priceNet) as number | undefined
    const purchasePrice = (item.EKNetto || item.fEKNetto || item.PurchasePrice) as number | undefined

    if (grossPrice !== undefined || netPrice !== undefined || purchasePrice !== undefined) {
      sections.push('')
      sections.push('## Pricing')
      if (grossPrice !== undefined) {
        sections.push(`- **Gross Price:** ${formatPrice(grossPrice)} EUR`)
      }
      if (netPrice !== undefined) {
        sections.push(`- **Net Price:** ${formatPrice(netPrice)} EUR`)
      }
      if (purchasePrice !== undefined) {
        sections.push(`- **Purchase Price:** ${formatPrice(purchasePrice)} EUR`)
      }
    }

    // Tax rate
    const taxRate = (item.MwSt || item.fMwSt || item.TaxRate || item.taxRate) as number | undefined
    if (taxRate !== undefined) {
      sections.push(`- **Tax Rate:** ${taxRate}%`)
    }

    // Stock
    const stock = (item.Lagerbestand || item.fLagerbestand || item.Stock || item.stock) as number | undefined
    const minStock = (item.Mindestbestand || item.fMindestbestand || item.MinStock) as number | undefined

    if (stock !== undefined || minStock !== undefined) {
      sections.push('')
      sections.push('## Stock')
      if (stock !== undefined) {
        sections.push(`- **Current Stock:** ${stock}`)
      }
      if (minStock !== undefined) {
        sections.push(`- **Minimum Stock:** ${minStock}`)
      }
    }

    // Weight and dimensions
    const weight = (item.Gewicht || item.fGewicht || item.Weight || item.weight) as number | undefined
    const length = (item.Laenge || item.fLaenge || item.Length) as number | undefined
    const width = (item.Breite || item.fBreite || item.Width) as number | undefined
    const height = (item.Hoehe || item.fHoehe || item.Height) as number | undefined

    if (weight !== undefined || length !== undefined || width !== undefined || height !== undefined) {
      sections.push('')
      sections.push('## Dimensions')
      if (weight !== undefined) {
        sections.push(`- **Weight:** ${weight} kg`)
      }
      if (length !== undefined) {
        sections.push(`- **Length:** ${length} cm`)
      }
      if (width !== undefined) {
        sections.push(`- **Width:** ${width} cm`)
      }
      if (height !== undefined) {
        sections.push(`- **Height:** ${height} cm`)
      }
    }

    // Category
    const category = (item.Kategorie || item.cKategorie || item.Category) as string | undefined
    if (category) {
      sections.push('')
      sections.push('## Category')
      sections.push(category)
    }

    // Status / Active
    const active = (item.Aktiv || item.nAktiv || item.Active || item.active) as boolean | number | string | undefined
    if (active !== undefined) {
      const isActive = active === true || active === 1 || active === '1'
      sections.push('')
      sections.push('## Status')
      sections.push(`- **Active:** ${isActive ? 'Yes' : 'No'}`)
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
