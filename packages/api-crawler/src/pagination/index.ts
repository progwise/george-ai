/**
 * Pagination module
 * Dispatches to appropriate pagination strategy
 */
import type { PaginationConfig, PaginationType } from '../types'
import { paginateCursor } from './cursor'
import { type FetchParams, fetchSingle } from './none'
import { paginateOffset } from './offset'
import { paginatePage } from './page'

export type PaginateFetchParams = FetchParams & {
  paginationType: PaginationType
  paginationConfig: PaginationConfig
  requestDelay?: number
}

/**
 * Fetch all items using the specified pagination strategy
 */
export async function paginateFetch(params: PaginateFetchParams): Promise<unknown[]> {
  switch (params.paginationType) {
    case 'none':
      return await fetchSingle(params)

    case 'offset':
      return await paginateOffset({
        ...params,
        paginationConfig: params.paginationConfig,
      })

    case 'page':
      return await paginatePage({
        ...params,
        paginationConfig: params.paginationConfig,
      })

    case 'cursor':
      return await paginateCursor({
        ...params,
        paginationConfig: params.paginationConfig,
      })

    default:
      throw new Error(`Unsupported pagination type: ${params.paginationType}`)
  }
}

// Re-export individual pagination functions for testing
export { fetchSingle } from './none'
export { paginateOffset } from './offset'
export { paginatePage } from './page'
export { paginateCursor } from './cursor'
