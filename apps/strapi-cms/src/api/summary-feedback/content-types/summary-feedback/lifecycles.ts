import {
  calculatePopularity,
  updateSummaryDocument,
} from '@george-ai/typesense-client'

const getSummaryId = async (feedbackId: number): Promise<number> => {
  const { web_page_summary }: { web_page_summary: { id: number } } =
    await strapi.entityService.findOne(
      'api::summary-feedback.summary-feedback',
      feedbackId,
      {
        populate: ['web_page_summary'],
      },
    )
  return web_page_summary.id
}

const getFeedbacks = async (summaryId: string | number) => {
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
    summaryId,
    {
      populate: ['summary_feedbacks'],
    },
  )
  return summary_feedbacks.filter(
    (feedback) => new Date(feedback.createdAt) > new Date(lastScrapeUpdate),
  )
}

export default {
  async afterCreate(event) {
    const summaryId: string = event.params.data.web_page_summary
    const feedbacks = await getFeedbacks(summaryId)
    const popularity = calculatePopularity(
      feedbacks.map((feedback) => feedback.voting),
    )
    try {
      await updateSummaryDocument({ popularity }, summaryId)
    } catch (error) {
      console.error(
        `Failed to update summary document with ID ${summaryId}: ${error}`,
      )
    }
  },

  async beforeDelete(event) {
    const feedbackId = event.params.where.id
    const summaryId = await getSummaryId(feedbackId)
    const feedbacks = await getFeedbacks(summaryId)
    const popularity = calculatePopularity(
      feedbacks
        .filter((feedback) => feedback.id !== feedbackId)
        .map((feedback) => feedback.voting),
    )
    try {
      await updateSummaryDocument({ popularity }, summaryId.toString())
    } catch (error) {
      console.error(
        `Failed to update summary document with ID ${summaryId}: ${error}`,
      )
    }
  },

  async beforeDeleteMany(event) {
    for (const feedbackId of event.params?.where?.$and[0].id.$in) {
      const summaryId = await getSummaryId(feedbackId)
      const feedbacks = await getFeedbacks(summaryId)
      const popularity = calculatePopularity(
        feedbacks
          .filter((feedback) => feedback.id !== feedbackId)
          .map((feedback) => feedback.voting),
      )
      try {
        await updateSummaryDocument({ popularity }, summaryId.toString())
      } catch (error) {
        console.error(
          `Failed to update summary document with ID ${summaryId}: ${error}`,
        )
      }
    }
  },
}
