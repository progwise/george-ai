import {
  computeFeedbackPopularity,
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

  const updatedAt = new Date(webPageSummaryResult.updatedAt)

  const votes = (webPageSummaryResult.summary_feedbacks ?? [])
    .filter((feedback) => {
      const createdAt = new Date(feedback.createdAt)
      return createdAt > updatedAt
    })
    .map((feedback) => feedback.voting)

  const popularity = computeFeedbackPopularity(votes)

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
    popularity,
  }
  await ensureCollectionExists()
  await upsertWebpageSummary(webPageSummary)
}

export default {
  async afterCreate(event) {
    await transformAndUpsertSummary(event.result.id)
  },

  async afterUpdate(event) {
    await transformAndUpsertSummary(event.result.id)
  },

  async afterUpdateMany(event) {
    for (const id of event.params.where.id.$in) {
      await transformAndUpsertSummary(id)
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
      await deleteDocument(id)
    }
  },
}
