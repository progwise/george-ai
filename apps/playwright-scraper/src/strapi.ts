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
          WebPageSummary {
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
          WebPageSummary {
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

const GET_SCRAPE_WEBPAGE_BY_URL_QUERY = graphql(`
  query GetScrapedWebPageByUrl($url: String!) {
    scrapedWebPages(
      publicationState: PREVIEW
      locale: "all"
      filters: { Url: { eq: $url } }
    ) {
      data {
        id
        attributes {
          Url
          WebPageSummary {
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

export const upsertScrapedWebPage = async (summary: WebPageSummary) => {
  try {
    const webPageSummary = {
      GeneratedSummary: summary.summary,
      GeneratedKeywords: JSON.stringify(summary.keywords),
      LargeLanguageModel: AI_MODEL,
    }

    const data = {
      Title: summary.title,
      OriginalContent: summary.content,
      Url: summary.url,
      WebPageSummary: [webPageSummary],
    }

    // Fetch existing WebPageSummary by URL
    const { scrapedWebPages } = await client.request(
      GET_SCRAPE_WEBPAGE_BY_URL_QUERY,
      { url: summary.url }
    )
    const existingSummary = scrapedWebPages?.data.at(0)

    if (!existingSummary?.id) {
      // If no entry exists for the provided URL, create a new one
      const response = await client.request(CREATE_SCRAPE_WEBPAGE_MUTATION, {
        data,
        locale: summary.language,
      })
      console.log(
        'Successfully created ScrapedWebPage with ID:',
        response.createScrapedWebPage?.data?.id
      )
      return
    }

    // Loop through WebPageSummary entries to find and update the matching AI model
    const updatedWebPageSummaries =
      existingSummary.attributes?.WebPageSummary?.map((entry) => {
        if (entry?.LargeLanguageModel === AI_MODEL) {
          return {
            ...entry,
            ...webPageSummary,
          }
        }
        return entry
      })

    if (
      updatedWebPageSummaries?.some(
        (entry) => entry?.LargeLanguageModel === AI_MODEL
      )
    ) {
      await client.request(UPDATE_SCRAPE_WEBPAGE_MUTATION, {
        id: existingSummary.id,
        data: { WebPageSummary: updatedWebPageSummaries },
      })
      console.log(
        'Successfully updated ScrapedWebPage with ID:',
        existingSummary.id
      )
      return
    }

    // Update the existing entry with a new WebPageSummary, as the AI model did not match any existing summaries
    await client.request(UPDATE_SCRAPE_WEBPAGE_MUTATION, {
      id: existingSummary.id,
      data: {
        ...data,
        WebPageSummary: [
          ...(existingSummary.attributes?.WebPageSummary ?? []),
          webPageSummary,
        ],
      },
    })
    console.log(
      'Added new WebPageSummary entry to existing WebPage with ID:',
      existingSummary.id
    )
  } catch (error) {
    console.error('Failed to upsert ScrapedWebPage', error)
  }
}
