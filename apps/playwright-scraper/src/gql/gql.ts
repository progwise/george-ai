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
    "\n  mutation CreateWebPageSummary(\n    $data: WebPageSummaryInput!\n    $locale: I18NLocaleCode!\n  ) {\n    createWebPageSummary(data: $data, locale: $locale) {\n      data {\n        id\n        attributes {\n          Title\n          Url\n          OriginalContent\n          WebPageSummary {\n            LargeLanguageModel\n            GeneratedKeywords\n            GeneratedSummary\n          }\n        }\n      }\n    }\n  }\n": types.CreateWebPageSummaryDocument,
    "\n  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n    updateWebPageSummary(id: $id, data: $data) {\n      data {\n        id\n        attributes {\n          WebPageSummary {\n            GeneratedKeywords\n            GeneratedSummary\n          }\n        }\n      }\n    }\n  }\n": types.UpdateWebPageSummaryDocument,
    "\n  query GetWebPageSummary($url: String!, $model: String!) {\n    webPageSummaries(\n      publicationState: PREVIEW\n      filters: {\n        Url: { eq: $url }\n        WebPageSummary: { LargeLanguageModel: { eq: \"Your Model Value Here\" } }\n      }\n    ) {\n      data {\n        id\n        attributes {\n          Url\n          WebPageSummary {\n            LargeLanguageModel\n            GeneratedSummary\n            GeneratedKeywords\n          }\n        }\n      }\n    }\n  }\n": types.GetWebPageSummaryDocument,
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
export function graphql(source: "\n  mutation CreateWebPageSummary(\n    $data: WebPageSummaryInput!\n    $locale: I18NLocaleCode!\n  ) {\n    createWebPageSummary(data: $data, locale: $locale) {\n      data {\n        id\n        attributes {\n          Title\n          Url\n          OriginalContent\n          WebPageSummary {\n            LargeLanguageModel\n            GeneratedKeywords\n            GeneratedSummary\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateWebPageSummary(\n    $data: WebPageSummaryInput!\n    $locale: I18NLocaleCode!\n  ) {\n    createWebPageSummary(data: $data, locale: $locale) {\n      data {\n        id\n        attributes {\n          Title\n          Url\n          OriginalContent\n          WebPageSummary {\n            LargeLanguageModel\n            GeneratedKeywords\n            GeneratedSummary\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n    updateWebPageSummary(id: $id, data: $data) {\n      data {\n        id\n        attributes {\n          WebPageSummary {\n            GeneratedKeywords\n            GeneratedSummary\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {\n    updateWebPageSummary(id: $id, data: $data) {\n      data {\n        id\n        attributes {\n          WebPageSummary {\n            GeneratedKeywords\n            GeneratedSummary\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWebPageSummary($url: String!, $model: String!) {\n    webPageSummaries(\n      publicationState: PREVIEW\n      filters: {\n        Url: { eq: $url }\n        WebPageSummary: { LargeLanguageModel: { eq: \"Your Model Value Here\" } }\n      }\n    ) {\n      data {\n        id\n        attributes {\n          Url\n          WebPageSummary {\n            LargeLanguageModel\n            GeneratedSummary\n            GeneratedKeywords\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetWebPageSummary($url: String!, $model: String!) {\n    webPageSummaries(\n      publicationState: PREVIEW\n      filters: {\n        Url: { eq: $url }\n        WebPageSummary: { LargeLanguageModel: { eq: \"Your Model Value Here\" } }\n      }\n    ) {\n      data {\n        id\n        attributes {\n          Url\n          WebPageSummary {\n            LargeLanguageModel\n            GeneratedSummary\n            GeneratedKeywords\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;