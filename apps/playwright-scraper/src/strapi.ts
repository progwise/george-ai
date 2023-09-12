import { GraphQLClient } from 'graphql-request'
import { ScrapeResultAndSummary } from './main.js'
import dotenv from 'dotenv'
import { graphql } from './gql/gql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

const getOrCreateScrapedWebPage = async (
  scrapeResultAndSummary: ScrapeResultAndSummary,
) => {
  try {
    const { scrapedWebPages } = await client.request(
      graphql(`
        query GetScrapedWebPagesByUrl($url: String!) {
          scrapedWebPages(
            publicationState: PREVIEW
            locale: "all"
            filters: { url: { eq: $url } }
          ) {
            data {
              id
              attributes {
                url
                title
                originalContent
              }
            }
          }
        }
      `),
      { url: scrapeResultAndSummary.url },
    )
    const existingScrapedWebPage = scrapedWebPages?.data?.at(0)

    if (existingScrapedWebPage) {
      return existingScrapedWebPage
    }

    const createdScrapedWebPage = await client.request(
      graphql(`
        mutation CreateScrapedWebPage(
          $data: ScrapedWebPageInput!
          $locale: I18NLocaleCode!
        ) {
          createScrapedWebPage(data: $data, locale: $locale) {
            data {
              id
              attributes {
                title
                url
                originalContent
              }
            }
          }
        }
      `),
      {
        data: {
          title: scrapeResultAndSummary.title,
          originalContent: scrapeResultAndSummary.content,
          url: scrapeResultAndSummary.url,
        },
        locale: scrapeResultAndSummary.scrapedLanguage,
      },
    )
    const scrapedWebPage = createdScrapedWebPage.createScrapedWebPage?.data

    console.log('Created ScrapedWebPage with ID:', scrapedWebPage?.id)

    return scrapedWebPage
  } catch (error) {
    console.error(error)
  }
}

const upsertWebPageSummary = async (
  scrapeResultAndSummary: ScrapeResultAndSummary,
  ScrapedWebPageId: string,
) => {
  const newSummary = {
    summary: scrapeResultAndSummary.summary,
    keywords: JSON.stringify(scrapeResultAndSummary.keywords),
    largeLanguageModel: scrapeResultAndSummary.largeLanguageModel,
    scraped_web_page: ScrapedWebPageId,
  }

  try {
    const { webPageSummaries } = await client.request(
      graphql(`
        query GetWebPageSummariesByLanguageModelAndUrl(
          $languageModel: String!
          $url: String!
          $locale: String!
        ) {
          webPageSummaries(
            publicationState: PREVIEW
            locale: "all"
            filters: {
              largeLanguageModel: { eq: $languageModel }
              scraped_web_page: { url: { eq: $url } }
              locale: { eq: $locale }
            }
          ) {
            data {
              id
              attributes {
                keywords
                summary
                largeLanguageModel
                scraped_web_page {
                  data {
                    id
                    attributes {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      `),
      {
        languageModel: scrapeResultAndSummary.largeLanguageModel,
        url: scrapeResultAndSummary.url,
        locale: scrapeResultAndSummary.currentLanguage,
      },
    )

    const webPageSummaryId = webPageSummaries?.data.at(0)?.id

    if (webPageSummaryId) {
      await client.request(
        graphql(`
          mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {
            updateWebPageSummary(id: $id, data: $data) {
              data {
                id
                attributes {
                  keywords
                  summary
                  largeLanguageModel
                  scraped_web_page {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        `),
        {
          id: webPageSummaryId,
          data: newSummary,
        },
      )

      console.log('Update WebPageSummary with ID:', webPageSummaryId)
    } else {
      const { createWebPageSummary } = await client.request(
        graphql(`
          mutation CreateWebPageSummary(
            $data: WebPageSummaryInput!
            $locale: I18NLocaleCode!
          ) {
            createWebPageSummary(data: $data, locale: $locale) {
              data {
                id
                attributes {
                  keywords
                  summary
                  largeLanguageModel
                  scraped_web_page {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        `),
        {
          data: newSummary,
          locale: scrapeResultAndSummary.currentLanguage,
        },
      )

      const createdSummaryId = createWebPageSummary?.data?.id

      console.log('Created WebPageSummary with ID:', createdSummaryId)
    }
  } catch (error) {
    console.error(error)
  }
}

export const upsertScrapedWebPageAndWebPageSummary = async (
  scrapeResultAndSummary: ScrapeResultAndSummary,
) => {
  const createdScrapedWebPage = await getOrCreateScrapedWebPage(
    scrapeResultAndSummary,
  )

  if (createdScrapedWebPage?.id) {
    await upsertWebPageSummary(scrapeResultAndSummary, createdScrapedWebPage.id)
  }
}
