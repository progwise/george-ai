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

export type CreateProposalSummaryInput = {
  proposalSummary: Scalars['String']['input']
  summaryId: Scalars['String']['input']
}

export type CreateSummaryFeedbackInput = {
  query: Scalars['String']['input']
  selectedSummaryIndex: Scalars['Int']['input']
  voting: SummaryFeedbackVoting
  webPageSummaryId: Scalars['String']['input']
}

export type Mutation = {
  __typename?: 'Mutation'
  createProposalSummary: ProposalSummaryReference
  createSummaryFeedback: SummaryFeedbackReference
}

export type MutationCreateProposalSummaryArgs = {
  data: CreateProposalSummaryInput
}

export type MutationCreateSummaryFeedbackArgs = {
  data: CreateSummaryFeedbackInput
}

export type ProposalSummaryReference = {
  __typename?: 'ProposalSummaryReference'
  id: Scalars['String']['output']
}

export enum PublicationState {
  Draft = 'Draft',
  Published = 'Published',
}

export type Query = {
  __typename?: 'Query'
  filters: Filters
  summaries: Array<Summaries>
}

export type QuerySummariesArgs = {
  keywords?: Array<Scalars['String']['input']>
  language?: Array<Scalars['String']['input']>
  largeLanguageModel?: Array<Scalars['String']['input']>
  publicationState?: Array<Scalars['String']['input']>
  query?: Scalars['String']['input']
}

export type SummaryFeedbackReference = {
  __typename?: 'SummaryFeedbackReference'
  id: Scalars['String']['output']
}

export enum SummaryFeedbackVoting {
  Down = 'down',
  Up = 'up',
}

export type Filters = {
  __typename?: 'filters'
  language: Array<Scalars['String']['output']>
  largeLanguageModel: Array<Scalars['String']['output']>
  publicationState: Array<Scalars['String']['output']>
}

export type Summaries = {
  __typename?: 'summaries'
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

export type GetFiltersQueryVariables = Exact<{ [key: string]: never }>

export type GetFiltersQuery = {
  __typename?: 'Query'
  filters: {
    __typename?: 'filters'
    language: Array<string>
    largeLanguageModel: Array<string>
    publicationState: Array<string>
  }
}

export type CreateSummaryFeedbackMutationVariables = Exact<{
  infoCardIndex: Scalars['Int']['input']
  voting: SummaryFeedbackVoting
  summaryId: Scalars['String']['input']
  query: Scalars['String']['input']
}>

export type CreateSummaryFeedbackMutation = {
  __typename?: 'Mutation'
  createSummaryFeedback: { __typename?: 'SummaryFeedbackReference'; id: string }
}

export type InfoCardFragment = {
  __typename?: 'summaries'
  id: string
  title: string
  url: string
  language: string
  publicationState: PublicationState
  keywords: Array<string>
  summary: string
  largeLanguageModel: string
} & { ' $fragmentName'?: 'InfoCardFragment' }

export type CreateProposalSummaryMutationVariables = Exact<{
  proposalSummary: Scalars['String']['input']
  summaryId: Scalars['String']['input']
}>

export type CreateProposalSummaryMutation = {
  __typename?: 'Mutation'
  createProposalSummary: { __typename?: 'ProposalSummaryReference'; id: string }
}

export type GetSummariesQueryVariables = Exact<{
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
  keywords?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >
}>

export type GetSummariesQuery = {
  __typename?: 'Query'
  summaries: Array<
    { __typename?: 'summaries'; id: string } & {
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
        name: { kind: 'Name', value: 'summaries' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'language' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publicationState' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'largeLanguageModel' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<InfoCardFragment, unknown>
export const GetFiltersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFilters' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'filters' },
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
} as unknown as DocumentNode<GetFiltersQuery, GetFiltersQueryVariables>
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
            name: { kind: 'Name', value: 'infoCardIndex' },
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
            name: { kind: 'Name', value: 'summaryId' },
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
                      name: { kind: 'Name', value: 'selectedSummaryIndex' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'infoCardIndex' },
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
                        name: { kind: 'Name', value: 'summaryId' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
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
export const CreateProposalSummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateProposalSummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'proposalSummary' },
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
            name: { kind: 'Name', value: 'summaryId' },
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
            name: { kind: 'Name', value: 'createProposalSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'proposalSummary' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'proposalSummary' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'summaryId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'summaryId' },
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
  CreateProposalSummaryMutation,
  CreateProposalSummaryMutationVariables
>
export const GetSummariesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSummaries' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'keywords' },
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
            name: { kind: 'Name', value: 'summaries' },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'keywords' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'keywords' },
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
        name: { kind: 'Name', value: 'summaries' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'language' } },
          { kind: 'Field', name: { kind: 'Name', value: 'publicationState' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'summary' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'largeLanguageModel' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSummariesQuery, GetSummariesQueryVariables>
