import { createSummary } from './create-summary'
import { getSummaryId } from './get-summary-id'
import { updateSummary } from './update-summary'

export const upsertWebPageSummary = async (
  url: string,
  summary: string,
  keywords: string[],
  largeLanguageModel: string,
  currentLanguage: string,
  scrapedWebPageId: string,
) => {
  const newSummary = {
    summary,
    keywords: JSON.stringify(keywords),
    largeLanguageModel,
    scraped_web_page: scrapedWebPageId,
    lastScrapeUpdate: new Date(),
  }

  const webPageSummaryId = await getSummaryId(
    largeLanguageModel,
    url,
    currentLanguage,
  )

  webPageSummaryId
    ? await updateSummary(newSummary, webPageSummaryId)
    : await createSummary(newSummary, currentLanguage)
}
