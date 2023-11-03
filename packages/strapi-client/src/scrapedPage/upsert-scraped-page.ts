import { createScrapedPage } from './create-scraped-page'
import { getScrapedPageByUrl } from './get-scraped-page-by-url'
import { updateScrapedPage } from './update-scraped-page'

export const upsertScrapedWebPage = async (
  title: string,
  url: string,
  content: string,
  entryPointId: string,
) => {
  const { id, originalContent, scrapedPageEntryPointId } =
    await getScrapedPageByUrl(url)

  if (!id) {
    await createScrapedPage(title, content, url, entryPointId)
    return
  }

  const isContentSame = content === originalContent
  const isEntryPointSame = entryPointId === scrapedPageEntryPointId

  if (isContentSame && isEntryPointSame) {
    console.log(`Content and entryPointId for URL "${url}" are both unchanged.`)
    return
  }

  await updateScrapedPage(id, title, content, entryPointId)
}
