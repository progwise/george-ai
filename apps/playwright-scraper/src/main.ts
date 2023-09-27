import playwright from 'playwright-chromium'
import { getKeywords, getServiceSummary } from './chat-gpt'
import { scrapePage } from './scrape.js'
import { getStrapiLocales } from './locales'
import { Language, isLanguage } from './prompts'
import {
  getOrCreateScrapedWebPage,
  upsertWebPageSummary,
} from '@george-ai/strapi-client'

const MAX_RUNS = 2 // Maximum number of runs

const processPage = async (urls: string[]): Promise<void> => {
  const browser = await playwright['chromium'].launch({ headless: true })
  const context = await browser.newContext()

  let runCounter = 0 // Counter

  const urlsDone: Array<string> = []
  let urlsTodo: Array<string> = urls
  const strapiLocales = await getStrapiLocales()

  const promptsLocales = strapiLocales.filter((locale): locale is Language =>
    isLanguage(locale),
  )

  if (promptsLocales.length === 0) {
    console.log('No supported locales found. Exiting the process.')
    return
  }

  while (urlsTodo.length > 0 && runCounter < MAX_RUNS) {
    const currentUrl = urlsTodo[0]
    urlsTodo = urlsTodo.slice(1)
    urlsDone.push(currentUrl)
    console.log(`scraping ${currentUrl}`)

    try {
      const scrapeResult = await scrapePage(currentUrl, context)

      urlsTodo = [
        ...new Set(
          [...urlsTodo, ...scrapeResult.links].filter(
            (url) => !urlsDone.includes(url),
          ),
        ),
      ]

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

      const createdScrapedWebPage =
        await getOrCreateScrapedWebPage(scrapeResult)

      for (const currentLanguage of promptsLocales) {
        const summary =
          (await getServiceSummary(scrapeResult.content, currentLanguage)) ?? ''
        const keywords =
          (await getKeywords(scrapeResult.content, currentLanguage)) ?? []

        const scrapeResultAndSummary = {
          ...scrapeResult,
          currentLanguage,
          summary,
          keywords,
          largeLanguageModel: 'gpt-3.5-turbo',
        }

        if (createdScrapedWebPage?.id) {
          await upsertWebPageSummary(
            scrapeResultAndSummary,
            createdScrapedWebPage.id,
          )
        }
      }
    } catch (error) {
      console.error(`error scraping ${currentUrl}:`, error)
    }

    runCounter++ // Increases the counter after each run
  }

  await browser.close()
}

await processPage(['https://www.medizin.uni-greifswald.de/'])
