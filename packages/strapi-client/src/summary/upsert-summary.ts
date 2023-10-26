import { createSummary } from './create-summary'
import { getSummaryId } from './get-summary-id'
import { updateSummary } from './update-summary'

interface UpsertWebPageSummaryParameters {
  url: string
  summary: string
  keywords: string[]
  largeLanguageModel: string
  currentLanguage: string
  scrapedPageId: string
  prompt: {
    promptForSummary: string | null | undefined
    promptForKeywords: string | null | undefined
    largeLanguageModel: string
    isDefaultPrompt: boolean | undefined
    language: string
  }
}

export const upsertWebPageSummary = async ({
  url,
  summary,
  keywords,
  largeLanguageModel,
  currentLanguage,
  scrapedPageId,
  prompt,
}: UpsertWebPageSummaryParameters) => {
  const newSummary = {
    summary,
    keywords: JSON.stringify(keywords),
    largeLanguageModel,
    scraped_web_page: scrapedPageId,
    lastScrapeUpdate: new Date(),
    prompt,
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
