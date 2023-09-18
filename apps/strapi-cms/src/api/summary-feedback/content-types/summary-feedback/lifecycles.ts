import { computeFeedbackPopularity, upsertWebpageSummary } from '@george-ai/typesense-client'

const transformAndUpsertFeedback = async (id) => {
  try {
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

  const updatedAt = new Date(webPageSummaryResult.updatedAt);

  const votes = (
    webPageSummaryResult.summary_feedbacks ?? []
  ).filter((feedback) => {
    const createdAt = new Date(feedback.createdAt);
    return createdAt > updatedAt;
  }).map(feedback => feedback.voting,
 );

  const popularity = computeFeedbackPopularity(votes);

  const webPageSummary = {
    id: webPageSummaryResult.id.toString() ?? '',
    language: webPageSummaryResult.locale ?? '',
    keywords: webPageSummaryResult.keywords
      ? JSON.parse(webPageSummaryResult.keywords)
      : [],
    summary: webPageSummaryResult.summary ?? '',
    largeLanguageModel: webPageSummaryResult.largeLanguageModel ?? '',
    title: webPageSummaryResult.scraped_web_page.title ?? '',
    url: webPageSummaryResult.scraped_web_page.url ?? '',
    originalContent: webPageSummaryResult.scraped_web_page.originalContent ?? '',
    publicationState: webPageSummaryResult.scraped_web_page.publishedAt
      ? 'published'
      : 'draft',
    popularity,
  }

  upsertWebpageSummary(webPageSummary)
} catch (error) {
  console.error('Error fetching results from strapi:', error);
}
}

export default {
  async afterCreate(event) {
    await transformAndUpsertFeedback(event.result.id)
  },
}
