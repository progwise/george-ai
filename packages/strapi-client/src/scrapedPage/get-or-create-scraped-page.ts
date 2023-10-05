import { createdScrapedPage } from './created-scraped-page'
import { getScrapedPageByUrl } from './get-scraped-page-by-url'

interface ScrapeResult {
  title: string
  url: string
  content: string
  links: string[]
  scrapedLanguage: string
}

export const getOrCreateScrapedWebPage = async (scrapeResult: ScrapeResult) => {
  const existingScrapedWebPage = await getScrapedPageByUrl(scrapeResult.url)

  if (existingScrapedWebPage) {
    return existingScrapedWebPage
  }

  const scrapedWebPage = await createdScrapedPage(
    scrapeResult.title,
    scrapeResult.content,
    scrapeResult.url,
    scrapeResult.scrapedLanguage,
  )

  return scrapedWebPage
}
