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

export enum Feedback {
  Down = 'Down',
  Up = 'Up',
}

export enum PublicationState {
  Draft = 'Draft',
  Published = 'Published',
}

export type Query = {
  __typename?: 'Query'
  allPages: Array<ScrapedWebPage>
  searchResult: Array<TypesenseWebPage>
}

export type QuerySearchResultArgs = {
  language?: InputMaybe<Scalars['String']['input']>
  largeLanguageModel?: InputMaybe<Scalars['String']['input']>
  publicationState?: InputMaybe<PublicationState>
  query?: InputMaybe<Scalars['String']['input']>
}

export type ScrapedWebPage = {
  __typename?: 'ScrapedWebPage'
  locale: Scalars['String']['output']
  originalContent: Scalars['String']['output']
  publishedAt: Scalars['String']['output']
  title: Scalars['String']['output']
  url: Scalars['String']['output']
  webPageSummaries?: Maybe<Array<WebPageSummary>>
}

export type TypesenseWebPage = {
  __typename?: 'TypesenseWebPage'
  id: Scalars['String']['output']
  keywords: Scalars['String']['output']
  language: Scalars['String']['output']
  largeLanguageModel: Scalars['String']['output']
  originalContent: Scalars['String']['output']
  publicationState: PublicationState
  summary: Scalars['String']['output']
  title: Scalars['String']['output']
  url: Scalars['String']['output']
}

export type WebPageSummary = {
  __typename?: 'WebPageSummary'
  feedback?: Maybe<Feedback>
  generatedKeywords: Scalars['String']['output']
  generatedSummary: Scalars['String']['output']
  id: Scalars['String']['output']
  largeLanguageModel: Scalars['String']['output']
}

export type InfoCardFragment = {
  __typename?: 'TypesenseWebPage'
  title: string
  url: string
  language: string
  publicationState: PublicationState
  keywords: string
  summary: string
} & { ' $fragmentName'?: 'InfoCardFragment' }

export type GetScrapedWebPagesQueryVariables = Exact<{ [key: string]: never }>

export type GetScrapedWebPagesQuery = {
  __typename?: 'Query'
  searchResult: Array<
    { __typename?: 'TypesenseWebPage'; id: string } & {
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
        name: { kind: 'Name', value: 'TypesenseWebPage' },
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
export const GetScrapedWebPagesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetScrapedWebPages' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchResult' },
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
        name: { kind: 'Name', value: 'TypesenseWebPage' },
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
  GetScrapedWebPagesQuery,
  GetScrapedWebPagesQueryVariables
>
