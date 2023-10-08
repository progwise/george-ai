import { createScrapedPage } from './create-scraped-page'
import { getScrapedPageByUrl } from './get-scraped-page-by-url'
import { updateScrapedPage } from './update-scraped-page'

export const upsertScrapedWebPage = async (
  title: string,
  url: string,
  content: string,
  prompts: string[],
) => {
  const currentScrapedWebPage = await getScrapedPageByUrl(url)

  if (!currentScrapedWebPage?.id) {
    await createScrapedPage(title, content, url, prompts)
    return
  }

  if (content === currentScrapedWebPage.attributes?.originalContent) {
    return
  }

  await updateScrapedPage(currentScrapedWebPage.id, title, content, prompts)
}
