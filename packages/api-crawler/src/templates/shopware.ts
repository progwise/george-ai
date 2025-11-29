/**
 * Shopware 6 API template
 * Pre-configured template for Shopware 6 e-commerce API
 */
import type { ApiCrawlerConfig } from '../types'

/**
 * Shopware 6 API crawler template
 * User must provide: baseUrl, authConfig (clientId, clientSecret, tokenUrl)
 * Provider handles pagination, title extraction, markdown generation, and origin URIs
 *
 * Available associations for products (add/remove as needed):
 * - manufacturer: Product manufacturer with name and link
 * - categories: Product categories with breadcrumb paths
 * - cover.media: Main product image
 * - media.media: All product images
 * - properties.group: Product properties with group names
 * - unit: Sales unit (e.g., "Stück", "kg")
 * - tax: Tax rate information
 * - deliveryTime: Delivery time information
 * - prices: Advanced pricing rules
 * - options: Variant options
 * - configuratorSettings: Variant configurator
 * - crossSellings: Cross-selling products
 * - seoUrls: SEO URLs
 * - tags: Product tags
 */
export const shopwareTemplate: Omit<ApiCrawlerConfig, 'baseUrl' | 'authConfig'> = {
  provider: 'shopware6',
  endpoint: '/api/product',
  authType: 'oauth2',
  requestDelay: 100,
  maxConcurrency: 3,
  associationsConfig: {
    associations: ['manufacturer', 'categories', 'cover.media', 'media.media', 'properties.group', 'unit', 'tax'],
  },
}

/**
 * Create a complete Shopware 6 config from template
 */
export function createShopwareConfig(params: {
  baseUrl: string
  clientId: string
  clientSecret: string
  tokenUrl?: string
  /** Custom associations to load. If not provided, uses defaultShopwareAssociations */
  associations?: string[]
}): ApiCrawlerConfig {
  return {
    ...shopwareTemplate,
    baseUrl: params.baseUrl,
    authConfig: {
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      tokenUrl: params.tokenUrl || `${params.baseUrl}/api/oauth/token`,
    },
    // Override associations if custom ones provided
    ...(params.associations && {
      associationsConfig: {
        associations: params.associations,
      },
    }),
  }
}
