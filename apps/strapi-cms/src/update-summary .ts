import { updateSummaryDocument } from '@george-ai/typesense-client'
import { getFeedbacks } from './get-feedbacks'
import { calculatePopularity } from './calculate-popularity'

export const updatePopularity = async ({ summaryId, excludeFeedbackId }) => {
  const { lastScrapeUpdate, feedbacks } = await getFeedbacks(summaryId)

  const summaryDocument = {
    id: summaryId.toString(),
    popularity: calculatePopularity(
      feedbacks,
      lastScrapeUpdate,
      excludeFeedbackId,
    ),
  }

  await updateSummaryDocument(summaryDocument, summaryDocument.id)
}
