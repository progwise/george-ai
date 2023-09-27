import playwright from 'playwright-chromium'
import { getKeywords, getServiceSummary } from './chat-gpt'
import { scrapePage } from './scrape.js'
import { getScraperConfiguration } from './scraper-configuration'
import {
  getOrCreateScrapedWebPage,
  upsertWebPageSummary,
} from '@george-ai/strapi-client'

const MAX_RUNS = 2 // Maximum number of runs

const processPage = async (): Promise<void> => {
  const browser = await playwright['chromium'].launch({ headless: true })
  const context = await browser.newContext()
  const scraperConfigurations = (await getScraperConfiguration()) || []
  const supportedLocales = new Set(
    (scraperConfigurations || []).flatMap((scraperConfig) =>
      (scraperConfig.prompts || [])
        .map((prompt) => prompt.locale)
        .filter((locale): locale is string => {
          return locale !== null && locale !== undefined
        }),
    ),
  )
  let runCounter = 0 // Counter

  for (const scraperConfig of scraperConfigurations) {
    const startUrl = scraperConfig.startUrl!
    const maxDepth = scraperConfig.depth ?? 0
    const urlsDone = new Set<string>()
    let urlsTodo = [{ url: startUrl, depth: 0 }]

    while (urlsTodo.length > 0 && runCounter < MAX_RUNS) {
      const nextUrlTodo = urlsTodo.shift()
      if (!nextUrlTodo) {
        console.log('No more URLs to process')
        break
      }

      const { url: currentUrl, depth: currentDepth } = nextUrlTodo
      urlsDone.add(currentUrl)

      console.log(`scraping ${currentUrl}`)

      try {
        const scrapeResult = await scrapePage(currentUrl, context, currentDepth)

        if (!scrapeResult.content) {
          console.log(
            `Skipping ${currentUrl}: No content was found on the page`,
          )
          continue
        }

        if (!supportedLocales.has(scrapeResult.scrapedLanguage)) {
          console.log(
            `Skipping ${currentUrl}: Unsupported locale ${
              scrapeResult.scrapedLanguage
            }. Supported: ${[...supportedLocales].join(', ')}`,
          )
          continue
        }

        for (const currentLanguage of promptsLocales) {
          const summary =
            (await getServiceSummary(scrapeResult.content, currentLanguage)) ??
            ''
          const keywords =
            (await getKeywords(scrapeResult.content, currentLanguage)) ?? []

          const scrapeResultAndSummary: ScrapeResultAndSummary = {
            ...scrapeResult,
            currentLanguage,
            summary,
            keywords,
            largeLanguageModel: 'gpt-3.5-turbo',
          }

          await upsertScrapedWebPageAndWebPageSummary(scrapeResultAndSummary)
        }
      } catch (error) {
        console.error(`error scraping ${currentUrl}:`, error)
      }

      runCounter++ // Increases the counter after each run
    }
  }
  await browser.close()
}

await processPage()
