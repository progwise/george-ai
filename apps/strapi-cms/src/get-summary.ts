import { PublicationState } from '@george-ai/typesense-client'

export const getSummary = async (summaryId) => {
  const webPageSummary = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    summaryId,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )

  const {
    id,
    lastScrapeUpdate,
    locale,
    keywords,
    summary,
    largeLanguageModel,
    publishedAt,
    summary_feedbacks,
    scraped_web_page,
  } = webPageSummary

  const feedbacks =
    summary_feedbacks
      .filter(
        (
          feedbackData,
        ): feedbackData is {
          attributes: {
            voting
            createdAt
          }
        } => {
          const { voting } = feedbackData ?? {}
          return voting === 'down' || voting === 'up'
        },
      )
      .map((feedback) => {
        const { voting, createdAt } = feedback
        return {
          createdAt: new Date(createdAt ?? 0),
          voting,
        }
      }) ?? []

  return {
    id: id.toString() ?? '',
    lastScrapeUpdate: new Date(lastScrapeUpdate ?? 0),
    language: locale ?? '',
    keywords: keywords ?? '',
    summary: summary ?? '',
    largeLanguageModel: largeLanguageModel ?? '',
    publicationState: publishedAt
      ? PublicationState.Published
      : PublicationState.Draft,
    feedbacks,
    title: scraped_web_page?.title ?? '',
    url: scraped_web_page?.url ?? '',
    originalContent: scraped_web_page?.originalContent ?? '',
  }
}
