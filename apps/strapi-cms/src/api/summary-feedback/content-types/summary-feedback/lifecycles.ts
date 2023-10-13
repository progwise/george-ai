import { upsertSummary } from '../../../../upsert-summary'

const getSummaryAndUpsert = async (id, excludeFeedbackId?) => {
  const summaryFeedbackResult = await strapi.entityService.findOne(
    'api::summary-feedback.summary-feedback',
    id,
    {
      populate: ['web_page_summary'],
    },
  )

  await upsertSummary({
    summaryId: summaryFeedbackResult.web_page_summary.id,
    excludeFeedbackId: excludeFeedbackId,
  })
}

export default {
  async afterCreate(event) {
    await upsertSummary({ summaryId: event.params.data.web_page_summary })
  },

  async beforeDelete(event) {
    await getSummaryAndUpsert(event.params.where.id, event.params.where.id)
  },

  async beforeDeleteMany(event) {
    for (const feedbackId of event.params?.where?.$and[0].id.$in) {
      await getSummaryAndUpsert(feedbackId, feedbackId)
    }
  },
}
