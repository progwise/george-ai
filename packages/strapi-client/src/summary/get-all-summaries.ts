import { graphql } from '../gql/gql'
import { Enum_Summaryfeedback_Voting } from '../gql/graphql'
import { strapiClient } from '../strapi-client'

export enum PublicationState {
  Draft = 'draft',
  Published = 'published',
}

export const getAllSummaries = async () => {
  try {
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

    if (!webPageSummaries?.data) {
      return []
    }

    return webPageSummaries.data.map((item) => {
      const { id, attributes } = item
      if (!id) {
        return
      }
      if (!attributes) {
        return
      }

      const {
        lastScrapeUpdate,
        locale,
        keywords,
        summary,
        largeLanguageModel,
        publishedAt,
        summary_feedbacks,
        scraped_web_page,
      } = attributes

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
              const { voting } = feedbackData.attributes ?? {}
              return (
                voting === Enum_Summaryfeedback_Voting.Down ||
                voting === Enum_Summaryfeedback_Voting.Up
              )
            },
          )
          .map(({ attributes }) => {
            const { voting, createdAt } = attributes
            return {
              createdAt: new Date(createdAt ?? 0),
              voting: voting === Enum_Summaryfeedback_Voting.Up ? 'up' : 'down',
            }
          }) ?? []

      const scrapedData = scraped_web_page?.data?.attributes

      return {
        id,
        lastScrapeUpdate: new Date(lastScrapeUpdate ?? 0),
        language: locale ?? '',
        keywords: keywords ?? '',
        summary: summary ?? '',
        largeLanguageModel: largeLanguageModel ?? '',
        publicationState: publishedAt
          ? PublicationState.Published
          : PublicationState.Draft,
        feedbacks,
        title: scrapedData?.title ?? '',
        url: scrapedData?.url ?? '',
        originalContent: scrapedData?.originalContent ?? '',
      }
    })
  } catch (error) {
    console.error('Error while fetching WebPagesSummaries:', error)
    throw error
  }
}
