import playwright from 'playwright-chromium'
import { getKeywords, getSummary } from './chat-gpt'
import { scrapePage } from './scrape.js'
import {
  getAllScrapedPages,
  getOrCreateScrapedWebPage,
  getScraperConfiguration,
  getStrapiLocales,
  upsertWebPageSummary,
} from '@george-ai/strapi-client'
import pMap from 'p-map'
import pMap from 'p-map'

const MAX_URLS_DONE = 10 // Maximum number of runs

const processPage = async (): Promise<void> => {
  const browser = await playwright['chromium'].launch({ headless: true })
  const context = await browser.newContext()
  const scraperConfigurations = (await getScraperConfiguration()) || []
  const supportedLocales = new Set(await getStrapiLocales())

  for (const scraperConfig of scraperConfigurations) {
    const startUrl = scraperConfig.startUrl!
    const maxDepth = scraperConfig.depth ?? 0
    const urlsDone = new Set<string>()
    let urlsTodo = [{ url: startUrl, depth: 0 }]

    while (urlsTodo.length > 0 && urlsDone.size < MAX_URLS_DONE) {
      const chunkOfUrls = urlsTodo.splice(0, 5)
      await pMap(
        chunkOfUrls,
        async (urlTodo) => {
          const { url: currentUrl, depth: currentDepth } = urlTodo
          console.log(`scraping ${currentUrl}`)
          try {
            const scrapeResult = await scrapePage(
              currentUrl,
              context,
              currentDepth,
            )
            if (!scrapeResult.content) {
              return
            }

            if (!supportedLocales.has(scrapeResult.scrapedLanguage)) {
              return
            }

            if (currentDepth < maxDepth) {
              const newUrls = scrapeResult.links.map((url) => ({
                url,
                depth: currentDepth + 1,
              }))

              for (const newUrl of newUrls) {
                if (
                  !urlsDone.has(newUrl.url) &&
                  !urlsTodo.some((u) => u.url === newUrl.url)
                ) {
                  urlsTodo.push(newUrl)
                }
              }
            }
            const scrapedWebPageId =
              await getOrCreateScrapedWebPage(scrapeResult)

            const prompts = scraperConfig.prompts || []

            await pMap(
              prompts,
              async (prompt) => {
                const summary =
                  (await getSummary(
                    scrapeResult.content ?? '',
                    JSON.parse(prompt.summaryPrompt || ''),
                  )) ?? ''
                const keywords =
                  (await getKeywords(
                    scrapeResult.content ?? '',
                    JSON.parse(prompt.keywordPrompt || ''),
                  )) ?? []
                const ScrapedUrlAndSummary = {
                  url: scrapeResult.url ?? '',
                  summary,
                  keywords,
                  largeLanguageModel: prompt.llm ?? 'unspecified',
                  currentLanguage: prompt.locale ?? 'en',
                }
                if (scrapedWebPageId?.id) {
                  await upsertWebPageSummary(
                    ScrapedUrlAndSummary,
                    scrapedWebPageId.id,
                  )
                }
              },
              { concurrency: 2 },
            )
          } catch (error) {
            console.error(`error scraping ${currentUrl}:`, error)
          }
        },
        { concurrency: 5 },
      )

      for (const urlTodo of chunkOfUrls) {
        urlsDone.add(urlTodo.url)
      }
    }

    // const scrapedWebPages = await getAllScrapedPages()

    // const prompts = scraperConfig.prompts || []

    // await pMap(
    //   scrapedWebPages || [],
    //   async (scrapedWebPage) => {
    //     if (!scrapedWebPage.id) {
    //       return
    //     }
    //     await pMap(
    //       prompts,
    //       async (prompt) => {
    //         const summary =
    //           (await getSummary(
    //             scrapedWebPage?.attributes?.originalContent ?? '',
    //             JSON.parse(prompt.summaryPrompt || ''),
    //           )) ?? ''
    //         const keywords =
    //           (await getKeywords(
    //             scrapedWebPage?.attributes?.originalContent ?? '',
    //             JSON.parse(prompt.keywordPrompt || ''),
    //           )) ?? []
    //         const ScrapedUrlAndSummary = {
    //           url: scrapedWebPage?.attributes?.url ?? '',
    //           summary,
    //           keywords,
    //           largeLanguageModel: prompt.llm ?? 'unspecified',
    //           currentLanguage: prompt.locale ?? 'en',
    //         }
    //         if (scrapedWebPage?.id) {
    //           await upsertWebPageSummary(
    //             ScrapedUrlAndSummary,
    //             scrapedWebPage?.id,
    //           )
    //         }
    //       },
    //       { concurrency: 2 },
    //     )
    //   },
    //   { concurrency: 6 },
    // )
  }
  await browser.close()
}

await processPage()
