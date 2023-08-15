import { GraphQLClient } from 'graphql-request'
import { WebPageSummary } from './main.js'
import dotenv from 'dotenv'
import * as gqlModule from '../../../src/gql/gql'

const { graphql } = gqlModule
// import { graphql } from '../../../src/gql/gql'

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
          WebPageSummaries {
            id
            LargeLanguageModel
            GeneratedKeywords
            GeneratedSummary
          }
        }
      }
    }
  }
`)

const UPDATE_SCRAPE_WEBPAGE_MUTATION = graphql(`
  mutation UpdateScrapedWebPage($id: ID!, $data: ScrapedWebPageInput!) {
    updateScrapedWebPage(id: $id, data: $data) {
      data {
        id
        attributes {
          WebPageSummaries {
            id
            LargeLanguageModel
            GeneratedKeywords
            GeneratedSummary
          }
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
          WebPageSummaries {
            id
            LargeLanguageModel
            GeneratedSummary
            GeneratedKeywords
          }
        }
      }
    }
  }
`)

export const upsertScrapedWebPage = async (webPageSummary: WebPageSummary) => {
  const newSummary = {
    GeneratedSummary: webPageSummary.summary,
    GeneratedKeywords: JSON.stringify(webPageSummary.keywords),
    LargeLanguageModel: webPageSummary.largeLanguageModel,
  }

  try {
    const { scrapedWebPages } = await client.request(
      GET_SCRAPE_WEBPAGES_BY_URL_QUERY,
      { url: webPageSummary.url },
    )
    const existingScrapedWebPage = scrapedWebPages?.data?.[0]

    if (!existingScrapedWebPage?.id) {
      await client.request(CREATE_SCRAPE_WEBPAGE_MUTATION, {
        data: {
          Title: webPageSummary.title,
          OriginalContent: webPageSummary.content,
          Url: webPageSummary.url,
          WebPageSummaries: [newSummary],
        },
        locale: webPageSummary.language,
      })
      console.log('Created new ScrapedWebPage for Url:', webPageSummary.url)
      return
    }

    const filteredSummaries =
      existingScrapedWebPage?.attributes?.WebPageSummaries?.filter(
        (summary) =>
          summary?.LargeLanguageModel !== webPageSummary.largeLanguageModel,
      ) ?? []

    await client.request(UPDATE_SCRAPE_WEBPAGE_MUTATION, {
      id: existingScrapedWebPage?.id,
      data: {
        Title: existingScrapedWebPage?.attributes?.Title,
        OriginalContent: existingScrapedWebPage?.attributes?.OriginalContent,
        Url: existingScrapedWebPage?.attributes?.Url,
        WebPageSummaries: [...filteredSummaries, newSummary],
      },
    })
    console.log('Updated existing ScrapedWebPage Url:', webPageSummary.url)
  } catch (error) {
    console.error(error)
  }
}
