import { updateSummaryDocument } from '@george-ai/typesense-client'
import { calculatePopularity } from '../../../../calculate-popularity'

const updatePopularity = async ({
  feedbackId,
  excludeFeedbackId,
}: {
  feedbackId: number
  excludeFeedbackId: number | undefined
}) => {
  const { web_page_summary }: { web_page_summary: { id: number } } =
    await strapi.entityService.findOne(
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
    lastScrapeUpdate: string
    summary_feedbacks: {
      id: number
      voting: 'up' | 'down'
      createdAt: string
    }[]
  } = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    web_page_summary.id,
    {
      populate: ['summary_feedbacks'],
    },
  )

  const filterFeedbacks = summary_feedbacks.filter(
    (feedback) =>
      feedback.id !== excludeFeedbackId &&
      new Date(feedback.createdAt) > new Date(lastScrapeUpdate),
  )

  const popularity = calculatePopularity(filterFeedbacks)

  await updateSummaryDocument({ popularity }, web_page_summary.id.toString())
}

export default {
  async afterCreate(event) {
    await updatePopularity({
      feedbackId: event.result.id,
      excludeFeedbackId: undefined,
    })
  },

  async beforeDelete(event) {
    await updatePopularity({
      feedbackId: event.params.where.id,
      excludeFeedbackId: event.params.where.id,
    })
  },

  async beforeDeleteMany(event) {
    for (const feedbackId of event.params?.where?.$and[0].id.$in) {
      await updatePopularity({
        feedbackId,
        excludeFeedbackId: feedbackId,
      })
    }
  },
}
