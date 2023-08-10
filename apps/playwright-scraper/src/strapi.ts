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
          Title
          OriginalContent
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
  const inputData = {
    GeneratedSummary: summary.summary,
    GeneratedKeywords: JSON.stringify(summary.keywords),
    LargeLanguageModel: AI_MODEL,
  }

  try {
    const { scrapedWebPages } = await client.request(
      GET_SCRAPE_WEBPAGE_BY_URL_QUERY,
      { url: summary.url },
    )
    const existing = scrapedWebPages?.data?.[0]

    if (!existing?.id) {
      await client.request(CREATE_SCRAPE_WEBPAGE_MUTATION, {
        data: {
          Title: summary.title,
          OriginalContent: summary.content,
          Url: summary.url,
          WebPageSummary: [inputData],
        },
        locale: summary.language,
      })
      console.log('Created new ScrapedWebPage for URL:', summary.url)
      return
    }

    const summaries = existing?.attributes?.WebPageSummary
    const updatedSummaries = summaries?.some(
      (summary) => summary?.LargeLanguageModel === AI_MODEL,
    )
      ? summaries.map((s) =>
          s?.LargeLanguageModel === AI_MODEL ? inputData : s,
        )
      : [...(summaries || []), inputData]

    await client.request(UPDATE_SCRAPE_WEBPAGE_MUTATION, {
      id: existing?.id,
      data: {
        Title: existing?.attributes?.Title,
        OriginalContent: existing?.attributes?.OriginalContent,
        Url: existing?.attributes?.Url,
        WebPageSummary: updatedSummaries,
      },
    })
    console.log(
      'Updated existing ScrapedWebPage ID:',
      existing.id,
      'for URL:',
      summary.url,
    )
  } catch (error) {
    console.error('Error processing web page:', summary.url)
    console.error(error)
  }
}
