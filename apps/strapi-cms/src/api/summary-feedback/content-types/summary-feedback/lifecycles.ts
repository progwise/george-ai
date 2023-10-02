import { getSummariesById } from '@george-ai/strapi-client'
import {
  ensureCollectionExists,
  transformAndUpsertSummary,
} from '@george-ai/typesense-client'

const getSummaryAndUpsert = async (id) => {
  const webPageSummaryResult = await getSummariesById(id)
  await ensureCollectionExists()
  await transformAndUpsertSummary(webPageSummaryResult)
}

export default {
  async afterCreate(event) {
    const summaryFeedback = await strapi.entityService.findOne(
      'api::summary-feedback.summary-feedback',
      event.result.id,
      {
        populate: ['web_page_summary'],
      },
    )

    await getSummaryAndUpsert(summaryFeedback.web_page_summary.id)
  },
}
