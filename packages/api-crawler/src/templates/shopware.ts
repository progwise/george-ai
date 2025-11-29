/**
 * Shopware 6 API template
 * Pre-configured template for Shopware 6 e-commerce API
 */
import type { ApiCrawlerConfig } from '../types'

/**
 * Shopware 6 API crawler template
 * User must provide: baseUrl, authConfig (clientId, clientSecret, tokenUrl)
 * Provider handles pagination, title extraction, markdown generation, and origin URIs
 */
export const shopwareTemplate: Omit<ApiCrawlerConfig, 'baseUrl' | 'authConfig'> = {
  provider: 'shopware6',
  endpoint: '/api/product',
  authType: 'oauth2',
  requestDelay: 100,
  maxConcurrency: 3,
}

/**
 * Create a complete Shopware 6 config from template
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
