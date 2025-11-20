/**
 * Cursor-based pagination
 * Example: ?cursor=abc123, response includes next_cursor for next page
 */
import { extractJsonPath } from '../field-mapping/json-path'
import type { HttpRequestParams, PaginationConfig } from '../types'
import { delay } from '../utils/delay'
import { fetchJson } from '../utils/http'
import type { FetchParams } from './none'

export type CursorPaginationParams = FetchParams & {
  paginationConfig: PaginationConfig
  requestDelay?: number
}

/**
 * Fetch all items using cursor-based pagination
 */
export async function paginateCursor(params: CursorPaginationParams): Promise<unknown[]> {
  const cursorParam = params.paginationConfig.cursorParam || 'cursor'
  const nextCursorPath = params.paginationConfig.nextCursorPath

  if (!nextCursorPath) {
    throw new Error('nextCursorPath is required for cursor-based pagination')
  }

  const allItems: unknown[] = []
  let cursor: string | null = null
  let hasMore = true

  while (hasMore) {
    const queryParams = {
      ...params.queryParams,
    }

    // Add cursor to query params if available
    if (cursor) {
      queryParams[cursorParam] = cursor
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

      // Get next cursor from response
      const nextCursor = extractJsonPath(response, nextCursorPath)

      if (nextCursor && typeof nextCursor === 'string') {
        cursor = nextCursor
      } else {
        // No more pages
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
