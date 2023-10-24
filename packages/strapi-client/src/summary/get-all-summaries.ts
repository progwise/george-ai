import { graphql } from '../gql/gql'
import { Enum_Summaryfeedback_Voting } from '../gql/graphql'
import { strapiClient } from '../strapi-client'

export const getAllSummaries = async () => {
  const { webPageSummaries } = await strapiClient.request(
    graphql(`
      query GetWebPageSummaries {
        webPageSummaries(publicationState: PREVIEW, locale: "all") {
          data {
            id
            attributes {
              lastScrapeUpdate
              locale
              keywords
              summary
              largeLanguageModel
              publishedAt
              summary_feedbacks {
                data {
                  attributes {
                    createdAt
                    voting
                  }
                }
              }
              scraped_web_page {
                data {
                  attributes {
                    title
                    url
                    originalContent
                  }
                }
              }
            }
          }
        }
      }
    `),
    {},
  )

  return (
    webPageSummaries?.data.map((item) => {
      const summaryId = item.id!
      const summaryAttributes = item.attributes!

      const {
        lastScrapeUpdate,
        locale,
        keywords,
        summary,
        largeLanguageModel,
        publishedAt,
        summary_feedbacks,
        scraped_web_page,
      } = summaryAttributes

      const feedbacks =
        summary_feedbacks?.data
          .filter(
            (
              feedbackData,
            ): feedbackData is {
              attributes: {
                voting: Enum_Summaryfeedback_Voting
                createdAt: any
              }
            } => {
              const { voting, createdAt } = feedbackData.attributes ?? {}
              return (
                (voting === Enum_Summaryfeedback_Voting.Down ||
                  voting === Enum_Summaryfeedback_Voting.Up) &&
                new Date(createdAt ?? 0) > new Date(lastScrapeUpdate ?? 0)
              )
            },
          )
          .map(({ attributes: { voting } }) =>
            voting === Enum_Summaryfeedback_Voting.Up ? 'up' : 'down',
          ) ?? []

      const scrapedData = scraped_web_page?.data?.attributes

      return {
        id: summaryId,
        language: locale ?? '',
        keywords: keywords ?? '',
        summary: summary ?? '',
        largeLanguageModel: largeLanguageModel ?? '',
        publishedAt: typeof publishedAt === 'string' ? publishedAt : undefined,
        feedbacks,
        title: scrapedData?.title ?? '',
        url: scrapedData?.url ?? '',
        originalContent: scrapedData?.originalContent ?? '',
      }
    }) || []
  )
}
