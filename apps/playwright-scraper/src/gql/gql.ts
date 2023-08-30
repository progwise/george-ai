/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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
    "\n  mutation CreateScrapedWebPage(\n    $data: ScrapedWebPageInput!\n    $locale: I18NLocaleCode!\n  ) {\n    createScrapedWebPage(data: $data, locale: $locale) {\n      data {\n        id\n        attributes {\n          Title\n          Url\n          OriginalContent\n        }\n      }\n    }\n  }\n": types.CreateScrapedWebPageDocument,
    "\n  query GetScrapedWebPagesByUrl($url: String!) {\n    scrapedWebPages(\n      publicationState: PREVIEW\n      locale: \"all\"\n      filters: { Url: { eq: $url } }\n    ) {\n      data {\n        id\n        attributes {\n          Url\n          Title\n          OriginalContent\n        }\n      }\n    }\n  }\n": types.GetScrapedWebPagesByUrlDocument,
    "\n  query GetWebPageSummariesByLanguageModelAndUrl(\n    $languageModel: String!\n    $url: String!\n  ) {\n    webPageSummaries(\n      publicationState: PREVIEW\n      locale: \"all\"\n      filters: {\n        LargeLanguageModel: { eq: $languageModel }\n        scraped_web_pages: { Url: { eq: $url } }\n      }\n    ) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n              attributes {\n                Url\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetWebPageSummariesByLanguageModelAndUrlDocument,
    "\n  mutation CreateWebPageSummary($data: WebPageSummaryInput!) {\n    createWebPageSummary(data: $data) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n": types.CreateWebPageSummaryDocument,
    "\n  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n    updateWebPageSummary(id: $id, data: $data) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n": types.UpdateWebPageSummaryDocument,
};

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
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateScrapedWebPage(\n    $data: ScrapedWebPageInput!\n    $locale: I18NLocaleCode!\n  ) {\n    createScrapedWebPage(data: $data, locale: $locale) {\n      data {\n        id\n        attributes {\n          Title\n          Url\n          OriginalContent\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateScrapedWebPage(\n    $data: ScrapedWebPageInput!\n    $locale: I18NLocaleCode!\n  ) {\n    createScrapedWebPage(data: $data, locale: $locale) {\n      data {\n        id\n        attributes {\n          Title\n          Url\n          OriginalContent\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetScrapedWebPagesByUrl($url: String!) {\n    scrapedWebPages(\n      publicationState: PREVIEW\n      locale: \"all\"\n      filters: { Url: { eq: $url } }\n    ) {\n      data {\n        id\n        attributes {\n          Url\n          Title\n          OriginalContent\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetScrapedWebPagesByUrl($url: String!) {\n    scrapedWebPages(\n      publicationState: PREVIEW\n      locale: \"all\"\n      filters: { Url: { eq: $url } }\n    ) {\n      data {\n        id\n        attributes {\n          Url\n          Title\n          OriginalContent\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWebPageSummariesByLanguageModelAndUrl(\n    $languageModel: String!\n    $url: String!\n  ) {\n    webPageSummaries(\n      publicationState: PREVIEW\n      locale: \"all\"\n      filters: {\n        LargeLanguageModel: { eq: $languageModel }\n        scraped_web_pages: { Url: { eq: $url } }\n      }\n    ) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n              attributes {\n                Url\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetWebPageSummariesByLanguageModelAndUrl(\n    $languageModel: String!\n    $url: String!\n  ) {\n    webPageSummaries(\n      publicationState: PREVIEW\n      locale: \"all\"\n      filters: {\n        LargeLanguageModel: { eq: $languageModel }\n        scraped_web_pages: { Url: { eq: $url } }\n      }\n    ) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n              attributes {\n                Url\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateWebPageSummary($data: WebPageSummaryInput!) {\n    createWebPageSummary(data: $data) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateWebPageSummary($data: WebPageSummaryInput!) {\n    createWebPageSummary(data: $data) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n    updateWebPageSummary(id: $id, data: $data) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n    updateWebPageSummary(id: $id, data: $data) {\n      data {\n        id\n        attributes {\n          Keywords\n          Summary\n          LargeLanguageModel\n          scraped_web_pages {\n            data {\n              id\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;