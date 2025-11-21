/**
 * Page-based pagination
 * Example: ?page=1&pageSize=50, ?page=2&pageSize=50, etc.
 */
import { createLogger } from '@george-ai/web-utils'

import { extractJsonPath } from '../field-mapping/json-path'
import type { HttpRequestParams, PaginationConfig } from '../types'
import { delay } from '../utils/delay'
import { fetchJson } from '../utils/http'
import type { FetchParams } from './none'

const logger = createLogger('Pagination')

export type PagePaginationParams = FetchParams & {
  paginationConfig: PaginationConfig
  requestDelay?: number
}

/**
 * Fetch all items using page-based pagination (streaming version)
 * Yields items as each page is fetched
 */
export async function* paginatePageStream(params: PagePaginationParams): AsyncGenerator<unknown, void, void> {
  const pageParam = params.paginationConfig.pageParam || 'page'
  const pageSizeParam = params.paginationConfig.pageSizeParam || 'pageSize'
  const defaultPageSize = params.paginationConfig.defaultPageSize || 50

  logger.debug('Starting page-based pagination (streaming)')
  logger.debug('Page param:', pageParam, 'Size param:', pageSizeParam, 'Default size:', defaultPageSize)
  logger.debug('Data path:', params.dataPath)

  let page = 1
  let hasMore = true
  let totalYielded = 0

  while (hasMore) {
    const queryParams = {
      ...params.queryParams,
      [pageParam]: String(page),
      [pageSizeParam]: String(defaultPageSize),
    }

    logger.debug(`Fetching page ${page} with params:`, queryParams)

    const response = await fetchJson({
      baseUrl: params.baseUrl,
      endpoint: params.endpoint,
      method: params.method as HttpRequestParams['method'],
      headers: params.headers,
      queryParams,
    })

    logger.debug(
      `Page ${page} response keys:`,
      response && typeof response === 'object' ? Object.keys(response) : typeof response,
    )

    const items = extractJsonPath(response, params.dataPath)
    logger.debug(
      `Extracted items from path "${params.dataPath}":`,
      items ? (Array.isArray(items) ? `Array(${items.length})` : typeof items) : 'null/undefined',
    )

    if (!Array.isArray(items) || items.length === 0) {
      logger.info(`No more items found on page ${page}. Stopping pagination.`)
      hasMore = false
    } else {
      logger.info(`Page ${page} returned ${items.length} items`)

      // Yield each item individually
      for (const item of items) {
        totalYielded++
        yield item
      }

      page++

      // If we got fewer items than requested, we're done
      if (items.length < defaultPageSize) {
        logger.info(`Got fewer items (${items.length}) than page size (${defaultPageSize}). Last page reached.`)
        hasMore = false
      }
    }

    // Rate limiting
    if (hasMore && params.requestDelay) {
      logger.debug(`Delaying ${params.requestDelay}ms before next request`)
      await delay(params.requestDelay)
    }
  }

  logger.info(`Pagination complete. Total items yielded: ${totalYielded}`)
}

/**
 * Fetch all items using page-based pagination (batch version)
 * @deprecated Use paginatePageStream for better performance
 */
export async function paginatePage(params: PagePaginationParams): Promise<unknown[]> {
  const pageParam = params.paginationConfig.pageParam || 'page'
  const pageSizeParam = params.paginationConfig.pageSizeParam || 'pageSize'
  const defaultPageSize = params.paginationConfig.defaultPageSize || 50

  logger.debug('Starting page-based pagination')
  logger.debug('Page param:', pageParam, 'Size param:', pageSizeParam, 'Default size:', defaultPageSize)
  logger.debug('Data path:', params.dataPath)

  const allItems: unknown[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const queryParams = {
      ...params.queryParams,
      [pageParam]: String(page),
      [pageSizeParam]: String(defaultPageSize),
    }

    logger.debug(`Fetching page ${page} with params:`, queryParams)

    const response = await fetchJson({
      baseUrl: params.baseUrl,
      endpoint: params.endpoint,
      method: params.method as HttpRequestParams['method'],
      headers: params.headers,
      queryParams,
    })

    logger.debug(
      `Page ${page} response keys:`,
      response && typeof response === 'object' ? Object.keys(response) : typeof response,
    )

    const items = extractJsonPath(response, params.dataPath)
    logger.debug(
      `Extracted items from path "${params.dataPath}":`,
      items ? (Array.isArray(items) ? `Array(${items.length})` : typeof items) : 'null/undefined',
    )

    if (!Array.isArray(items) || items.length === 0) {
      logger.info(`No more items found on page ${page}. Stopping pagination.`)
      hasMore = false
    } else {
      logger.info(`Page ${page} returned ${items.length} items`)
      allItems.push(...items)
      page++

      // If we got fewer items than requested, we're done
      if (items.length < defaultPageSize) {
        logger.info(`Got fewer items (${items.length}) than page size (${defaultPageSize}). Last page reached.`)
        hasMore = false
      }
    }

    // Rate limiting
    if (hasMore && params.requestDelay) {
      logger.debug(`Delaying ${params.requestDelay}ms before next request`)
      await delay(params.requestDelay)
    }
  }

  logger.info(`Pagination complete. Total items: ${allItems.length}`)
  return allItems
}
