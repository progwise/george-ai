/**
 * Main crawl function
 * Orchestrates authentication, pagination, and field mapping
 */
import { createLogger } from '@george-ai/web-utils'

import { authenticate } from './auth'
import { mapFieldsMulti } from './field-mapping'
import { paginateFetchStream } from './pagination'
import type { ApiCrawlerConfig, CrawlItem, CrawlResult, ValidationResult } from './types'
import { fetchJson } from './utils/http'
import { validateConfig } from './utils/validate'

const logger = createLogger('API Crawler')

/**
 * Crawl an API endpoint and extract data (streaming version)
 * Yields items as they are fetched and processed
 */
export async function* crawlApiStream(config: ApiCrawlerConfig): AsyncGenerator<CrawlItem, void, void> {
  logger.debug('Starting crawl...')

  // 1. Validate configuration
  logger.debug('Validating configuration...')
  const validatedConfig = validateConfig(config)
  logger.debug('Configuration validated successfully')

  // 2. Authenticate
  logger.debug('Authenticating with auth type:', validatedConfig.authType)
  const authHeaders = await authenticate(validatedConfig.authType, validatedConfig.authConfig)
  logger.debug('Authentication successful, headers:', Object.keys(authHeaders))

  // 3. Fetch pages and yield items as they come
  logger.debug('Starting pagination fetch...')
  logger.debug('Pagination type:', validatedConfig.paginationType)
  logger.debug('Data path:', validatedConfig.dataPath)

  let totalYielded = 0

  for await (const rawItem of paginateFetchStream({
    baseUrl: validatedConfig.baseUrl,
    endpoint: validatedConfig.endpoint,
    method: validatedConfig.method,
    headers: { ...validatedConfig.headers, ...authHeaders },
    queryParams: validatedConfig.queryParams,
    paginationType: validatedConfig.paginationType,
    paginationConfig: validatedConfig.paginationConfig,
    dataPath: validatedConfig.dataPath,
    requestDelay: validatedConfig.requestDelay,
  })) {
    // Map each item to George AI document format (auto-extract title/content)
    const mappedItems = mapFieldsMulti([rawItem])

    if (mappedItems.length > 0) {
      const mappedItem = mappedItems[0]
      totalYielded++

      if (totalYielded === 1) {
        logger.debug('First mapped item sample:', JSON.stringify(mappedItem, null, 2))
      }

      yield mappedItem
    }
  }

  logger.info('Crawl complete. Total items yielded:', totalYielded)
}

/**
 * Crawl an API endpoint and extract data (legacy batch version)
 * @deprecated Use crawlApiStream for better performance
 */
export async function crawlApi(config: ApiCrawlerConfig): Promise<CrawlResult> {
  try {
    const items: CrawlItem[] = []

    for await (const item of crawlApiStream(config)) {
      items.push(item)
    }

    return {
      items,
      totalFetched: items.length,
      success: true,
    }
  } catch (error) {
    logger.error('Crawl error:', error)

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
    logger.error('Validation error:', error)

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
