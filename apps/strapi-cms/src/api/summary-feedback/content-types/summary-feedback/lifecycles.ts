import { upsertSummary } from '../../../../upsert-summary'

const updateSummaryPopularity = async ({ feedBackId }) => {
  const summaryFeedbackResult = await strapi.entityService.findOne(
    'api::summary-feedback.summary-feedback',
    feedBackId,
    {
      populate: ['web_page_summary'],
    },
  )

  await upsertSummary(summaryFeedbackResult.web_page_summary.id)
}

export default {
  async afterCreate(event) {
    await updateSummaryPopularity({ feedBackId: event.result.id })
  },
}
