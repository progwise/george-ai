import {
  deleteDocument,
  ensureCollectionExists,
  transformAndUpsertSummary,
} from '@george-ai/typesense-client'
import { deleteFeedback, getSummariesById } from '@george-ai/strapi-client'

const getSummaryAndUpsert = async (id) => {
  const webPageSummaryResult = await getSummariesById(id)
  await ensureCollectionExists()
  await transformAndUpsertSummary(webPageSummaryResult)
}

export default {
  async afterCreate(event) {
    await getSummaryAndUpsert(event.result.id)
  },

  async afterUpdate(event) {
    await getSummaryAndUpsert(event.result.id)
  },

  async afterUpdateMany(event) {
    for (const id of event.params.where.id.$in) {
      await getSummaryAndUpsert(id)
    }
  },

  async afterDeleteMany(event) {
    for (const id of event.params?.where?.$and[0].id.$in) {
      const summaryFeedbacks = await strapi.entityService.findMany(
        'api::summary-feedback.summary-feedback',
        {
          'web_page_summary.id': id,
        },
      )

      for (const feedback of summaryFeedbacks) {
        await deleteFeedback(feedback.id)
      }
      await deleteDocument(id)
    }
  },
}
