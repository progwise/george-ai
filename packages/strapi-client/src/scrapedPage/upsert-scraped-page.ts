import { createScrapedPage } from './create-scraped-page'
import { getScrapedPageByUrl } from './get-scraped-page-by-url'
import { updateScrapedPage } from './update-scraped-page'

interface ScrapeResult {
  title: string
  url: string
  content: string
  links: string[]
  scrapedLanguage: string
}

export const upsertScrapedWebPage = async (
  scrapeResult: ScrapeResult,
  prompts: string[],
) => {
  const currentScrapedWebPage = await getScrapedPageByUrl(scrapeResult.url)

  if (!currentScrapedWebPage?.id) {
    await createScrapedPage(
      scrapeResult.title,
      scrapeResult.content,
      scrapeResult.url,
      prompts,
    )
    return
  }

  if (
    scrapeResult.content === currentScrapedWebPage.attributes?.originalContent
  ) {
    return
  }

  await updateScrapedPage(currentScrapedWebPage.id, scrapeResult.content)
}
