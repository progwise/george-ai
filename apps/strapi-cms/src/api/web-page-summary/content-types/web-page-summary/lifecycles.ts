import { deleteSummaryDocument } from '@george-ai/typesense-client'
import { upsertSummary } from '../../../../upsert-summary'

const getFeedbacksAndDelete = async ({ summaryId }) => {
  const webPageSummary = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    summaryId,
    {
      populate: ['summary_feedbacks'],
    },
  )

  const feedbackIds = webPageSummary.summary_feedbacks.map(
    (feedback) => feedback.id,
  )

  for (const id of feedbackIds) {
    await strapi.entityService.delete(
      'api::summary-feedback.summary-feedback',
      id,
    )
  }

  await deleteSummaryDocument(summaryId)
}

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

  async beforeDelete(event) {
    await getFeedbacksAndDelete({ summaryId: event.params.where.id })
  },

  async beforeDeleteMany(event) {
    for (const id of event.params?.where?.$and[0].id.$in) {
      getFeedbacksAndDelete({ summaryId: id })
    }
  },
}
