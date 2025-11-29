/**
 * Main crawl function
 * Orchestrates authentication and provider-based content extraction
 */
import { createLogger } from '@george-ai/web-utils'

import { authenticate } from './auth'
import { getProvider } from './providers'
import type { ApiCrawlItem, ApiCrawlerConfig } from './types'

const logger = createLogger('API Crawler')

/**
 * Crawl an API endpoint and extract data (streaming version)
 * Yields items as they are fetched and processed
 */
export async function* crawlApiStream(config: ApiCrawlerConfig): AsyncGenerator<ApiCrawlItem, void, void> {
  logger.debug('Starting crawl...')

  // 1. Get provider
  const providerType = config.provider || 'custom'
  logger.debug('Using provider:', providerType)
  const provider = getProvider(providerType, config.baseUrl, config.endpoint, config.providerConfig)
  logger.debug('Provider initialized:', provider.name)

  // 2. Authenticate
  logger.debug('Authenticating with auth type:', config.authType)
  const authHeaders = await authenticate(config.authType, config.authConfig)
  logger.debug('Authentication successful')

  // 3. Fetch items using provider
  const headers = { ...config.headers, ...authHeaders }

  let totalYielded = 0
  let skippedItems = 0

  for await (const item of provider.fetchItems({
    baseUrl: config.baseUrl,
    endpoint: config.endpoint,
    headers,
    requestDelay: config.requestDelay,
  })) {
    // Build origin URI using provider
    const originUri = provider.buildOriginUri(config.baseUrl, item)
    if (!originUri) {
      skippedItems++
      logger.warn('Skipping item - could not build origin URI')
      continue
    }

    // Extract title and generate markdown using provider
    const title = provider.extractTitle(item) || 'Item'
    const content = provider.generateMarkdown(item)

    totalYielded++

    if (totalYielded === 1) {
      logger.debug('First item sample - title:', title, 'originUri:', originUri)
    }

    yield { title, content, raw: item, originUri }
  }

  logger.info('Crawl complete. Total items yielded:', totalYielded)
  if (skippedItems > 0) {
    logger.warn('Items skipped (no identifier):', skippedItems)
  }
}
