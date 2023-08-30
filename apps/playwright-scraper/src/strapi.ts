import { GraphQLClient } from 'graphql-request'
import { WebPageSummary } from './main.js'
import dotenv from 'dotenv'
import { graphql } from './gql/gql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

const CREATE_SCRAPE_WEBPAGE_MUTATION = graphql(`
  mutation CreateScrapedWebPage(
    $data: ScrapedWebPageInput!
    $locale: I18NLocaleCode!
  ) {
    createScrapedWebPage(data: $data, locale: $locale) {
      data {
        id
        attributes {
          Title
          Url
          OriginalContent
        }
      }
    }
  }
`)

const GET_SCRAPE_WEBPAGES_BY_URL_QUERY = graphql(`
  query GetScrapedWebPagesByUrl($url: String!) {
    scrapedWebPages(
      publicationState: PREVIEW
      locale: "all"
      filters: { Url: { eq: $url } }
    ) {
      data {
        id
        attributes {
          Url
          Title
          OriginalContent
        }
      }
    }
  }
`)

const GET_WEBPAGE_SUMMARIES_BY_LANGUAGE_MODEL_AND_URL_QUERY = graphql(`
  query GetWebPageSummariesByLanguageModelAndUrl(
    $languageModel: String!
    $url: String!
  ) {
    webPageSummaries(
      publicationState: PREVIEW
      locale: "all"
      filters: {
        LargeLanguageModel: { eq: $languageModel }
        scraped_web_pages: { Url: { eq: $url } }
      }
    ) {
      data {
        id
        attributes {
          Keywords
          Summary
          LargeLanguageModel
          scraped_web_pages {
            data {
              id
              attributes {
                Url
              }
            }
          }
        }
      }
    }
  }
`)
const CREATE_WEBPAGE_SUMMARY_MUTATION = graphql(`
  mutation CreateWebPageSummary($data: WebPageSummaryInput!) {
    createWebPageSummary(data: $data) {
      data {
        id
        attributes {
          Keywords
          Summary
          LargeLanguageModel
          scraped_web_pages {
            data {
              id
            }
          }
        }
      }
    }
  }
`)

const UPDATE_WEBPAGE_SUMMARY_MUTATION = graphql(`
  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {
    updateWebPageSummary(id: $id, data: $data) {
      data {
        id
        attributes {
          Keywords
          Summary
          LargeLanguageModel
          scraped_web_pages {
            data {
              id
            }
          }
        }
      }
    }
  }
`)

export const upsertScrapedWebPage = async (webPageSummary: WebPageSummary) => {
  const newSummary = {
    Summary: webPageSummary.summary,
    Keywords: JSON.stringify(webPageSummary.keywords),
    LargeLanguageModel: webPageSummary.largeLanguageModel,
  }

  try {
    async function createScrapedWebPage() {
      const { scrapedWebPages } = await client.request(
        GET_SCRAPE_WEBPAGES_BY_URL_QUERY,
        { url: webPageSummary.url },
      )
      const existingScrapedWebPage = scrapedWebPages?.data?.[0]

      if (existingScrapedWebPage?.id) {
        return existingScrapedWebPage?.id
      }

      const createdScrapedWebPage = await client.request(
        CREATE_SCRAPE_WEBPAGE_MUTATION,
        {
          data: {
            Title: webPageSummary.title,
            OriginalContent: webPageSummary.content,
            Url: webPageSummary.url,
          },
          locale: webPageSummary.language,
        },
      )

      const createdScrapedWebPageId =
        createdScrapedWebPage.createScrapedWebPage?.data?.id
      console.log('Created ScrapedWebPage with ID:', createdScrapedWebPageId)
      return createdScrapedWebPageId
    }

    const ScrapedWebPageId = await createScrapedWebPage()

    const { webPageSummaries } = await client.request(
      GET_WEBPAGE_SUMMARIES_BY_LANGUAGE_MODEL_AND_URL_QUERY,
      {
        languageModel: webPageSummary.largeLanguageModel,
        url: webPageSummary.url,
      },
    )

    const newData = {
      Keywords: JSON.stringify(webPageSummary.keywords),
      Summary: webPageSummary.summary,
      LargeLanguageModel: webPageSummary.largeLanguageModel,
    }

    if (
      webPageSummaries?.data &&
      webPageSummaries?.data.length > 0 &&
      webPageSummaries?.data[0].id
    ) {
      const { updateWebPageSummary } = await client.request(
        UPDATE_WEBPAGE_SUMMARY_MUTATION,
        {
          id: webPageSummaries?.data?.[0].id,
          data: newData,
        },
      )
      const createdSummaryId = updateWebPageSummary?.data?.id
      console.log('Update WebPageSummary with ID:', createdSummaryId)
    } else {
      const { createWebPageSummary } = await client.request(
        CREATE_WEBPAGE_SUMMARY_MUTATION,
        { data: { ...newData, scraped_web_pages: ScrapedWebPageId } },
      )

      const createdSummaryId = createWebPageSummary?.data?.id
      console.log('Created WebPageSummary with ID:', createdSummaryId)
    }
  } catch (error) {
    console.error(error)
  }
}
