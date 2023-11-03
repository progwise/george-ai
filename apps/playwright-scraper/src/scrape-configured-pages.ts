import playwright from 'playwright-chromium'
import { scrapePage } from './scrape.js'
import {
  upsertScrapedWebPage,
  getEntryPoints,
  getStrapiLocales,
} from '@george-ai/strapi-client'
import pMap from 'p-map'

const MAX_URLS_DONE = 4 // Maximum number of runs

const scrapePagesForAllConfigurationsAndUpsert = async (): Promise<void> => {
  const browser = await playwright['chromium'].launch({ headless: true })
  const context = await browser.newContext()
  const entryPoints = await getEntryPoints()
  const supportedLocales = new Set(await getStrapiLocales())

  for (const entryPoint of entryPoints) {
    const startUrl = entryPoint.startUrl
    const maxDepth = entryPoint.depth
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
              console.log(
                `Skipping ${currentUrl}: No content was found on the page`,
              )
              return
            }

            if (!supportedLocales.has(scrapeResult.scrapedLanguage)) {
              console.log(
                `Skipping ${currentUrl}: Unsupported locale ${
                  scrapeResult.scrapedLanguage
                }. Supported: ${[...supportedLocales].join(', ')}`,
              )
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
            await upsertScrapedWebPage(
              scrapeResult.title,
              scrapeResult.url,
              scrapeResult.content,
              entryPoint.entryPointId,
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
  }
  await browser.close()
}

await scrapePagesForAllConfigurationsAndUpsert()
