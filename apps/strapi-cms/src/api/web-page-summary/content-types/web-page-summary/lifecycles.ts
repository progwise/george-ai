import {
  deleteDocument,
  ensureCollectionExists,
  upsertWebpageSummary,
} from '@george-ai/typesense-client'

const transformAndUpsertSummary = async (id) => {
  const webPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    id,
    {
      populate: ['scraped_web_page'],
    },
  )

  const webPageSummary = {
    id: webPageSummaryResult.id.toString(),
    language: webPageSummaryResult.locale,
    keywords: webPageSummaryResult.keywords
      ? JSON.parse(webPageSummaryResult.keywords)
      : [],
    summary: webPageSummaryResult.summary,
    largeLanguageModel: webPageSummaryResult.largeLanguageModel,
    title: webPageSummaryResult.scraped_web_page.title,
    url: webPageSummaryResult.scraped_web_page.url,
    originalContent: webPageSummaryResult.scraped_web_page.originalContent,
    publicationState: webPageSummaryResult.publishedAt ? 'published' : 'draft',
    popularity: 0,
  }
  await ensureCollectionExists()
  await upsertWebpageSummary(webPageSummary)
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
    await transformAndUpsertSummary(event.result.id)
  },

  async afterUpdate(event) {
    await transformAndUpsertSummary(event.result.id)
  },

  async beforeDeleteMany(event) {
    console.log('beforeDeleteMany:', event.params?.where?.$and[0].id.$in)
    for (const id of event.params?.where?.$and[0].id.$in) {
      await deleteDocumentAndRelatedFeedbacks(id)
    }
  },

  async beforeDelete(event) {
    console.log('beforeDelete:', event.params.where.id)
    await deleteDocumentAndRelatedFeedbacks(event.params.where.id)
  },
}
