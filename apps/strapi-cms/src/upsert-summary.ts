import {
  ensureSummaryCollectionExists,
  upsertSummaryDocument,
} from '@george-ai/typesense-client'
import { getSummary } from './get-summary'

export const upsertSummary = async ({ summaryId }) => {
  const {
    id,
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

  const votes = feedbacks
    .filter((feedback) => feedback.createdAt > lastScrapeUpdate)
    .map((feedback) => feedback.voting)

  let popularity = 0
  for (const vote of votes) {
    vote === 'up' ? (popularity += 1) : (popularity -= 1)
  }
  console.log('popularity: ', popularity)

  const parsedKeywords = JSON.parse(keywords)

  const summaryDocument = {
    id,
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
    popularity,
  }

  await ensureSummaryCollectionExists()
  await upsertSummaryDocument(summaryDocument, summaryDocument.id)
}
