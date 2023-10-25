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
  '\n      query GetFilters {\n        filters {\n          language\n          largeLanguageModel\n          publicationState\n        }\n      }\n    ':
    types.GetFiltersDocument,
  '\n      mutation CreateSummaryFeedback(\n        $infoCardIndex: Int!\n        $voting: SummaryFeedbackVoting!\n        $summaryId: String!\n        $query: String!\n      ) {\n        createSummaryFeedback(\n          data: {\n            selectedSummaryIndex: $infoCardIndex\n            voting: $voting\n            webPageSummaryId: $summaryId\n            query: $query\n          }\n        ) {\n          id\n        }\n      }\n    ':
    types.CreateSummaryFeedbackDocument,
  '\n  fragment InfoCard on summaries {\n    id\n    title\n    url\n    language\n    publicationState\n    keywords\n    summary\n    largeLanguageModel\n  }\n':
    types.InfoCardFragmentDoc,
  '\n      mutation CreateProposalSummary(\n        $proposalSummary: String!\n        $summaryId: String!\n        $language: String!\n      ) {\n        createProposalSummary(\n          data: {\n            proposalSummary: $proposalSummary\n            summaryId: $summaryId\n            locale: $language\n          }\n        ) {\n          id\n        }\n      }\n    ':
    types.CreateProposalSummaryDocument,
  '\n      query GetSummaries(\n        $query: String\n        $language: [String!]\n        $publicationState: [String!]\n        $largeLanguageModel: [String!]\n        $keywords: [String!]\n      ) {\n        summaries(\n          query: $query\n          language: $language\n          publicationState: $publicationState\n          largeLanguageModel: $largeLanguageModel\n          keywords: $keywords\n        ) {\n          id\n          ...InfoCard\n        }\n      }\n    ':
    types.GetSummariesDocument,
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
  source: '\n      query GetFilters {\n        filters {\n          language\n          largeLanguageModel\n          publicationState\n        }\n      }\n    ',
): (typeof documents)['\n      query GetFilters {\n        filters {\n          language\n          largeLanguageModel\n          publicationState\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation CreateSummaryFeedback(\n        $infoCardIndex: Int!\n        $voting: SummaryFeedbackVoting!\n        $summaryId: String!\n        $query: String!\n      ) {\n        createSummaryFeedback(\n          data: {\n            selectedSummaryIndex: $infoCardIndex\n            voting: $voting\n            webPageSummaryId: $summaryId\n            query: $query\n          }\n        ) {\n          id\n        }\n      }\n    ',
): (typeof documents)['\n      mutation CreateSummaryFeedback(\n        $infoCardIndex: Int!\n        $voting: SummaryFeedbackVoting!\n        $summaryId: String!\n        $query: String!\n      ) {\n        createSummaryFeedback(\n          data: {\n            selectedSummaryIndex: $infoCardIndex\n            voting: $voting\n            webPageSummaryId: $summaryId\n            query: $query\n          }\n        ) {\n          id\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment InfoCard on summaries {\n    id\n    title\n    url\n    language\n    publicationState\n    keywords\n    summary\n    largeLanguageModel\n  }\n',
): (typeof documents)['\n  fragment InfoCard on summaries {\n    id\n    title\n    url\n    language\n    publicationState\n    keywords\n    summary\n    largeLanguageModel\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      mutation CreateProposalSummary(\n        $proposalSummary: String!\n        $summaryId: String!\n        $language: String!\n      ) {\n        createProposalSummary(\n          data: {\n            proposalSummary: $proposalSummary\n            summaryId: $summaryId\n            locale: $language\n          }\n        ) {\n          id\n        }\n      }\n    ',
): (typeof documents)['\n      mutation CreateProposalSummary(\n        $proposalSummary: String!\n        $summaryId: String!\n        $language: String!\n      ) {\n        createProposalSummary(\n          data: {\n            proposalSummary: $proposalSummary\n            summaryId: $summaryId\n            locale: $language\n          }\n        ) {\n          id\n        }\n      }\n    ']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n      query GetSummaries(\n        $query: String\n        $language: [String!]\n        $publicationState: [String!]\n        $largeLanguageModel: [String!]\n        $keywords: [String!]\n      ) {\n        summaries(\n          query: $query\n          language: $language\n          publicationState: $publicationState\n          largeLanguageModel: $largeLanguageModel\n          keywords: $keywords\n        ) {\n          id\n          ...InfoCard\n        }\n      }\n    ',
): (typeof documents)['\n      query GetSummaries(\n        $query: String\n        $language: [String!]\n        $publicationState: [String!]\n        $largeLanguageModel: [String!]\n        $keywords: [String!]\n      ) {\n        summaries(\n          query: $query\n          language: $language\n          publicationState: $publicationState\n          largeLanguageModel: $largeLanguageModel\n          keywords: $keywords\n        ) {\n          id\n          ...InfoCard\n        }\n      }\n    ']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
