import { strapiClient } from './strapi-client.js'
import { ScrapeResultAndSummary } from './main.js'
import { graphql } from './gql/gql'

const getOrCreateScrapedWebPage = async (
  scrapeResultAndSummary: ScrapeResultAndSummary,
) => {
  try {
    const { scrapedWebPages } = await strapiClient.request(
      graphql(`
        query GetScrapedWebPagesByUrl($url: String!) {
          scrapedWebPages(
            publicationState: PREVIEW
            locale: "all"
            filters: { url: { eq: $url } }
          ) {
            data {
              id
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

    const createdScrapedWebPage = await strapiClient.request(
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
    const { webPageSummaries } = await strapiClient.request(
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
      await strapiClient.request(
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
      const { createWebPageSummary } = await strapiClient.request(
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
