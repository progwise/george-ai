/**
 * Main crawl function
 * Orchestrates authentication, pagination, and field mapping
 */
import { authenticate } from './auth'
import { mapFieldsMulti } from './field-mapping'
import { paginateFetch } from './pagination'
import type { ApiCrawlerConfig, CrawlResult, ValidationResult } from './types'
import { fetchJson } from './utils/http'
import { validateConfig } from './utils/validate'

/**
 * Crawl an API endpoint and extract data
 * Main entry point for the package
 */
export async function crawlApi(config: ApiCrawlerConfig): Promise<CrawlResult> {
  try {
    // 1. Validate configuration
    const validatedConfig = validateConfig(config)

    // 2. Authenticate
    const authHeaders = await authenticate(validatedConfig.authType, validatedConfig.authConfig)

    // 3. Fetch all pages
    const allItems = await paginateFetch({
      baseUrl: validatedConfig.baseUrl,
      endpoint: validatedConfig.endpoint,
      method: validatedConfig.method,
      headers: { ...validatedConfig.headers, ...authHeaders },
      queryParams: validatedConfig.queryParams,
      paginationType: validatedConfig.paginationType,
      paginationConfig: validatedConfig.paginationConfig,
      dataPath: validatedConfig.dataPath,
      requestDelay: validatedConfig.requestDelay,
    })

    // 4. Map fields to George AI document format
    const mappedItems = mapFieldsMulti(allItems, validatedConfig.fieldMapping)

    return {
      items: mappedItems,
      totalFetched: mappedItems.length,
      success: true,
    }
  } catch (error) {
    console.error('Crawl error:', error)

    return {
      items: [],
      totalFetched: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Validate API connection before crawling
 * Makes a single request to test authentication and endpoint
 */
export async function validateApiConnection(config: ApiCrawlerConfig): Promise<ValidationResult> {
  try {
    // 1. Validate configuration
    const validatedConfig = validateConfig(config)

    // 2. Authenticate
    const authHeaders = await authenticate(validatedConfig.authType, validatedConfig.authConfig)

    // 3. Make single test request
    const response = await fetchJson({
      baseUrl: validatedConfig.baseUrl,
      endpoint: validatedConfig.endpoint,
      method: validatedConfig.method,
      headers: { ...validatedConfig.headers, ...authHeaders },
      queryParams: validatedConfig.queryParams,
    })

    // 4. Check if data path exists
    const { extractJsonPath } = await import('./field-mapping/json-path')
    const data = extractJsonPath(response, validatedConfig.dataPath)

    if (data === undefined || data === null) {
      return {
        success: false,
        error: `Data path "${validatedConfig.dataPath}" not found in response`,
        errorType: 'INVALID_CONFIG',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Validation error:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Determine error type
    let errorType: ValidationResult['errorType'] = 'UNKNOWN_ERROR'

    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('authentication')) {
      errorType = 'AUTHENTICATION_ERROR'
    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      errorType = 'NOT_FOUND'
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
      errorType = 'NETWORK_ERROR'
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      errorType = 'INVALID_CONFIG'
    }

    return {
      success: false,
      error: errorMessage,
      errorType,
    }
  }
}
