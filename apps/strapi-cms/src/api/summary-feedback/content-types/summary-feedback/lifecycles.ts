import {
  computeFeedbackPopularity,
  transformAndUpsertSummary,
} from '@george-ai/typesense-client'

const transformAndUpsertWebPageSummary = async (
  id,
  excludeFeedbackId = undefined,
) => {
  console.log('excludeFeedbackId: ', excludeFeedbackId)
  const summaryFeedbackResult = await strapi.entityService.findOne(
    'api::summary-feedback.summary-feedback',
    id,
    {
      populate: ['web_page_summary'],
    },
  )

  const webPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    summaryFeedbackResult.web_page_summary.id,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )

  const updatedAt = new Date(webPageSummaryResult.updatedAt)

  const votes = (webPageSummaryResult.summary_feedbacks ?? [])
    .filter((feedback) => {
      const createdAt = new Date(feedback.createdAt)
      return createdAt > updatedAt && feedback.id !== excludeFeedbackId
    })
    .map((feedback) => feedback.voting)
  console.log('votes: ', votes)

  const popularity = computeFeedbackPopularity(votes)

  await transformAndUpsertSummary(webPageSummaryResult, popularity)
}

export default {
  async afterCreate(event) {
    await transformAndUpsertWebPageSummary(event.result.id)
  },

  async beforeDeleteMany(event) {
    for (const feedbackId of event.params?.where?.$and[0].id.$in) {
      await transformAndUpsertWebPageSummary(feedbackId, feedbackId)
    }
  },

  async beforeDelete(event) {
    await transformAndUpsertWebPageSummary(
      event.params.where.id,
      event.params.where.id,
    )
  },
}
