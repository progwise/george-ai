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
  language?: InputMaybe<Array<Scalars['String']['input']>>
  largeLanguageModel?: InputMaybe<Array<Scalars['String']['input']>>
  publicationState?: InputMaybe<Array<Scalars['String']['input']>>
  query?: InputMaybe<Scalars['String']['input']>
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

export type GetAllSummariesQueryVariables = Exact<{ [key: string]: never }>

export type GetAllSummariesQuery = {
  __typename?: 'Query'
  searchResult: Array<{
    __typename?: 'IndexedWebPage'
    language: string
    largeLanguageModel: string
  }>
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
  language?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >
  publicationState?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >
  largeLanguageModel?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >
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
export const GetAllSummariesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllSummaries' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchResult' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'language' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'largeLanguageModel' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllSummariesQuery,
  GetAllSummariesQueryVariables
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'language' },
          },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'String' },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'publicationState' },
          },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'String' },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'largeLanguageModel' },
          },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'String' },
              },
            },
          },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'language' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'language' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'publicationState' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'publicationState' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'largeLanguageModel' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'largeLanguageModel' },
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
