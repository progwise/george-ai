/**
 * Weclapp API template
 * Pre-configured template for Weclapp ERP API
 */
import type { ApiCrawlerConfig } from '../types'

/**
 * Weclapp API crawler template
 * User must provide: baseUrl (tenant-specific), authConfig (token)
 */
export const weclappTemplate: Omit<ApiCrawlerConfig, 'baseUrl' | 'authConfig'> = {
  endpoint: '/webapp/api/v1/article',
  method: 'GET',
  authType: 'bearer',
  headers: {
    Accept: 'application/json',
  },
  paginationType: 'page',
  paginationConfig: {
    pageParam: 'page',
    pageSizeParam: 'pageSize',
    defaultPageSize: 100,
  },
  dataPath: 'result',
  fieldMapping: {
    title: 'name',
    content: 'description',
    metadata: {
      articleNumber: 'articleNumber',
      ean: 'ean',
      manufacturer: 'manufacturerName',
      price: 'salesPrice',
      active: 'active',
    },
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
