/**
 * HTTP client utilities using native fetch
 */
import type { HttpRequestParams, HttpResponse } from '../types'

/**
 * Build full URL with query parameters
 */
function buildUrl(baseUrl: string, endpoint: string, queryParams?: Record<string, string>): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${base}${path}`)

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  return url.toString()
}

/**
 * Make HTTP request using native fetch
 */
export async function fetchHttp<T = unknown>(params: HttpRequestParams): Promise<HttpResponse<T>> {
  const url = buildUrl(params.baseUrl, params.endpoint, params.queryParams)

  const controller = new AbortController()
  const timeoutId = params.timeout ? setTimeout(() => controller.abort(), params.timeout) : undefined

  try {
    const response = await fetch(url, {
      method: params.method,
      headers: params.headers,
      body: params.body ? JSON.stringify(params.body) : undefined,
      signal: controller.signal,
    })

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Convert Headers to plain object
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    return {
      data: data as T,
      status: response.status,
      headers,
    }
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${params.timeout}ms`)
      }
      throw error
    }

    throw new Error(`HTTP request failed: ${String(error)}`)
  }
}

/**
 * Fetch JSON data (convenience wrapper)
 */
export async function fetchJson<T = unknown>(params: HttpRequestParams): Promise<T> {
  const response = await fetchHttp<T>(params)
  return response.data
}
