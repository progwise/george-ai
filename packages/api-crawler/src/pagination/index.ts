/**
 * Pagination module
 * Dispatches to appropriate pagination strategy
 */
import type { PaginationConfig, PaginationType } from '../types'
import { paginateCursor } from './cursor'
import { type FetchParams, fetchSingle } from './none'
import { paginateOffset } from './offset'
import { paginatePageStream } from './page'

export type PaginateFetchParams = FetchParams & {
  paginationType: PaginationType
  paginationConfig: PaginationConfig
  requestDelay?: number
}

/**
 * Fetch all items using the specified pagination strategy (streaming version)
 * Yields items as they are fetched
 */
export async function* paginateFetchStream(params: PaginateFetchParams): AsyncGenerator<unknown, void, void> {
  switch (params.paginationType) {
    case 'none': {
      const items = await fetchSingle(params)
      for (const item of items) {
        yield item
      }
      break
    }

    case 'offset': {
      const items = await paginateOffset({
        ...params,
        paginationConfig: params.paginationConfig,
      })
      for (const item of items) {
        yield item
      }
      break
    }

    case 'page':
      yield* paginatePageStream({
        ...params,
        paginationConfig: params.paginationConfig,
      })
      break

    case 'cursor': {
      const items = await paginateCursor({
        ...params,
        paginationConfig: params.paginationConfig,
      })
      for (const item of items) {
        yield item
      }
      break
    }

    default:
      throw new Error(`Unsupported pagination type: ${params.paginationType}`)
  }
}

/**
 * Fetch all items using the specified pagination strategy (batch version)
 * @deprecated Use paginateFetchStream for better performance
 */
export async function paginateFetch(params: PaginateFetchParams): Promise<unknown[]> {
  const items: unknown[] = []

  for await (const item of paginateFetchStream(params)) {
    items.push(item)
  }

  return items
}

// Re-export individual pagination functions for testing
export { fetchSingle } from './none'
export { paginateOffset } from './offset'
export { paginatePage, paginatePageStream } from './page'
export { paginateCursor } from './cursor'
