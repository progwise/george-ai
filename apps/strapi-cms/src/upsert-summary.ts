import {
  PublicationState,
  ensureSummaryCollectionExists,
  upsertSummaryDocument,
} from '@george-ai/typesense-client'
import { calculatePopularity } from './calculate-popularity'
import { fetchWebPageSummary } from './fetch-web-page-summary'
import { filterValidFeedbacks } from './filter-valid-feedbacks'

export const upsertSummary = async ({ summaryId }) => {
  const {
    lastScrapeUpdate,
    locale,
    keywords,
    summary,
    largeLanguageModel,
    publishedAt,
    summary_feedbacks,
    scraped_web_page,
  } = await fetchWebPageSummary(summaryId)

  const parsedKeywords = JSON.parse(keywords)

  const summaryDocument = {
    id: summaryId.toString(),
    language: locale ?? '',
    keywords: ((value: any): value is string[] =>
      Array.isArray(value) && value.every((item) => typeof item === 'string'))(
      parsedKeywords,
    )
      ? parsedKeywords
      : [],
    summary,
    largeLanguageModel,
    title: scraped_web_page?.title ?? '',
    url: scraped_web_page?.url ?? '',
    originalContent: scraped_web_page?.originalContent ?? '',
    publicationState: publishedAt
      ? PublicationState.Published
      : PublicationState.Draft,
    popularity: calculatePopularity(
      filterValidFeedbacks(summary_feedbacks),
      new Date(lastScrapeUpdate ?? 0),
    ),
  }

  await ensureSummaryCollectionExists()
  await upsertSummaryDocument(summaryDocument, summaryDocument.id)
}
