import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getAllOutdatedSummaries = async () => {
  // const { webPageSummaries } = await strapiClient.request(
  //   graphql(`
  //     query GetOutdatedWebPageSummaries {
  //       webPageSummaries(publicationState: PREVIEW, locale: "all") {
  //         data {
  //           id
  //           attributes {
  //             lastScrapeUpdate
  //             locale
  //             scraped_web_page {
  //               data {
  //                 id
  //                 attributes {
  //                   updatedAt
  //                   originalContent
  //                   prompts {
  //                     data {
  //                       attributes {
  //                         summaryPrompt
  //                         keywordPrompt
  //                         llm
  //                         locale
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `),
  //   {},
  // )
  // return (
  //   webPageSummaries?.data
  //     .filter(
  //       (summary) =>
  //         summary.attributes?.scraped_web_page?.data?.attributes?.updatedAt >
  //         summary.attributes?.lastScrapeUpdate,
  //     )
  //     .map((item) => {
  //       const id = item.id!
  //       const attributes = item.attributes!
  //       const prompts =
  //         attributes.scraped_web_page?.data?.attributes?.prompts?.data.filter(
  //           (prompt) => prompt.attributes?.locale === attributes.locale,
  //         ) ?? []
  //       return {
  //         summaryId: id,
  //         keywordPrompt: prompts.at(0)?.attributes?.keywordPrompt,
  //         summaryPrompt: prompts.at(0)?.attributes?.summaryPrompt,
  //         largeLanguageModel: prompts.at(0)?.attributes?.llm ?? 'unspecified',
  //         scrapedPageId: attributes.scraped_web_page?.data?.id ?? '',
  //         originalContent:
  //           attributes.scraped_web_page?.data?.attributes?.originalContent ??
  //           '',
  //       }
  //     }) ?? []
  // )
}
