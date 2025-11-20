/**
 * Shopware API template
 * Pre-configured template for Shopware e-commerce API
 */
import type { ApiCrawlerConfig } from '../types'

/**
 * Shopware API crawler template
 * User must provide: baseUrl, authConfig (clientId, clientSecret, tokenUrl)
 */
export const shopwareTemplate: Omit<ApiCrawlerConfig, 'baseUrl' | 'authConfig'> = {
  endpoint: '/api/product',
  method: 'GET',
  authType: 'oauth2',
  paginationType: 'page',
  paginationConfig: {
    pageParam: 'page',
    pageSizeParam: 'limit',
    defaultPageSize: 50,
  },
  dataPath: 'data',
  hasMorePath: 'meta.pagination.total',
  fieldMapping: {
    title: 'name',
    content: 'description',
    metadata: {
      sku: 'productNumber',
      manufacturer: 'manufacturer.name',
      price: 'price[0].net',
      ean: 'ean',
      stock: 'stock',
      active: 'active',
    },
  },
  requestDelay: 100,
  maxConcurrency: 3,
}

/**
 * Create a complete Shopware config from template
 */
export function createShopwareConfig(params: {
  baseUrl: string
  clientId: string
  clientSecret: string
  tokenUrl?: string
}): ApiCrawlerConfig {
  return {
    ...shopwareTemplate,
    baseUrl: params.baseUrl,
    authConfig: {
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      tokenUrl: params.tokenUrl || `${params.baseUrl}/api/oauth/token`,
    },
  }
}
