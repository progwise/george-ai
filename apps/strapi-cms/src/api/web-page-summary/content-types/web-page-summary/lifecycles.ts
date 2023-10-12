import { deleteSummaryDocument } from '@george-ai/typesense-client'
import { upsertSummary } from '../../../../upsert-summary'

export default {
  async afterCreate(event) {
    await upsertSummary({ summaryId: event.result.id })
  },

  async afterUpdate(event) {
    await upsertSummary({ summaryId: event.result.id })
  },

  async afterUpdateMany(event) {
    for (const id of event.params.where.id.$in) {
      await upsertSummary({ summaryId: id })
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
        await strapi.entityService.delete(feedback.id)
      }
      await deleteSummaryDocument(id)
    }
  },
}
