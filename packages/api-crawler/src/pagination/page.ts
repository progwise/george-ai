/**
 * Page-based pagination
 * Example: ?page=1&pageSize=50, ?page=2&pageSize=50, etc.
 */
import { extractJsonPath } from '../field-mapping/json-path'
import type { HttpRequestParams, PaginationConfig } from '../types'
import { delay } from '../utils/delay'
import { fetchJson } from '../utils/http'
import type { FetchParams } from './none'

export type PagePaginationParams = FetchParams & {
  paginationConfig: PaginationConfig
  requestDelay?: number
}

/**
 * Fetch all items using page-based pagination
 */
export async function paginatePage(params: PagePaginationParams): Promise<unknown[]> {
  const pageParam = params.paginationConfig.pageParam || 'page'
  const pageSizeParam = params.paginationConfig.pageSizeParam || 'pageSize'
  const defaultPageSize = params.paginationConfig.defaultPageSize || 50

  const allItems: unknown[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const queryParams = {
      ...params.queryParams,
      [pageParam]: String(page),
      [pageSizeParam]: String(defaultPageSize),
    }

    const response = await fetchJson({
      baseUrl: params.baseUrl,
      endpoint: params.endpoint,
      method: params.method as HttpRequestParams['method'],
      headers: params.headers,
      queryParams,
    })

    const items = extractJsonPath(response, params.dataPath)

    if (!Array.isArray(items) || items.length === 0) {
      hasMore = false
    } else {
      allItems.push(...items)
      page++

      // If we got fewer items than requested, we're done
      if (items.length < defaultPageSize) {
        hasMore = false
      }
    }

    // Rate limiting
    if (hasMore && params.requestDelay) {
      await delay(params.requestDelay)
    }
  }

  return allItems
}
