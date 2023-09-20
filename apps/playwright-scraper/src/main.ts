import playwright from 'playwright-chromium'
import { getKeywords, getServiceSummary } from './chat-gpt'
import { upsertScrapedWebPageAndWebPageSummary } from './strapi.js'
import { ScrapeResult, scrapePage } from './scrape.js'
import { getStrapiLocales } from './locales'
import { Language, isLanguage } from './prompts'

const MAX_RUNS = 5 // Maximum number of runs
const MAX_DEPTH = 2

interface UrlDepth {
  url: string
  depth: number
}

export interface ScrapeResultAndSummary extends ScrapeResult {
  summary: string
  keywords: string[]
  largeLanguageModel: string
  currentLanguage: string
}

const processPage = async (initialUrls: string[]): Promise<void> => {
  const browser = await playwright['chromium'].launch({ headless: true })
  const context = await browser.newContext()

  let runCounter = 0 // Counter

  const urlsDone = new Set<string>()
  let urlsTodo: Array<UrlDepth> = initialUrls.map((url) => ({ url, depth: 0 }))
  const strapiLocales = await getStrapiLocales()

  const promptsLocales = strapiLocales.filter((locale): locale is Language =>
    isLanguage(locale),
  )

  if (promptsLocales.length === 0) {
    console.log('No supported locales found. Exiting the process.')
    return
  }

  while (urlsTodo.length > 0 && runCounter < MAX_RUNS) {
    const nextUrlDepth = urlsTodo.shift()
    if (!nextUrlDepth) {
      console.log('No more URLs to process')
      break
    }

    const { url: currentUrl, depth: currentDepth } = nextUrlDepth
    urlsDone.add(currentUrl)

    console.log(`scraping ${currentUrl}`)

    try {
      const scrapeResult = await scrapePage(currentUrl, context, currentDepth)

      if (currentDepth < MAX_DEPTH) {
        const newUrls = scrapeResult.links.map((url) => ({
          url,
          depth: currentDepth + 1,
        }))

        urlsTodo = [
          ...urlsTodo,
          ...newUrls.filter(
            ({ url }) =>
              !urlsDone.has(url) && !urlsTodo.some((u) => u.url === url),
          ),
        ]
      }

      if (!scrapeResult.content) {
        console.log(`Skipping ${currentUrl}: No content was found on the page`)
        continue
      }

      if (!isLanguage(scrapeResult.scrapedLanguage)) {
        console.log(
          `Skipping ${currentUrl}: Unsupported locale ${
            scrapeResult.scrapedLanguage
          }. Supported: ${promptsLocales.join(', ')}`,
        )
        continue
      }

      for (const currentLanguage of promptsLocales) {
        const summary =
          (await getServiceSummary(scrapeResult.content, currentLanguage)) ?? ''
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

  await browser.close()
}

await processPage(['https://www.medizin.uni-greifswald.de/'])
