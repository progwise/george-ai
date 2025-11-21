/**
 * No pagination - single request
 */
import { extractJsonPath } from '../field-mapping/json-path'
import type { HttpRequestParams } from '../types'
import { fetchJson } from '../utils/http'

export type FetchParams = {
  baseUrl: string
  endpoint: string
  method: string
  headers: Record<string, string>
  queryParams?: Record<string, string>
  dataPath: string
}

/**
 * Fetch data without pagination (single request)
 */
export async function fetchSingle(params: FetchParams): Promise<unknown[]> {
  const response = await fetchJson({
    baseUrl: params.baseUrl,
    endpoint: params.endpoint,
    method: params.method as HttpRequestParams['method'],
    headers: params.headers,
    queryParams: params.queryParams,
  })

  const items = extractJsonPath(response, params.dataPath)

  if (!Array.isArray(items)) {
    console.warn(`Data path "${params.dataPath}" did not return an array, wrapping in array`)
    return [items]
  }

  return items
}
