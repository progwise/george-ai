import {
  ensureSummaryCollectionExists,
  upsertSummaryDocument,
} from '@george-ai/typesense-client'
import { getSummary } from './get-summary'
import { calculatePopularity } from './calculate-popularity'

export const upsertSummary = async ({ summaryId }) => {
  const {
    lastScrapeUpdate,
    language,
    keywords,
    summary,
    largeLanguageModel,
    publicationState,
    feedbacks,
    title,
    url,
    originalContent,
  } = await getSummary(summaryId)

  const parsedKeywords = JSON.parse(keywords)

  const summaryDocument = {
    id: summaryId.toString(),
    language,
    keywords: ((value: any): value is string[] =>
      Array.isArray(value) && value.every((item) => typeof item === 'string'))(
      parsedKeywords,
    )
      ? parsedKeywords
      : [],
    summary,
    largeLanguageModel,
    title,
    url,
    originalContent,
    publicationState,
    popularity: calculatePopularity(feedbacks, lastScrapeUpdate),
  }

  await ensureSummaryCollectionExists()
  await upsertSummaryDocument(summaryDocument, summaryDocument.id)
}
