import { upsertTypesenseCollection } from '@george-ai/typesense-client'

const transformAndUpsertSummary = async (id) => {
  const webPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    id,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )

  const summaryFeedbacks = webPageSummaryResult.summary_feedbacks ?? []

  let popularity = 0 // TODO: Should this be done when the summary is newly created or updated?
  for (const feedback of summaryFeedbacks) {
    const vote = feedback.voting
    if (vote === 'up') {
      popularity += 1
    }
    if (vote === 'down') {
      popularity -= 1
    }
  }

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

  upsertTypesenseCollection(webPageSummary)
}

export default {
  async afterCreate(event) {
    await transformAndUpsertSummary(event.result.id)
  },

  async afterUpdate(event) {
    await transformAndUpsertSummary(event.result.id)
  },
}
