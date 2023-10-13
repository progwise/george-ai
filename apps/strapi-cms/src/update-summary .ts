import { updateSummaryDocument } from '@george-ai/typesense-client'
import { filterValidFeedbacks } from './filter-valid-feedbacks'
import { calculatePopularity } from './calculate-popularity'
import { fetchWebPageSummary } from './fetch-web-page-summary'

export const updatePopularity = async ({ summaryId, excludeFeedbackId }) => {
  const { lastScrapeUpdate, summary_feedbacks } =
    await fetchWebPageSummary(summaryId)

  const summaryDocument = {
    id: summaryId.toString(),
    popularity: calculatePopularity(
      filterValidFeedbacks(summary_feedbacks),
      new Date(lastScrapeUpdate ?? 0),
      excludeFeedbackId,
    ),
  }

  await updateSummaryDocument(summaryDocument, summaryDocument.id)
}
