/**
 * Offset-based pagination
 * Example: ?limit=50&offset=0, ?limit=50&offset=50, etc.
 */
import { extractJsonPath } from '../field-mapping/json-path'
import type { HttpRequestParams, PaginationConfig } from '../types'
import { delay } from '../utils/delay'
import { fetchJson } from '../utils/http'
import type { FetchParams } from './none'

export type OffsetPaginationParams = FetchParams & {
  paginationConfig: PaginationConfig
  requestDelay?: number
}

/**
 * Fetch all items using offset-based pagination
 */
export async function paginateOffset(params: OffsetPaginationParams): Promise<unknown[]> {
  const limitParam = params.paginationConfig.limitParam || 'limit'
  const offsetParam = params.paginationConfig.offsetParam || 'offset'
  const defaultLimit = params.paginationConfig.defaultLimit || 50

  const allItems: unknown[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const queryParams = {
      ...params.queryParams,
      [limitParam]: String(defaultLimit),
      [offsetParam]: String(offset),
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
      offset += items.length

      // If we got fewer items than requested, we're done
      if (items.length < defaultLimit) {
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
