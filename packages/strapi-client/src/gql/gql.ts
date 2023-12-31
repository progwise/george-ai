/* eslint-disable */
import * as types from './graphql'
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n      query GetAllLocales {\n        i18NLocales {\n          data {\n            id\n            attributes {\n              code\n            }\n          }\n        }\n      }\n    ':
    types.GetAllLocalesDocument,
  '\n        query GetScraperConfiguration {\n          scraperConfiguration {\n            data {\n              attributes {\n                entryPoints {\n                  startUrl\n                  depth\n                  prompts {\n                    data {\n                      id\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      ':
    types.GetScraperConfigurationDocument,
  '\n      mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {\n        createSummaryFeedback(data: $input) {\n          data {\n            id\n            attributes {\n              selectedSummaryIndex\n              query\n              voting\n              web_page_summary {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ':
    types.CreateSummaryFeedbackDocument,
  '\n      mutation CreatePrompt(\n        $locale: I18NLocaleCode!\n        $summaryPrompt: String!\n        $keywordPrompt: String!\n        $llm: String!\n      ) {\n        createPrompt(\n          locale: $locale\n          data: {\n            summaryPrompt: $summaryPrompt\n            keywordPrompt: $keywordPrompt\n            llm: $llm\n            isDefaultPrompt: true\n          }\n        ) {\n          data {\n            id\n          }\n        }\n      }\n    ':
    types.CreatePromptDocument,
  '\n      mutation DeletePrompt($id: ID!) {\n        deletePrompt(id: $id) {\n          data {\n            id\n          }\n        }\n      }\n    ':
    types.DeletePromptDocument,
  '\n      query GetDefaultPrompts {\n        prompts(locale: "all", filters: { isDefaultPrompt: { eq: true } }) {\n          data {\n            id\n          }\n        }\n      }\n    ':
    types.GetDefaultPromptsDocument,
  '\n      mutation CreateProposalForSummary(\n        $proposalSummary: String!\n        $summaryId: ID!\n      ) {\n        createProposalForSummary(\n          data: {\n            proposalSummary: $proposalSummary\n            web_page_summary: $summaryId\n          }\n        ) {\n          data {\n            id\n            attributes {\n              proposalSummary\n              web_page_summary {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ':
    types.CreateProposalForSummaryDocument,
  '\n      mutation CreateScrapedWebPage($data: ScrapedWebPageInput!) {\n        createScrapedWebPage(data: $data) {\n          data {\n            id\n          }\n        }\n      }\n    ':
    types.CreateScrapedWebPageDocument,
  '\n      query GetAllScrapedWebPages {\n        scrapedWebPages {\n          data {\n            id\n            attributes {\n              originalContent\n              url\n              prompts {\n                data {\n                  attributes {\n                    summaryPrompt\n                    keywordPrompt\n                    llm\n                    locale\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ':
    types.GetAllScrapedWebPagesDocument,
  '\n      query GetScrapedWebPagesByUrl($url: String!) {\n        scrapedWebPages(filters: { url: { eq: $url } }) {\n          data {\n            id\n            attributes {\n              originalContent\n            }\n          }\n        }\n      }\n    ':
    types.GetScrapedWebPagesByUrlDocument,
  '\n      mutation UpdateScrapedWebPage($id: ID!, $data: ScrapedWebPageInput!) {\n        updateScrapedWebPage(id: $id, data: $data) {\n          data {\n            id\n          }\n        }\n      }\n    ':
    types.UpdateScrapedWebPageDocument,
  '\n      mutation CreateWebPageSummary(\n        $data: WebPageSummaryInput!\n        $locale: I18NLocaleCode!\n      ) {\n        createWebPageSummary(data: $data, locale: $locale) {\n          data {\n            id\n            attributes {\n              keywords\n              summary\n              largeLanguageModel\n              scraped_web_page {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ':
    types.CreateWebPageSummaryDocument,
  '\n      query GetOutdatedWebPageSummaries {\n        webPageSummaries(publicationState: PREVIEW, locale: "all") {\n          data {\n            id\n            attributes {\n              lastScrapeUpdate\n              locale\n              scraped_web_page {\n                data {\n                  id\n                  attributes {\n                    updatedAt\n                    originalContent\n                    prompts {\n                      data {\n                        attributes {\n                          summaryPrompt\n                          keywordPrompt\n                          llm\n                          locale\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ':
    types.GetOutdatedWebPageSummariesDocument,
  '\n      query GetWebPageSummaries {\n        webPageSummaries(publicationState: PREVIEW, locale: "all") {\n          data {\n            id\n            attributes {\n              lastScrapeUpdate\n              locale\n              keywords\n              summary\n              largeLanguageModel\n              publishedAt\n              summary_feedbacks {\n                data {\n                  attributes {\n                    createdAt\n                    voting\n                  }\n                }\n              }\n              scraped_web_page {\n                data {\n                  attributes {\n                    title\n                    url\n                    originalContent\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ':
    types.GetWebPageSummariesDocument,
  '\n      query GetWebPageSummariesByLanguageModelAndUrl(\n        $languageModel: String!\n        $url: String!\n        $locale: String!\n      ) {\n        webPageSummaries(\n          publicationState: PREVIEW\n          locale: "all"\n          filters: {\n            largeLanguageModel: { eq: $languageModel }\n            scraped_web_page: { url: { eq: $url } }\n            locale: { eq: $locale }\n          }\n        ) {\n          data {\n            id\n          }\n        }\n      }\n    ':
    types.GetWebPageSummariesByLanguageModelAndUrlDocument,
  '\n      mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n        updateWebPageSummary(id: $id, data: $data) {\n          data {\n            id\n            attributes {\n              locale\n              keywords\n              summary\n              largeLanguageModel\n              scraped_web_page {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ':
    types.UpdateWebPageSummaryDocument,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetAllLocales {\n        i18NLocales {\n          data {\n            id\n            attributes {\n              code\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      query GetAllLocales {\n        i18NLocales {\n          data {\n            id\n            attributes {\n              code\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n        query GetScraperConfiguration {\n          scraperConfiguration {\n            data {\n              attributes {\n                entryPoints {\n                  startUrl\n                  depth\n                  prompts {\n                    data {\n                      id\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      ',
): (typeof documents)['\n        query GetScraperConfiguration {\n          scraperConfiguration {\n            data {\n              attributes {\n                entryPoints {\n                  startUrl\n                  depth\n                  prompts {\n                    data {\n                      id\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {\n        createSummaryFeedback(data: $input) {\n          data {\n            id\n            attributes {\n              selectedSummaryIndex\n              query\n              voting\n              web_page_summary {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation CreateSummaryFeedback($input: SummaryFeedbackInput!) {\n        createSummaryFeedback(data: $input) {\n          data {\n            id\n            attributes {\n              selectedSummaryIndex\n              query\n              voting\n              web_page_summary {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation CreatePrompt(\n        $locale: I18NLocaleCode!\n        $summaryPrompt: String!\n        $keywordPrompt: String!\n        $llm: String!\n      ) {\n        createPrompt(\n          locale: $locale\n          data: {\n            summaryPrompt: $summaryPrompt\n            keywordPrompt: $keywordPrompt\n            llm: $llm\n            isDefaultPrompt: true\n          }\n        ) {\n          data {\n            id\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation CreatePrompt(\n        $locale: I18NLocaleCode!\n        $summaryPrompt: String!\n        $keywordPrompt: String!\n        $llm: String!\n      ) {\n        createPrompt(\n          locale: $locale\n          data: {\n            summaryPrompt: $summaryPrompt\n            keywordPrompt: $keywordPrompt\n            llm: $llm\n            isDefaultPrompt: true\n          }\n        ) {\n          data {\n            id\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation DeletePrompt($id: ID!) {\n        deletePrompt(id: $id) {\n          data {\n            id\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation DeletePrompt($id: ID!) {\n        deletePrompt(id: $id) {\n          data {\n            id\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetDefaultPrompts {\n        prompts(locale: "all", filters: { isDefaultPrompt: { eq: true } }) {\n          data {\n            id\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      query GetDefaultPrompts {\n        prompts(locale: "all", filters: { isDefaultPrompt: { eq: true } }) {\n          data {\n            id\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation CreateProposalForSummary(\n        $proposalSummary: String!\n        $summaryId: ID!\n      ) {\n        createProposalForSummary(\n          data: {\n            proposalSummary: $proposalSummary\n            web_page_summary: $summaryId\n          }\n        ) {\n          data {\n            id\n            attributes {\n              proposalSummary\n              web_page_summary {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation CreateProposalForSummary(\n        $proposalSummary: String!\n        $summaryId: ID!\n      ) {\n        createProposalForSummary(\n          data: {\n            proposalSummary: $proposalSummary\n            web_page_summary: $summaryId\n          }\n        ) {\n          data {\n            id\n            attributes {\n              proposalSummary\n              web_page_summary {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation CreateScrapedWebPage($data: ScrapedWebPageInput!) {\n        createScrapedWebPage(data: $data) {\n          data {\n            id\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation CreateScrapedWebPage($data: ScrapedWebPageInput!) {\n        createScrapedWebPage(data: $data) {\n          data {\n            id\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetAllScrapedWebPages {\n        scrapedWebPages {\n          data {\n            id\n            attributes {\n              originalContent\n              url\n              prompts {\n                data {\n                  attributes {\n                    summaryPrompt\n                    keywordPrompt\n                    llm\n                    locale\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      query GetAllScrapedWebPages {\n        scrapedWebPages {\n          data {\n            id\n            attributes {\n              originalContent\n              url\n              prompts {\n                data {\n                  attributes {\n                    summaryPrompt\n                    keywordPrompt\n                    llm\n                    locale\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetScrapedWebPagesByUrl($url: String!) {\n        scrapedWebPages(filters: { url: { eq: $url } }) {\n          data {\n            id\n            attributes {\n              originalContent\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      query GetScrapedWebPagesByUrl($url: String!) {\n        scrapedWebPages(filters: { url: { eq: $url } }) {\n          data {\n            id\n            attributes {\n              originalContent\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation UpdateScrapedWebPage($id: ID!, $data: ScrapedWebPageInput!) {\n        updateScrapedWebPage(id: $id, data: $data) {\n          data {\n            id\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation UpdateScrapedWebPage($id: ID!, $data: ScrapedWebPageInput!) {\n        updateScrapedWebPage(id: $id, data: $data) {\n          data {\n            id\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation CreateWebPageSummary(\n        $data: WebPageSummaryInput!\n        $locale: I18NLocaleCode!\n      ) {\n        createWebPageSummary(data: $data, locale: $locale) {\n          data {\n            id\n            attributes {\n              keywords\n              summary\n              largeLanguageModel\n              scraped_web_page {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation CreateWebPageSummary(\n        $data: WebPageSummaryInput!\n        $locale: I18NLocaleCode!\n      ) {\n        createWebPageSummary(data: $data, locale: $locale) {\n          data {\n            id\n            attributes {\n              keywords\n              summary\n              largeLanguageModel\n              scraped_web_page {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetOutdatedWebPageSummaries {\n        webPageSummaries(publicationState: PREVIEW, locale: "all") {\n          data {\n            id\n            attributes {\n              lastScrapeUpdate\n              locale\n              scraped_web_page {\n                data {\n                  id\n                  attributes {\n                    updatedAt\n                    originalContent\n                    prompts {\n                      data {\n                        attributes {\n                          summaryPrompt\n                          keywordPrompt\n                          llm\n                          locale\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      query GetOutdatedWebPageSummaries {\n        webPageSummaries(publicationState: PREVIEW, locale: "all") {\n          data {\n            id\n            attributes {\n              lastScrapeUpdate\n              locale\n              scraped_web_page {\n                data {\n                  id\n                  attributes {\n                    updatedAt\n                    originalContent\n                    prompts {\n                      data {\n                        attributes {\n                          summaryPrompt\n                          keywordPrompt\n                          llm\n                          locale\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetWebPageSummaries {\n        webPageSummaries(publicationState: PREVIEW, locale: "all") {\n          data {\n            id\n            attributes {\n              lastScrapeUpdate\n              locale\n              keywords\n              summary\n              largeLanguageModel\n              publishedAt\n              summary_feedbacks {\n                data {\n                  attributes {\n                    createdAt\n                    voting\n                  }\n                }\n              }\n              scraped_web_page {\n                data {\n                  attributes {\n                    title\n                    url\n                    originalContent\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      query GetWebPageSummaries {\n        webPageSummaries(publicationState: PREVIEW, locale: "all") {\n          data {\n            id\n            attributes {\n              lastScrapeUpdate\n              locale\n              keywords\n              summary\n              largeLanguageModel\n              publishedAt\n              summary_feedbacks {\n                data {\n                  attributes {\n                    createdAt\n                    voting\n                  }\n                }\n              }\n              scraped_web_page {\n                data {\n                  attributes {\n                    title\n                    url\n                    originalContent\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetWebPageSummariesByLanguageModelAndUrl(\n        $languageModel: String!\n        $url: String!\n        $locale: String!\n      ) {\n        webPageSummaries(\n          publicationState: PREVIEW\n          locale: "all"\n          filters: {\n            largeLanguageModel: { eq: $languageModel }\n            scraped_web_page: { url: { eq: $url } }\n            locale: { eq: $locale }\n          }\n        ) {\n          data {\n            id\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      query GetWebPageSummariesByLanguageModelAndUrl(\n        $languageModel: String!\n        $url: String!\n        $locale: String!\n      ) {\n        webPageSummaries(\n          publicationState: PREVIEW\n          locale: "all"\n          filters: {\n            largeLanguageModel: { eq: $languageModel }\n            scraped_web_page: { url: { eq: $url } }\n            locale: { eq: $locale }\n          }\n        ) {\n          data {\n            id\n          }\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n        updateWebPageSummary(id: $id, data: $data) {\n          data {\n            id\n            attributes {\n              locale\n              keywords\n              summary\n              largeLanguageModel\n              scraped_web_page {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ',
): (typeof documents)['\n      mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n        updateWebPageSummary(id: $id, data: $data) {\n          data {\n            id\n            attributes {\n              locale\n              keywords\n              summary\n              largeLanguageModel\n              scraped_web_page {\n                data {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    ']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
