import { GraphQLClient } from 'graphql-request'
import { ScrapeResultandSummary } from './main.js'
import dotenv from 'dotenv'
import { graphql } from './gql/gql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

// TODO: should the locale be stored in the ScrapedWebPage or WebPageSummaries?
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

const getOrCreateScrapedWebPage = async (
  scrapeResultAndSummary: ScrapeResultandSummary,
) => {
  try {
    const { scrapedWebPages } = await client.request(
      GET_SCRAPE_WEBPAGES_BY_URL_QUERY,
      { url: scrapeResultAndSummary.url },
    )
    const existingScrapedWebPage = scrapedWebPages?.data?.at(0)

    if (existingScrapedWebPage) {
      return existingScrapedWebPage
    }

    const createdScrapedWebPage = await client.request(
      CREATE_SCRAPE_WEBPAGE_MUTATION,
      {
        data: {
          Title: scrapeResultAndSummary.title,
          OriginalContent: scrapeResultAndSummary.content,
          Url: scrapeResultAndSummary.url,
        },
        locale: scrapeResultAndSummary.language,
      },
    )
    const scrapedWebPage = createdScrapedWebPage.createScrapedWebPage?.data

    console.log('Created ScrapedWebPage with ID:', scrapedWebPage?.id)

    return scrapedWebPage
  } catch (error) {
    console.error(error)
  }
}

const createOrUpdateWebPageSummary = async (
  scrapeResultAndSummary: ScrapeResultandSummary,
  ScrapedWebPageId: string,
) => {
  const newSummary = {
    Summary: scrapeResultAndSummary.summary,
    Keywords: JSON.stringify(scrapeResultAndSummary.keywords),
    LargeLanguageModel: scrapeResultAndSummary.largeLanguageModel,
  }

  try {
    const { webPageSummaries } = await client.request(
      GET_WEBPAGE_SUMMARIES_BY_LANGUAGE_MODEL_AND_URL_QUERY,
      {
        languageModel: scrapeResultAndSummary.largeLanguageModel,
        url: scrapeResultAndSummary.url,
      },
    )

    const webPageSummariesId = webPageSummaries?.data.at(0)?.id

    if (webPageSummariesId) {
      const { updateWebPageSummary } = await client.request(
        UPDATE_WEBPAGE_SUMMARY_MUTATION,
        {
          id: webPageSummariesId,
          data: newSummary,
        },
      )
      const createdSummaryId = updateWebPageSummary?.data?.id

      console.log('Update WebPageSummary with ID:', createdSummaryId)
    } else {
      const { createWebPageSummary } = await client.request(
        CREATE_WEBPAGE_SUMMARY_MUTATION,
        {
          data: {
            ...newSummary,
            scraped_web_pages: ScrapedWebPageId,
          },
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
  scrapeResultAndSummary: ScrapeResultandSummary,
) => {
  const createdScrapedWebPage = await getOrCreateScrapedWebPage(
    scrapeResultAndSummary,
  )

  if (createdScrapedWebPage && createdScrapedWebPage.id) {
    await createOrUpdateWebPageSummary(
      scrapeResultAndSummary,
      createdScrapedWebPage.id,
    )
  }
}
