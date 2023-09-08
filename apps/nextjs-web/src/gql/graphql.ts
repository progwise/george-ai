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

export type CreateSummaryFeedbackInput = {
  position: Scalars['Int']['input']
  query: Scalars['String']['input']
  voting: SummaryFeedbackVoting
  webPageSummaryId: Scalars['String']['input']
}

export type DeleteSummaryFeedback = {
  __typename?: 'DeleteSummaryFeedback'
  feedbackDate: Scalars['String']['output']
  id: Scalars['String']['output']
  position: Scalars['Int']['output']
  query: Scalars['String']['output']
  voting?: Maybe<SummaryFeedbackVoting>
  webPageSummaryId: Scalars['String']['output']
}

export type DeleteSummaryFeedbackInput = {
  summaryFeedbackId: Scalars['String']['input']
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
  createSummaryFeedbackMutation: CreateSummaryFeedback
  deleteSummaryFeedbackMutation: DeleteSummaryFeedback
  updateSummaryFeedbackMutation: UpdateSummaryFeedback
}

export type MutationCreateSummaryFeedbackMutationArgs = {
  data: CreateSummaryFeedbackInput
}

export type MutationDeleteSummaryFeedbackMutationArgs = {
  data: DeleteSummaryFeedbackInput
}

export type MutationUpdateSummaryFeedbackMutationArgs = {
  data: UpdateSummaryFeedbackInput
}

export enum PublicationState {
  Draft = 'Draft',
  Published = 'Published',
}

export type Query = {
  __typename?: 'Query'
  allSummaries: Array<WebPageSummary>
  searchFilters: SearchFilters
  searchResult: Array<IndexedWebPage>
  summaryFeedbacksById: Array<SummaryFeedback>
}

export type QuerySearchResultArgs = {
  language?: Array<Scalars['String']['input']>
  largeLanguageModel?: Array<Scalars['String']['input']>
  publicationState?: Array<Scalars['String']['input']>
  query?: Scalars['String']['input']
}

export type QuerySummaryFeedbacksByIdArgs = {
  data: SummaryFeedbackInput
}

export type SummaryFeedback = {
  __typename?: 'SummaryFeedback'
  id: Scalars['String']['output']
  webPageSummaryId: Scalars['String']['output']
}

export type SummaryFeedbackInput = {
  webPageSummaryId: Scalars['String']['input']
}

export enum SummaryFeedbackVoting {
  Down = 'Down',
  Up = 'Up',
}

export type UpdateSummaryFeedback = {
  __typename?: 'UpdateSummaryFeedback'
  feedbackDate: Scalars['String']['output']
  id: Scalars['String']['output']
  position: Scalars['Int']['output']
  query: Scalars['String']['output']
  voting?: Maybe<SummaryFeedbackVoting>
  webPageSummaryId: Scalars['String']['output']
}

export type UpdateSummaryFeedbackInput = {
  position: Scalars['Int']['input']
  query: Scalars['String']['input']
  summaryFeedbackId: Scalars['String']['input']
  voting: SummaryFeedbackVoting
  webPageSummaryId: Scalars['String']['input']
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

export type CreateSummaryFeedback = {
  __typename?: 'createSummaryFeedback'
  feedbackDate: Scalars['String']['output']
  id: Scalars['String']['output']
  position: Scalars['Int']['output']
  query: Scalars['String']['output']
  voting?: Maybe<SummaryFeedbackVoting>
  webPageSummaryId: Scalars['String']['output']
}

export type SearchFilters = {
  __typename?: 'searchFilters'
  language: Array<Scalars['String']['output']>
  largeLanguageModel: Array<Scalars['String']['output']>
  publicationState: Array<Scalars['String']['output']>
}

export type GetLangAndLlmQueryVariables = Exact<{ [key: string]: never }>

export type GetLangAndLlmQuery = {
  __typename?: 'Query'
  searchFilters: {
    __typename?: 'searchFilters'
    language: Array<string>
    largeLanguageModel: Array<string>
    publicationState: Array<string>
  }
}

export type SummaryFeedbacksByIdQueryVariables = Exact<{
  webPageSummaryId: Scalars['String']['input']
}>

export type SummaryFeedbacksByIdQuery = {
  __typename?: 'Query'
  summaryFeedbacksById: Array<{
    __typename?: 'SummaryFeedback'
    id: string
    webPageSummaryId: string
  }>
}

export type DeleteSummaryFeedbackMutationMutationVariables = Exact<{
  summaryFeedbackId: Scalars['String']['input']
}>

export type DeleteSummaryFeedbackMutationMutation = {
  __typename?: 'Mutation'
  deleteSummaryFeedbackMutation: {
    __typename?: 'DeleteSummaryFeedback'
    id: string
  }
}

export type UpdateSummaryFeedbackMutationMutationVariables = Exact<{
  summaryFeedbackId: Scalars['String']['input']
  position: Scalars['Int']['input']
  voting: SummaryFeedbackVoting
  webPageSummaryId: Scalars['String']['input']
  query: Scalars['String']['input']
}>

export type UpdateSummaryFeedbackMutationMutation = {
  __typename?: 'Mutation'
  updateSummaryFeedbackMutation: {
    __typename?: 'UpdateSummaryFeedback'
    feedbackDate: string
    id: string
    position: number
    voting?: SummaryFeedbackVoting | null
    webPageSummaryId: string
    query: string
  }
}

export type CreateSummaryFeedbackMutationVariables = Exact<{
  position: Scalars['Int']['input']
  voting: SummaryFeedbackVoting
  webPageSummaryId: Scalars['String']['input']
  query: Scalars['String']['input']
}>

export type CreateSummaryFeedbackMutation = {
  __typename?: 'Mutation'
  createSummaryFeedbackMutation: {
    __typename?: 'createSummaryFeedback'
    feedbackDate: string
    id: string
    position: number
    query: string
    voting?: SummaryFeedbackVoting | null
    webPageSummaryId: string
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
export const GetLangAndLlmDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLangAndLlm' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchFilters' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'language' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'largeLanguageModel' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'publicationState' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetLangAndLlmQuery, GetLangAndLlmQueryVariables>
export const SummaryFeedbacksByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SummaryFeedbacksById' },
      variableDefinitions: [
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
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'summaryFeedbacksById' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'webPageSummaryId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'webPageSummaryId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'webPageSummaryId' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SummaryFeedbacksByIdQuery,
  SummaryFeedbacksByIdQueryVariables
>
export const DeleteSummaryFeedbackMutationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteSummaryFeedbackMutation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'summaryFeedbackId' },
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
            name: { kind: 'Name', value: 'deleteSummaryFeedbackMutation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'summaryFeedbackId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'summaryFeedbackId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSummaryFeedbackMutationMutation,
  DeleteSummaryFeedbackMutationMutationVariables
>
export const UpdateSummaryFeedbackMutationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateSummaryFeedbackMutation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'summaryFeedbackId' },
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
            name: { kind: 'Name', value: 'updateSummaryFeedbackMutation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'summaryFeedbackId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'summaryFeedbackId' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'feedbackDate' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'voting' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'webPageSummaryId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSummaryFeedbackMutationMutation,
  UpdateSummaryFeedbackMutationMutationVariables
>
export const CreateSummaryFeedbackDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createSummaryFeedback' },
      variableDefinitions: [
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
            name: { kind: 'Name', value: 'createSummaryFeedbackMutation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'feedbackDate' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
                { kind: 'Field', name: { kind: 'Name', value: 'voting' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'webPageSummaryId' },
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
