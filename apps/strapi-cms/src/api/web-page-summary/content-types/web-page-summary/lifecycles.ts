import {
  deleteDocument,
  transformAndUpsertSummary,
} from '@george-ai/typesense-client'


const transformAndUpsertwebPageSummary = async (id) => {
  const webPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    id,
    {
      populate: ['scraped_web_page'],
    },
  )

  await transformAndUpsertSummary(webPageSummaryResult, 0)
}

const deleteDocumentAndRelatedFeedbacks = async (summaryId) => {
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

  await deleteDocument(summaryId)
}

export default {
  async afterCreate(event) {
    await transformAndUpsertwebPageSummary(event.result.id)
  },

  async afterUpdate(event) {
    await transformAndUpsertwebPageSummary(event.result.id)
  },

  async beforeDeleteMany(event) {
    for (const id of event.params?.where?.$and[0].id.$in) {
      const summaryFeedbacks = await strapi.entityService.findMany(
        'api::summary-feedback.summary-feedback',
        {
          'web_page_summary.id': id,
        },
      )

      for (const feedback of summaryFeedbacks) {

      }
      await deleteDocument(id)
    }
  },

  async beforeDelete(event) {
    await deleteDocumentAndRelatedFeedbacks(event.params.where.id)
  },
}
