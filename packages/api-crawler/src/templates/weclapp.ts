/**
 * Weclapp API template
 * Pre-configured template for Weclapp ERP API
 */
import type { ApiCrawlerConfig } from '../types'

/**
 * Weclapp API crawler template
 * User must provide: baseUrl (tenant-specific), authConfig (token)
 * Provider handles pagination, title extraction, markdown generation, and origin URIs
 */
export const weclappTemplate: Omit<ApiCrawlerConfig, 'baseUrl' | 'authConfig'> = {
  provider: 'weclapp',
  endpoint: '/webapp/api/v1/article',
  authType: 'bearer',
  headers: {
    Accept: 'application/json',
  },
  requestDelay: 100,
  maxConcurrency: 3,
}

/**
 * Create a complete Weclapp config from template
 */
export function createWeclappConfig(params: { baseUrl: string; token: string }): ApiCrawlerConfig {
  return {
    ...weclappTemplate,
    baseUrl: params.baseUrl,
    authConfig: {
      token: params.token,
    },
  }
}
