import { updateSummaryDocument } from '@george-ai/typesense-client'
import { calculatePopularity } from '../../../../calculate-popularity'

const getSummaryAndUpdatePopularity = async ({
  feedbackId,
  excludeFeedbackId,
}: {
  feedbackId: string
  excludeFeedbackId: string
}) => {
  const { id: summaryId }: { id: string } = await strapi.entityService.findOne(
    'api::summary-feedback.summary-feedback',
    feedbackId,
    {
      populate: ['web_page_summary'],
    },
  )

  const {
    lastScrapeUpdate,
    summary_feedbacks,
  }: {
    lastScrapeUpdate: number
    summary_feedbacks: {
      id: string
      voting: 'up' | 'down'
      createdAt: number
    }[]
  } = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    summaryId,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )

  const filterFeedbacks = summary_feedbacks.filter(
    (feedback) =>
      feedback.id !== excludeFeedbackId &&
      new Date(feedback.createdAt) > new Date(lastScrapeUpdate),
  )

  const popularity = calculatePopularity(filterFeedbacks)

  await updateSummaryDocument({ popularity }, summaryId.toString())
}

export default {
  async afterCreate(event) {
    await getSummaryAndUpdatePopularity({
      feedbackId: event.result.id,
      excludeFeedbackId: undefined,
    })
  },

  async beforeDelete(event) {
    await getSummaryAndUpdatePopularity({
      feedbackId: event.params.where.id,
      excludeFeedbackId: event.params.where.id,
    })
  },

  async beforeDeleteMany(event) {
    for (const feedbackId of event.params?.where?.$and[0].id.$in) {
      await getSummaryAndUpdatePopularity({
        feedbackId,
        excludeFeedbackId: feedbackId,
      })
    }
  },
}
