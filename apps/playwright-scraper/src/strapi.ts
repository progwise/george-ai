import { GraphQLClient } from 'graphql-request'
import { WebPageSummary } from './main.js'
import dotenv from 'dotenv'
import { graphql } from './gql'

const AI_MODEL = 'gpt-3.5-turbo'
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
  const inputData = {
    GeneratedSummary: webPageSummary.summary,
    GeneratedKeywords: JSON.stringify(webPageSummary.keywords),
    LargeLanguageModel: AI_MODEL,
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
          WebPageSummaries: [inputData],
        },
        locale: webPageSummary.language,
      })
      console.log('Created new ScrapedWebPage for Url:', webPageSummary.url)
      return
    }

    const summaries = existingScrapedWebPage?.attributes?.WebPageSummaries
    const hasSummaryForLargeLanguageModel = summaries?.some(
      (summary) => summary?.LargeLanguageModel === AI_MODEL,
    )
    const updatedSummaries = hasSummaryForLargeLanguageModel
      ? summaries?.map((summary) =>
          summary?.LargeLanguageModel === AI_MODEL ? inputData : summary,
        )
      : [...(summaries || []), inputData]

    await client.request(UPDATE_SCRAPE_WEBPAGE_MUTATION, {
      id: existingScrapedWebPage?.id,
      data: {
        Title: existingScrapedWebPage?.attributes?.Title,
        OriginalContent: existingScrapedWebPage?.attributes?.OriginalContent,
        Url: existingScrapedWebPage?.attributes?.Url,
        WebPageSummaries: updatedSummaries,
      },
    })
    console.log('Updated existing ScrapedWebPage Url:', webPageSummary.url)
  } catch (error) {
    console.error(error)
  }
}
