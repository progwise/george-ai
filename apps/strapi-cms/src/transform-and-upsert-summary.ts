import {
  PublicationState,
  ensureCollectionExists,
  upsertWebpageSummary,
} from '@george-ai/typesense-client'

export const transformAndUpsertSummary = async (id) => {
  const webPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    id,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )

  const updatedAtDate =
    new Date(webPageSummaryResult.lastScrapeUpdate) ?? new Date(0)

  const votes = (webPageSummaryResult.summary_feedbacks ?? [])
    .filter((feedback) => {
      const createdAt = feedback.createdAt
        ? new Date(feedback.createdAt)
        : new Date(0)
      return createdAt > updatedAtDate
    })
    .map((feedback) => feedback.voting)
    .filter((vote) => vote === 'down' || vote === 'up')

  let popularity = 0
  for (const vote of votes) {
    if (vote === 'up') {
      popularity += 1
    } else if (vote === 'down') {
      popularity -= 1
    }
  }

  const parsedKeywords =
    webPageSummaryResult.keywords && JSON.parse(webPageSummaryResult.keywords)

  const webPageSummary = {
    id: webPageSummaryResult.id.toString() ?? '',
    language: webPageSummaryResult.locale ?? '',
    keywords: ((value: any): value is string[] =>
      Array.isArray(value) && value.every((item) => typeof item === 'string'))(
      parsedKeywords,
    )
      ? parsedKeywords
      : [],
    summary: webPageSummaryResult.summary ?? '',
    largeLanguageModel: webPageSummaryResult.largeLanguageModel ?? '',
    title: webPageSummaryResult.scraped_web_page.title ?? '',
    url: webPageSummaryResult.scraped_web_page.url ?? '',
    originalContent:
      webPageSummaryResult.scraped_web_page.originalContent ?? '',
    publicationState: webPageSummaryResult.publishedAt
      ? PublicationState.Published
      : PublicationState.Draft,
    popularity,
  }

  await ensureCollectionExists()
  await upsertWebpageSummary(webPageSummary)
}
