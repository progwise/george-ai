import playwright from 'playwright-chromium'
import { getKeywords, getServiceSummary } from './chat-gpt'
import { upsertScrapedWebPageAndWebPageSummary } from './strapi.js'
import { ScrapeResult, scrapePage } from './scrape.js'
import { getAllStrapiLocales } from './locales'
import { prompts } from './prompts'

const MAX_RUNS = 3 // Maximum number of runs

export interface ScrapeResultAndSummary extends ScrapeResult {
  summary: string
  keywords: string[]
  largeLanguageModel: string
  currentLanguage: string
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
      const alllanguages = await getAllStrapiLocales()
      const languages = alllanguages.filter((lang) =>
        Object.keys(prompts).includes(lang),
      )

      if (!languages.includes(scrapeResult.scrapedLanguage)) {
        console.log(`Skipping ${currentUrl} due to language mismatch`)
        urlsTodo = urlsTodo.slice(1)
        continue
      }

      for (const currentLanguage of languages) {
        const summary =
          (await getServiceSummary(
            scrapeResult.content,
            currentLanguage as keyof typeof prompts,
          )) ?? ''
        const keywords =
          (await getKeywords(
            scrapeResult.content,
            currentLanguage as keyof typeof prompts,
          )) ?? []

        const scrapeResultAndSummary: ScrapeResultAndSummary = {
          ...scrapeResult,
          currentLanguage,
          summary,
          keywords,
          largeLanguageModel: 'gpt-3.5-turbo',
        }

        await upsertScrapedWebPageAndWebPageSummary(scrapeResultAndSummary)
      }
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

// await processPage('https://www.medizin.uni-greifswald.de/')
await processPage('https://www.lefigaro.fr/')
