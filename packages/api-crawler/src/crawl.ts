import { ApiCrawlerConfig } from './api-crawler-config'
import { authenticate } from './auth'
import { logger } from './common'
import { getProvider } from './providers'
import type { ApiCrawlItem } from './types'

/**
 * Crawl an API endpoint and extract data (streaming version)
 * Yields items as they are fetched and processed
 */
export async function* crawlApiStream(config: ApiCrawlerConfig): AsyncGenerator<ApiCrawlItem, void, void> {
  logger.info('Starting API crawl with config', config)

  const provider = getProvider(config.provider, config.baseUrl, config.endpoint, config.providerConfig)
  logger.debug('Provider initialized:', { provider, config })

  const authHeaders = await authenticate(config.authType, config.authConfig)
  logger.debug('Authentication headers obtained', { authHeaders, config })

  let totalYielded = 0
  let skippedItems = 0

  for await (const item of provider.fetchItems({
    baseUrl: config.baseUrl,
    endpoint: config.endpoint,
    headers: { ...config.headers, ...authHeaders },
    requestDelay: config.requestDelay,
    associations: config.associationsConfig?.associations,
  })) {
    // Build origin URI using provider
    const originUri = provider.buildOriginUri(config.baseUrl, item)
    if (!originUri) {
      skippedItems++
      logger.warn('Skipping item - could not build origin URI', { item, config })
      continue
    }

    // Extract title and generate markdown using provider
    const title = provider.extractTitle(item) || 'Item'
    const content = provider.generateMarkdown(item)

    totalYielded++

    if (totalYielded === 1) {
      logger.debug('First item sample - title:', { title, originUri, contentSample: content.slice(0, 100) })
    }

    yield { title, content, raw: item, originUri }
  }

  logger.info('Crawl complete. Total items yielded:', { totalYielded, skippedItems, config })
}
