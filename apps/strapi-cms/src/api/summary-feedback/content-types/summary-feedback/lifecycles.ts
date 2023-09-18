import { upsertTypesenseCollection } from '@george-ai/typesense-client'

const transformAndUpsertFeedback = async (id) => {
  const summaryFeedbackResult = await strapi.entityService.findOne(
    'api::summary-feedback.summary-feedback',
    id,
    {
      populate: ['web_page_summary'],
    },
  )

  const webPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    summaryFeedbackResult.web_page_summary.id,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )

  const updatedAt = new Date(webPageSummaryResult.updatedAt)
  const summaryFeedbacks = (
    webPageSummaryResult.summary_feedbacks ?? []
  ).filter((feedback) => {
    const createdAt = new Date(feedback.createdAt)
    return createdAt > updatedAt
  })

  const popularity = summaryFeedbacks.reduce((accumulator, feedback) => {
    const vote = feedback.voting
    if (vote === 'up') {
      return accumulator + 1
    }
    if (vote === 'down') {
      return accumulator - 1
    }
    console.warn(
      `Value ${vote} is not implemented for calculating the popularity, feedback.id: ${feedback.id}`,
    )
    return accumulator
  }, 0)

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
    publicationState: webPageSummaryResult.scraped_web_page.publishedAt
      ? 'published'
      : 'draft',
    popularity,
  }

  upsertTypesenseCollection(webPageSummary)
}

export default {
  async afterCreate(event) {
    await transformAndUpsertFeedback(event.result.id)
  },
}
