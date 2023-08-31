import playwright from 'playwright-chromium'
import { getKeywords, getServiceSummary } from './chat-gpt'
import { upsertScrapedWebPageAndWebPageSummary } from './strapi.js'
import { ScrapeResult, scrapePage } from './scrape.js'

const MAX_RUNS = 4 // Maximum number of runs

export interface ScrapeResultandSummary extends ScrapeResult {
  summary: string
  keywords: string[]
  largeLanguageModel: string
}

const processPage = async (url: string): Promise<void> => {
  const browser = await playwright['chromium'].launch({ headless: true })
  const context = await browser.newContext()

  const urlsDone: Array<string> = []
  let urlsTodo = [url]

  let runCounter = 0 // Counter
  while (urlsTodo.length > 0 && runCounter < MAX_RUNS) {
    const currentUrl = urlsTodo[0]
    urlsDone.push(currentUrl)
    console.log(`scraping ${currentUrl}`)
    try {
      const scrapeResult = await scrapePage(currentUrl, context)
      const language = ['de', 'en'].includes(scrapeResult.language)
        ? (scrapeResult.language as 'de' | 'en')
        : 'en'

      const summary =
        (await getServiceSummary(scrapeResult.content, language)) ?? ''
      const keywords = (await getKeywords(scrapeResult.content, language)) ?? []

      const ScrapeResultandSummary: ScrapeResultandSummary = {
        ...scrapeResult,
        summary,
        keywords,
        largeLanguageModel: 'gpt-3.5-turbo',
      }

      await upsertScrapedWebPageAndWebPageSummary(ScrapeResultandSummary)

      urlsTodo = [
        ...new Set(
          [...urlsTodo.slice(1), ...scrapeResult.links].filter(
            (url) => !urlsDone.includes(url),
          ),
        ),
      ]
    } catch (error) {
      console.error(`error scraping ${currentUrl}:`, error)
      urlsTodo = urlsTodo.slice(1)
    }
    runCounter++ // Increases the counter after each run
  }

  await browser.close()
}

await processPage('https://www.medizin.uni-greifswald.de/')
