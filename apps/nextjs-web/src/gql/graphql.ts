/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type IndexedWebPage = {
  __typename?: 'IndexedWebPage'
  id: Scalars['String']['output']
  keywords: Array<Scalars['String']['output']>
  language: Scalars['String']['output']
  largeLanguageModel: Scalars['String']['output']
  originalContent: Scalars['String']['output']
  publicationState: PublicationState
  summary: Scalars['String']['output']
  title: Scalars['String']['output']
  url: Scalars['String']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  createSummaryFeedback: SummaryFeedback
}

export type MutationCreateSummaryFeedbackArgs = {
  data: SummaryFeedbackInput
}

export enum PublicationState {
  Draft = 'Draft',
  Published = 'Published',
}

export type Query = {
  __typename?: 'Query'
  allSummaries: Array<WebPageSummary>
  searchResult: Array<IndexedWebPage>
}

export type QuerySearchResultArgs = {
  language?: InputMaybe<Scalars['String']['input']>
  largeLanguageModel?: InputMaybe<Scalars['String']['input']>
  publicationState?: InputMaybe<PublicationState>
  query?: InputMaybe<Scalars['String']['input']>
}

export type SummaryFeedback = {
  __typename?: 'SummaryFeedback'
  feedbackDate: Scalars['String']['output']
  id: Scalars['String']['output']
  position: Scalars['Int']['output']
  query: Scalars['String']['output']
  voting?: Maybe<SummaryFeedbackVoting>
  webPageSummaryId: Scalars['String']['output']
}

export type SummaryFeedbackInput = {
  position: Scalars['Int']['input']
  query: Scalars['String']['input']
  voting: SummaryFeedbackVoting
  webPageSummaryId: Scalars['String']['input']
}

export enum SummaryFeedbackVoting {
  Down = 'Down',
  Up = 'Up',
}

export type WebPageSummary = {
  __typename?: 'WebPageSummary'
  id: Scalars['String']['output']
  keywords: Scalars['String']['output']
  largeLanguageModel: Scalars['String']['output']
  locale: Scalars['String']['output']
  originalContent: Scalars['String']['output']
  publishedAt: Scalars['String']['output']
  summary: Scalars['String']['output']
  title: Scalars['String']['output']
  url: Scalars['String']['output']
}

export type CreateSummaryFeedbackMutationVariables = Exact<{
  voting: SummaryFeedbackVoting
  webPageSummaryId: Scalars['String']['input']
  position: Scalars['Int']['input']
  query: Scalars['String']['input']
}>

export type CreateSummaryFeedbackMutation = {
  __typename?: 'Mutation'
  createSummaryFeedback: {
    __typename?: 'SummaryFeedback'
    voting?: SummaryFeedbackVoting | null
    webPageSummaryId: string
    position: number
    query: string
    feedbackDate: string
  }
}

export type InfoCardFragment = {
  __typename?: 'IndexedWebPage'
  title: string
  url: string
  language: string
  publicationState: PublicationState
  keywords: Array<string>
  summary: string
} & { ' $fragmentName'?: 'InfoCardFragment' }

export type GetIndexedWebPageQueryVariables = Exact<{
  query?: InputMaybe<Scalars['String']['input']>
}>

export type GetIndexedWebPageQuery = {
  __typename?: 'Query'
  searchResult: Array<
    { __typename?: 'IndexedWebPage'; id: string } & {
      ' $fragmentRefs'?: { InfoCardFragment: InfoCardFragment }
    }
  >
}

export const InfoCardFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'InfoCard' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'IndexedWebPage' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'language' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publicationState' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<InfoCardFragment, unknown>
export const CreateSummaryFeedbackDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSummaryFeedback' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'voting' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SummaryFeedbackVoting' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'webPageSummaryId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'position' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'query' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createSummaryFeedback' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'voting' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'voting' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'webPageSummaryId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'webPageSummaryId' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'position' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'position' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'query' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'query' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'voting' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'webPageSummaryId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'feedbackDate' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSummaryFeedbackMutation,
  CreateSummaryFeedbackMutationVariables
>
export const GetIndexedWebPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetIndexedWebPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'query' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchResult' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'query' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'query' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'InfoCard' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'InfoCard' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'IndexedWebPage' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'language' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publicationState' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetIndexedWebPageQuery,
  GetIndexedWebPageQueryVariables
>
