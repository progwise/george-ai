import { createSummary } from './create-summary'
import { getSummaryId } from './get-summary-id'
import { updateSummary } from './update-summary'

interface ScrapedUrlAndSummary {
  url: string
  summary: string
  keywords: string[]
  largeLanguageModel: string
  currentLanguage: string
}

export const upsertWebPageSummary = async (
  scrapedUrlAndSummary: ScrapedUrlAndSummary,
  scrapedWebPageId: string,
) => {
  const newSummary = {
    summary: scrapedUrlAndSummary.summary,
    keywords: JSON.stringify(scrapedUrlAndSummary.keywords),
    largeLanguageModel: scrapedUrlAndSummary.largeLanguageModel,
    scraped_web_page: scrapedWebPageId,
  }

  const webPageSummaryId = await getSummaryId(
    scrapedUrlAndSummary.largeLanguageModel,
    scrapedUrlAndSummary.url,
    scrapedUrlAndSummary.currentLanguage,
  )

  webPageSummaryId
    ? await updateSummary(newSummary, webPageSummaryId)
    : await createSummary(newSummary, scrapedUrlAndSummary.currentLanguage)
}
