import playwright from 'playwright-chromium'
import { getKeywords, getServiceSummary } from './chat-gpt'
import { upsertScrapedWebPageAndWebPageSummary } from './strapi.js'
import { ScrapeResult, scrapePage } from './scrape.js'
import { getScraperConfiguration } from './scraper-configuration'

const MAX_RUNS = 3 // Maximum number of runs

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
    console.log('scraperConfig:', scraperConfig.prompts)
    const startUrl = scraperConfig.startUrl
    if (!startUrl) {
      console.log('Skipping: No start URL defined')
      continue
    }
    const maxDepth = scraperConfig.depth ?? 0
    const urlsDone = new Set<string>()
    let urlsTodo: Array<UrlDepth> = [{ url: startUrl, depth: 0 }]

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

        if (currentDepth < maxDepth) {
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

        const prompts = scraperConfig.prompts || []
        for (const prompt of prompts) {
          const summary =
            (await getServiceSummary(
              scrapeResult.content,
              JSON.parse(prompt.summaryPrompt || ''),
            )) ?? ''
          const keywords =
            (await getKeywords(
              scrapeResult.content,
              JSON.parse(prompt.keywordPrompt || ''),
            )) ?? []

          const scrapeResultAndSummary: ScrapeResultAndSummary = {
            ...scrapeResult,
            currentLanguage: prompt.locale ?? 'en',
            summary,
            keywords,
            largeLanguageModel: prompt.llm ?? '',
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
