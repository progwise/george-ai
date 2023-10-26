import { createScrapedPage } from './create-scraped-page'
import { getScrapedPageByUrl } from './get-scraped-page-by-url'
import { updateScrapedPage } from './update-scraped-page'

export const upsertScrapedWebPage = async (
  title: string,
  url: string,
  content: string,
  entryPointId: string,
) => {
  const { id, originalContent } = await getScrapedPageByUrl(url)

  if (!id) {
    await createScrapedPage(title, content, url, entryPointId)
    return
  }

  if (content === originalContent) {
    console.log(`Content for URL "${url}" is identical to the original.`)
    return
  }

  await updateScrapedPage(id, title, content, entryPointId)
}
