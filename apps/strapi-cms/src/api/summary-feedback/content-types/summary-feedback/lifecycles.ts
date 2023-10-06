import { transformAndUpsertSummary } from '../../../../transform-and-upsert-summary'

const getSummaryAndUpsert = async (id) => {
  const summaryFeedbackResult = await strapi.entityService.findOne(
    'api::summary-feedback.summary-feedback',
    id,
    {
      populate: ['web_page_summary'],
    },
  )

  await transformAndUpsertSummary(summaryFeedbackResult.web_page_summary.id)
}

export default {
  async afterCreate(event) {
    await getSummaryAndUpsert(event.result.id)
  },
}
