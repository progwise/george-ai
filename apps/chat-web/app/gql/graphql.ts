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
  BigInt: { input: any; output: any }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: string; output: string }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: string; output: string }
  Decimal: { input: number; output: number }
}

export type AiAssistant = {
  __typename?: 'AiAssistant'
  assistantType: AiAssistantType
  createdAt: Scalars['DateTime']['output']
  description?: Maybe<Scalars['String']['output']>
  icon?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  ownerId: Scalars['ID']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url?: Maybe<Scalars['String']['output']>
}

export type AiAssistantInput = {
  assistantType: AiAssistantType
  description?: InputMaybe<Scalars['String']['input']>
  icon?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  url?: InputMaybe<Scalars['String']['input']>
}

/** Type of the AiAssistant */
export enum AiAssistantType {
  Chatbot = 'CHATBOT',
  DocumentGenerator = 'DOCUMENT_GENERATOR',
}

export type AiConversation = {
  __typename?: 'AiConversation'
  assistants: Array<AiAssistant>
  createdAt: Scalars['DateTime']['output']
  humans: Array<User>
  id: Scalars['ID']['output']
  messages: Array<AiConversationMessage>
  participants: Array<AiConversationParticipant>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AiConversationCreateInput = {
  assistantIds: Array<Scalars['String']['input']>
  userIds: Array<Scalars['String']['input']>
}

export type AiConversationMessage = {
  __typename?: 'AiConversationMessage'
  content?: Maybe<Scalars['String']['output']>
  conversation?: Maybe<AiConversation>
  conversationId: Scalars['ID']['output']
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  sender: AiConversationParticipant
  senderId: Scalars['ID']['output']
  sequenceNumber: Scalars['BigInt']['output']
  source?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AiConversationMessageInput = {
  content: Scalars['String']['input']
  conversationId: Scalars['String']['input']
  recipientAssistantIds: Array<Scalars['String']['input']>
}

export type AiConversationParticipant = {
  assistant?: Maybe<AiAssistant>
  assistantId?: Maybe<Scalars['ID']['output']>
  conversation?: Maybe<AiConversation>
  conversationId: Scalars['ID']['output']
  id: Scalars['ID']['output']
  isAssistant?: Maybe<Scalars['Boolean']['output']>
  isBot: Scalars['Boolean']['output']
  isHuman?: Maybe<Scalars['Boolean']['output']>
  name?: Maybe<Scalars['String']['output']>
  user?: Maybe<User>
  userId?: Maybe<Scalars['ID']['output']>
}

export type AiLibrary = {
  __typename?: 'AiLibrary'
  createdAt: Scalars['DateTime']['output']
  description?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  libraryType: AiLibraryType
  name: Scalars['String']['output']
  owner?: Maybe<User>
  ownerId: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url?: Maybe<Scalars['String']['output']>
}

export type AiLibraryFile = {
  __typename?: 'AiLibraryFile'
  chunks?: Maybe<Scalars['Int']['output']>
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  libraryId: Scalars['String']['output']
  mimeType: Scalars['String']['output']
  name: Scalars['String']['output']
  originUri?: Maybe<Scalars['String']['output']>
  processedAt?: Maybe<Scalars['DateTime']['output']>
  size?: Maybe<Scalars['Int']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  uploadedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AiLibraryFileInput = {
  libraryId: Scalars['String']['input']
  mimeType: Scalars['String']['input']
  name: Scalars['String']['input']
  originUri: Scalars['String']['input']
}

export type AiLibraryInput = {
  description?: InputMaybe<Scalars['String']['input']>
  icon?: InputMaybe<Scalars['String']['input']>
  libraryType: AiLibraryType
  name: Scalars['String']['input']
  url?: InputMaybe<Scalars['String']['input']>
}

/** Type of the AiLibrary */
export enum AiLibraryType {
  GoogleDrive = 'GOOGLE_DRIVE',
  Pocketbase = 'POCKETBASE',
}

export type AiLibraryUsage = {
  __typename?: 'AiLibraryUsage'
  assistant?: Maybe<AiAssistant>
  assistantId: Scalars['ID']['output']
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  library?: Maybe<AiLibrary>
  libraryId: Scalars['ID']['output']
}

export type AiLibraryUsageInput = {
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
  use: Scalars['Boolean']['input']
}

export type AiLibraryUsageResult = {
  __typename?: 'AiLibraryUsageResult'
  deletedCount?: Maybe<Scalars['Int']['output']>
  usageId?: Maybe<Scalars['String']['output']>
}

export type AssistantParticipant = AiConversationParticipant & {
  __typename?: 'AssistantParticipant'
  assistant?: Maybe<AiAssistant>
  assistantId?: Maybe<Scalars['ID']['output']>
  conversation?: Maybe<AiConversation>
  conversationId: Scalars['ID']['output']
  id: Scalars['ID']['output']
  isAssistant?: Maybe<Scalars['Boolean']['output']>
  isBot: Scalars['Boolean']['output']
  isHuman?: Maybe<Scalars['Boolean']['output']>
  name?: Maybe<Scalars['String']['output']>
  user?: Maybe<User>
  userId?: Maybe<Scalars['ID']['output']>
}

export type ChatAnswer = {
  __typename?: 'ChatAnswer'
  answer?: Maybe<Scalars['String']['output']>
  notEnoughInformation?: Maybe<Scalars['Boolean']['output']>
  sessionId?: Maybe<Scalars['String']['output']>
  source?: Maybe<Scalars['String']['output']>
}

export type HumanParticipant = AiConversationParticipant & {
  __typename?: 'HumanParticipant'
  assistant?: Maybe<AiAssistant>
  assistantId?: Maybe<Scalars['ID']['output']>
  conversation?: Maybe<AiConversation>
  conversationId: Scalars['ID']['output']
  id: Scalars['ID']['output']
  isAssistant?: Maybe<Scalars['Boolean']['output']>
  isBot: Scalars['Boolean']['output']
  isHuman?: Maybe<Scalars['Boolean']['output']>
  name?: Maybe<Scalars['String']['output']>
  user?: Maybe<User>
  userId?: Maybe<Scalars['ID']['output']>
}

export type Mutation = {
  __typename?: 'Mutation'
  addConversationParticipants?: Maybe<Array<AiConversationParticipant>>
  chat?: Maybe<ChatAnswer>
  clearEmbeddedFiles?: Maybe<Scalars['Boolean']['output']>
  createAiAssistant?: Maybe<AiAssistant>
  createAiConversation?: Maybe<AiConversation>
  createAiLibrary?: Maybe<AiLibrary>
  createUser?: Maybe<User>
  deleteAiAssistant?: Maybe<AiAssistant>
  deleteAiConversation?: Maybe<AiConversation>
  deleteMessage?: Maybe<AiConversationMessage>
  dropFile?: Maybe<AiLibraryFile>
  login?: Maybe<User>
  prepareFile?: Maybe<AiLibraryFile>
  processFile?: Maybe<AiLibraryFile>
  removeConversationParticipant?: Maybe<AiConversationParticipant>
  sendMessage: Array<AiConversationMessage>
  updateAiAssistant?: Maybe<AiAssistant>
  updateAiLibrary?: Maybe<AiLibrary>
  updateLibraryUsage?: Maybe<AiLibraryUsageResult>
  updateMessage?: Maybe<AiConversationMessage>
}

export type MutationAddConversationParticipantsArgs = {
  assistantIds?: InputMaybe<Array<Scalars['String']['input']>>
  conversationId: Scalars['String']['input']
  userIds?: InputMaybe<Array<Scalars['String']['input']>>
}

export type MutationChatArgs = {
  question: Scalars['String']['input']
  retrievalFlow?: InputMaybe<RetrievalFlow>
  sessionId?: InputMaybe<Scalars['String']['input']>
}

export type MutationClearEmbeddedFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type MutationCreateAiAssistantArgs = {
  data: AiAssistantInput
  ownerId: Scalars['String']['input']
}

export type MutationCreateAiConversationArgs = {
  data: AiConversationCreateInput
}

export type MutationCreateAiLibraryArgs = {
  data: AiLibraryInput
  ownerId: Scalars['String']['input']
}

export type MutationCreateUserArgs = {
  data: UserInput
  username: Scalars['String']['input']
}

export type MutationDeleteAiAssistantArgs = {
  assistantId: Scalars['String']['input']
}

export type MutationDeleteAiConversationArgs = {
  conversationId: Scalars['String']['input']
}

export type MutationDeleteMessageArgs = {
  messageId: Scalars['String']['input']
}

export type MutationDropFileArgs = {
  fileId: Scalars['String']['input']
}

export type MutationLoginArgs = {
  jwtToken: Scalars['String']['input']
}

export type MutationPrepareFileArgs = {
  data: AiLibraryFileInput
}

export type MutationProcessFileArgs = {
  fileId: Scalars['String']['input']
}

export type MutationRemoveConversationParticipantArgs = {
  id: Scalars['String']['input']
}

export type MutationSendMessageArgs = {
  data: AiConversationMessageInput
  userId: Scalars['String']['input']
}

export type MutationUpdateAiAssistantArgs = {
  data: AiAssistantInput
  id: Scalars['String']['input']
}

export type MutationUpdateAiLibraryArgs = {
  data: AiLibraryInput
  id: Scalars['String']['input']
}

export type MutationUpdateLibraryUsageArgs = {
  data: AiLibraryUsageInput
}

export type MutationUpdateMessageArgs = {
  content: Scalars['String']['input']
  messageId: Scalars['String']['input']
}

export type Query = {
  __typename?: 'Query'
  aiAssistant?: Maybe<AiAssistant>
  aiAssistants: Array<AiAssistant>
  aiConversation?: Maybe<AiConversation>
  aiConversationMessages?: Maybe<Array<AiConversationMessage>>
  aiConversations: Array<AiConversation>
  aiLibraries?: Maybe<Array<AiLibrary>>
  aiLibrary?: Maybe<AiLibrary>
  aiLibraryFiles?: Maybe<Array<AiLibraryFile>>
  aiLibraryUsage?: Maybe<Array<AiLibraryUsage>>
  myConversationUsers: Array<User>
  user?: Maybe<User>
}

export type QueryAiAssistantArgs = {
  id: Scalars['String']['input']
}

export type QueryAiAssistantsArgs = {
  ownerId: Scalars['String']['input']
}

export type QueryAiConversationArgs = {
  conversationId: Scalars['String']['input']
}

export type QueryAiConversationMessagesArgs = {
  conversationId: Scalars['String']['input']
  userId: Scalars['String']['input']
}

export type QueryAiConversationsArgs = {
  userId: Scalars['String']['input']
}

export type QueryAiLibrariesArgs = {
  ownerId: Scalars['String']['input']
}

export type QueryAiLibraryArgs = {
  id: Scalars['String']['input']
}

export type QueryAiLibraryFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type QueryAiLibraryUsageArgs = {
  assistantId?: InputMaybe<Scalars['String']['input']>
  libraryId?: InputMaybe<Scalars['String']['input']>
}

export type QueryMyConversationUsersArgs = {
  userId: Scalars['String']['input']
}

export type QueryUserArgs = {
  email: Scalars['String']['input']
}

export enum RetrievalFlow {
  OnlyLocal = 'OnlyLocal',
  OnlyWeb = 'OnlyWeb',
  Parallel = 'Parallel',
  Sequential = 'Sequential',
}

export type User = {
  __typename?: 'User'
  createdAt: Scalars['DateTime']['output']
  email: Scalars['String']['output']
  family_name?: Maybe<Scalars['String']['output']>
  given_name?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  lastLogin?: Maybe<Scalars['DateTime']['output']>
  name?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  username: Scalars['String']['output']
}

export type UserInput = {
  email: Scalars['String']['input']
  family_name?: InputMaybe<Scalars['String']['input']>
  given_name?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
}

/** A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations. */
export type __Schema = {
  __typename?: '__Schema'
  description?: Maybe<Scalars['String']['output']>
  /** A list of all types supported by this server. */
  types: Array<__Type>
  /** The type that query operations will be rooted at. */
  queryType: __Type
  /** If this server supports mutation, the type that mutation operations will be rooted at. */
  mutationType?: Maybe<__Type>
  /** If this server support subscription, the type that subscription operations will be rooted at. */
  subscriptionType?: Maybe<__Type>
  /** A list of all directives supported by this server. */
  directives: Array<__Directive>
}

/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __Type = {
  __typename?: '__Type'
  kind: __TypeKind
  name?: Maybe<Scalars['String']['output']>
  description?: Maybe<Scalars['String']['output']>
  specifiedByURL?: Maybe<Scalars['String']['output']>
  fields?: Maybe<Array<__Field>>
  interfaces?: Maybe<Array<__Type>>
  possibleTypes?: Maybe<Array<__Type>>
  enumValues?: Maybe<Array<__EnumValue>>
  inputFields?: Maybe<Array<__InputValue>>
  ofType?: Maybe<__Type>
  isOneOf?: Maybe<Scalars['Boolean']['output']>
}

/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeFieldsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']['input']>
}

/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeEnumValuesArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']['input']>
}

/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeInputFieldsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']['input']>
}

/** An enum describing what kind of type a given `__Type` is. */
export enum __TypeKind {
  /** Indicates this type is a scalar. */
  Scalar = 'SCALAR',
  /** Indicates this type is an object. `fields` and `interfaces` are valid fields. */
  Object = 'OBJECT',
  /** Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields. */
  Interface = 'INTERFACE',
  /** Indicates this type is a union. `possibleTypes` is a valid field. */
  Union = 'UNION',
  /** Indicates this type is an enum. `enumValues` is a valid field. */
  Enum = 'ENUM',
  /** Indicates this type is an input object. `inputFields` is a valid field. */
  InputObject = 'INPUT_OBJECT',
  /** Indicates this type is a list. `ofType` is a valid field. */
  List = 'LIST',
  /** Indicates this type is a non-null. `ofType` is a valid field. */
  NonNull = 'NON_NULL',
}

/** Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type. */
export type __Field = {
  __typename?: '__Field'
  name: Scalars['String']['output']
  description?: Maybe<Scalars['String']['output']>
  args: Array<__InputValue>
  type: __Type
  isDeprecated: Scalars['Boolean']['output']
  deprecationReason?: Maybe<Scalars['String']['output']>
}

/** Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type. */
export type __FieldArgsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']['input']>
}

/** Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value. */
export type __InputValue = {
  __typename?: '__InputValue'
  name: Scalars['String']['output']
  description?: Maybe<Scalars['String']['output']>
  type: __Type
  /** A GraphQL-formatted string representing the default value for this input value. */
  defaultValue?: Maybe<Scalars['String']['output']>
  isDeprecated: Scalars['Boolean']['output']
  deprecationReason?: Maybe<Scalars['String']['output']>
}

/** One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string. */
export type __EnumValue = {
  __typename?: '__EnumValue'
  name: Scalars['String']['output']
  description?: Maybe<Scalars['String']['output']>
  isDeprecated: Scalars['Boolean']['output']
  deprecationReason?: Maybe<Scalars['String']['output']>
}

/**
 * A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.
 *
 * In some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.
 */
export type __Directive = {
  __typename?: '__Directive'
  name: Scalars['String']['output']
  description?: Maybe<Scalars['String']['output']>
  isRepeatable: Scalars['Boolean']['output']
  locations: Array<__DirectiveLocation>
  args: Array<__InputValue>
}

/**
 * A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.
 *
 * In some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.
 */
export type __DirectiveArgsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']['input']>
}

/** A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies. */
export enum __DirectiveLocation {
  /** Location adjacent to a query operation. */
  Query = 'QUERY',
  /** Location adjacent to a mutation operation. */
  Mutation = 'MUTATION',
  /** Location adjacent to a subscription operation. */
  Subscription = 'SUBSCRIPTION',
  /** Location adjacent to a field. */
  Field = 'FIELD',
  /** Location adjacent to a fragment definition. */
  FragmentDefinition = 'FRAGMENT_DEFINITION',
  /** Location adjacent to a fragment spread. */
  FragmentSpread = 'FRAGMENT_SPREAD',
  /** Location adjacent to an inline fragment. */
  InlineFragment = 'INLINE_FRAGMENT',
  /** Location adjacent to a variable definition. */
  VariableDefinition = 'VARIABLE_DEFINITION',
  /** Location adjacent to a schema definition. */
  Schema = 'SCHEMA',
  /** Location adjacent to a scalar definition. */
  Scalar = 'SCALAR',
  /** Location adjacent to an object type definition. */
  Object = 'OBJECT',
  /** Location adjacent to a field definition. */
  FieldDefinition = 'FIELD_DEFINITION',
  /** Location adjacent to an argument definition. */
  ArgumentDefinition = 'ARGUMENT_DEFINITION',
  /** Location adjacent to an interface definition. */
  Interface = 'INTERFACE',
  /** Location adjacent to a union definition. */
  Union = 'UNION',
  /** Location adjacent to an enum definition. */
  Enum = 'ENUM',
  /** Location adjacent to an enum value definition. */
  EnumValue = 'ENUM_VALUE',
  /** Location adjacent to an input object type definition. */
  InputObject = 'INPUT_OBJECT',
  /** Location adjacent to an input object field definition. */
  InputFieldDefinition = 'INPUT_FIELD_DEFINITION',
}

export type LoginMutationVariables = Exact<{
  jwtToken: Scalars['String']['input']
}>

export type LoginMutation = {
  __typename?: 'Mutation'
  login?: {
    __typename?: 'User'
    id: string
    username: string
    email: string
    name?: string | null
    given_name?: string | null
    family_name?: string | null
    createdAt: string
  } | null
}

export type DeleteAiAssistantMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DeleteAiAssistantMutation = {
  __typename?: 'Mutation'
  deleteAiAssistant?: { __typename?: 'AiAssistant'; id: string } | null
}

export type AssistantLibrariesQueryVariables = Exact<{
  assistantId: Scalars['String']['input']
  ownerId: Scalars['String']['input']
}>

export type AssistantLibrariesQuery = {
  __typename?: 'Query'
  aiLibraryUsage?: Array<{
    __typename?: 'AiLibraryUsage'
    id: string
    libraryId: string
  }> | null
  aiLibraries?: Array<{
    __typename?: 'AiLibrary'
    id: string
    name: string
  }> | null
}

export type UpdateLibraryUsageMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
  use: Scalars['Boolean']['input']
}>

export type UpdateLibraryUsageMutation = {
  __typename?: 'Mutation'
  updateLibraryUsage?: {
    __typename?: 'AiLibraryUsageResult'
    usageId?: string | null
    deletedCount?: number | null
  } | null
}

export type ConversationForm_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  assistants: Array<{ __typename?: 'AiAssistant'; id: string; name: string }>
} & { ' $fragmentName'?: 'ConversationForm_ConversationFragment' }

export type ConversationHistory_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  messages: Array<{
    __typename?: 'AiConversationMessage'
    id: string
    sequenceNumber: any
    content?: string | null
    source?: string | null
    createdAt: string
    sender:
      | {
          __typename?: 'AssistantParticipant'
          id: string
          name?: string | null
          isBot: boolean
          assistantId?: string | null
        }
      | {
          __typename?: 'HumanParticipant'
          id: string
          name?: string | null
          isBot: boolean
          assistantId?: string | null
        }
  }>
} & { ' $fragmentName'?: 'ConversationHistory_ConversationFragment' }

export type ConversationParticipants_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  participants: Array<
    | {
        __typename?: 'AssistantParticipant'
        id: string
        name?: string | null
        userId?: string | null
        assistantId?: string | null
      }
    | {
        __typename?: 'HumanParticipant'
        id: string
        name?: string | null
        userId?: string | null
        assistantId?: string | null
      }
  >
} & { ' $fragmentName'?: 'ConversationParticipants_ConversationFragment' }

export type ConversationParticipants_HumanParticipationCandidatesFragment = {
  __typename?: 'User'
  id: string
  name?: string | null
  username: string
} & {
  ' $fragmentName'?: 'ConversationParticipants_HumanParticipationCandidatesFragment'
}

export type ConversationParticipants_AssistantParticipationCandidatesFragment =
  { __typename?: 'AiAssistant'; id: string; name: string } & {
    ' $fragmentName'?: 'ConversationParticipants_AssistantParticipationCandidatesFragment'
  }

export type ConversationSelector_ConversationsFragment = {
  __typename?: 'AiConversation'
  id: string
  createdAt: string
  assistants: Array<{ __typename?: 'AiAssistant'; id: string; name: string }>
} & { ' $fragmentName'?: 'ConversationSelector_ConversationsFragment' }

export type ConversationDelete_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  createdAt: string
  assistants: Array<{ __typename?: 'AiAssistant'; name: string }>
} & { ' $fragmentName'?: 'ConversationDelete_ConversationFragment' }

export type ConversationNew_HumanParticipationCandidatesFragment = {
  __typename?: 'User'
  id: string
  name?: string | null
  username: string
} & {
  ' $fragmentName'?: 'ConversationNew_HumanParticipationCandidatesFragment'
}

export type ConversationNew_AssistantParticipationCandidatesFragment = {
  __typename?: 'AiAssistant'
  id: string
  name: string
} & {
  ' $fragmentName'?: 'ConversationNew_AssistantParticipationCandidatesFragment'
}

export type ClearEmbeddingsMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type ClearEmbeddingsMutation = {
  __typename?: 'Mutation'
  clearEmbeddedFiles?: boolean | null
}

export type DropFileMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DropFileMutation = {
  __typename?: 'Mutation'
  dropFile?: { __typename?: 'AiLibraryFile'; id: string } | null
}

export type ReProcessFileMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type ReProcessFileMutation = {
  __typename?: 'Mutation'
  processFile?: {
    __typename?: 'AiLibraryFile'
    id: string
    chunks?: number | null
    size?: number | null
    uploadedAt?: string | null
    processedAt?: string | null
  } | null
}

export type EmbeddingsTableQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type EmbeddingsTableQuery = {
  __typename?: 'Query'
  aiLibraryFiles?: Array<{
    __typename?: 'AiLibraryFile'
    id: string
    name: string
    originUri?: string | null
    mimeType: string
    size?: number | null
    chunks?: number | null
    uploadedAt?: string | null
    processedAt?: string | null
  }> | null
}

export type PrepareFileMutationVariables = Exact<{
  file: AiLibraryFileInput
}>

export type PrepareFileMutation = {
  __typename?: 'Mutation'
  prepareFile?: { __typename?: 'AiLibraryFile'; id: string } | null
}

export type ProcessFileMutationVariables = Exact<{
  fileId: Scalars['String']['input']
}>

export type ProcessFileMutation = {
  __typename?: 'Mutation'
  processFile?: {
    __typename?: 'AiLibraryFile'
    id: string
    chunks?: number | null
    size?: number | null
    uploadedAt?: string | null
    processedAt?: string | null
  } | null
}

export type AiAssistantEditQueryVariables = Exact<{
  id: Scalars['String']['input']
  ownerId: Scalars['String']['input']
}>

export type AiAssistantEditQuery = {
  __typename?: 'Query'
  aiAssistant?: {
    __typename?: 'AiAssistant'
    id: string
    name: string
    description?: string | null
    icon?: string | null
    createdAt: string
    ownerId: string
    assistantType: AiAssistantType
    url?: string | null
  } | null
  aiAssistants: Array<{ __typename?: 'AiAssistant'; id: string; name: string }>
}

export type ChangeAiAssistantMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiAssistantInput
}>

export type ChangeAiAssistantMutation = {
  __typename?: 'Mutation'
  updateAiAssistant?: {
    __typename?: 'AiAssistant'
    id: string
    name: string
  } | null
}

export type CreateAiAssistantMutationVariables = Exact<{
  ownerId: Scalars['String']['input']
  data: AiAssistantInput
}>

export type CreateAiAssistantMutation = {
  __typename?: 'Mutation'
  createAiAssistant?: {
    __typename?: 'AiAssistant'
    id: string
    name: string
  } | null
}

export type GetUserConversationsQueryVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type GetUserConversationsQuery = {
  __typename?: 'Query'
  aiConversations: Array<
    { __typename?: 'AiConversation'; id: string } & {
      ' $fragmentRefs'?: {
        ConversationSelector_ConversationsFragment: ConversationSelector_ConversationsFragment
      }
    }
  >
}

export type GetConversationQueryVariables = Exact<{
  conversationId: Scalars['String']['input']
}>

export type GetConversationQuery = {
  __typename?: 'Query'
  aiConversation?:
    | ({ __typename?: 'AiConversation' } & {
        ' $fragmentRefs'?: {
          ConversationForm_ConversationFragment: ConversationForm_ConversationFragment
          ConversationParticipants_ConversationFragment: ConversationParticipants_ConversationFragment
          ConversationDelete_ConversationFragment: ConversationDelete_ConversationFragment
          ConversationHistory_ConversationFragment: ConversationHistory_ConversationFragment
        }
      })
    | null
}

export type GetAssignableUsersQueryVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type GetAssignableUsersQuery = {
  __typename?: 'Query'
  myConversationUsers: Array<
    { __typename?: 'User' } & {
      ' $fragmentRefs'?: {
        ConversationNew_HumanParticipationCandidatesFragment: ConversationNew_HumanParticipationCandidatesFragment
        ConversationParticipants_HumanParticipationCandidatesFragment: ConversationParticipants_HumanParticipationCandidatesFragment
      }
    }
  >
}

export type GetAssignableAssistantsQueryVariables = Exact<{
  ownerId: Scalars['String']['input']
}>

export type GetAssignableAssistantsQuery = {
  __typename?: 'Query'
  aiAssistants: Array<
    { __typename?: 'AiAssistant' } & {
      ' $fragmentRefs'?: {
        ConversationNew_AssistantParticipationCandidatesFragment: ConversationNew_AssistantParticipationCandidatesFragment
        ConversationParticipants_AssistantParticipationCandidatesFragment: ConversationParticipants_AssistantParticipationCandidatesFragment
      }
    }
  >
}

export type AiLibraryEditQueryVariables = Exact<{
  id: Scalars['String']['input']
  ownerId: Scalars['String']['input']
}>

export type AiLibraryEditQuery = {
  __typename?: 'Query'
  aiLibrary?: {
    __typename?: 'AiLibrary'
    id: string
    name: string
    description?: string | null
    createdAt: string
    ownerId: string
    libraryType: AiLibraryType
    url?: string | null
  } | null
  aiLibraries?: Array<{
    __typename?: 'AiLibrary'
    id: string
    name: string
  }> | null
}

export type ChangeAiLibraryMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiLibraryInput
}>

export type ChangeAiLibraryMutation = {
  __typename?: 'Mutation'
  updateAiLibrary?: {
    __typename?: 'AiLibrary'
    id: string
    name: string
  } | null
}

export type AiLibrariesQueryVariables = Exact<{
  ownerId: Scalars['String']['input']
}>

export type AiLibrariesQuery = {
  __typename?: 'Query'
  aiLibraries?: Array<{
    __typename?: 'AiLibrary'
    id: string
    name: string
    libraryType: AiLibraryType
    createdAt: string
    updatedAt?: string | null
    owner?: { __typename?: 'User'; id: string; name?: string | null } | null
  }> | null
}

export type CreateAiLibraryMutationVariables = Exact<{
  ownerId: Scalars['String']['input']
  data: AiLibraryInput
}>

export type CreateAiLibraryMutation = {
  __typename?: 'Mutation'
  createAiLibrary?: {
    __typename?: 'AiLibrary'
    id: string
    name: string
  } | null
}

export type AiAssistantCardsQueryVariables = Exact<{
  ownerId: Scalars['String']['input']
}>

export type AiAssistantCardsQuery = {
  __typename?: 'Query'
  aiAssistants: Array<{
    __typename?: 'AiAssistant'
    id: string
    name: string
    description?: string | null
    icon?: string | null
    assistantType: AiAssistantType
    createdAt: string
    ownerId: string
  }>
}

export type IntrospectionQueryQueryVariables = Exact<{ [key: string]: never }>

export type IntrospectionQueryQuery = {
  __typename?: 'Query'
  __schema: {
    __typename?: '__Schema'
    description?: string | null
    queryType: { __typename?: '__Type'; name?: string | null }
    mutationType?: { __typename?: '__Type'; name?: string | null } | null
    subscriptionType?: { __typename?: '__Type'; name?: string | null } | null
    types: Array<
      { __typename?: '__Type' } & {
        ' $fragmentRefs'?: { FullTypeFragment: FullTypeFragment }
      }
    >
    directives: Array<{
      __typename?: '__Directive'
      name: string
      description?: string | null
      locations: Array<__DirectiveLocation>
      args: Array<
        { __typename?: '__InputValue' } & {
          ' $fragmentRefs'?: { InputValueFragment: InputValueFragment }
        }
      >
    }>
  }
}

export type FullTypeFragment = {
  __typename?: '__Type'
  kind: __TypeKind
  name?: string | null
  description?: string | null
  fields?: Array<{
    __typename?: '__Field'
    name: string
    description?: string | null
    isDeprecated: boolean
    deprecationReason?: string | null
    args: Array<
      { __typename?: '__InputValue' } & {
        ' $fragmentRefs'?: { InputValueFragment: InputValueFragment }
      }
    >
    type: { __typename?: '__Type' } & {
      ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment }
    }
  }> | null
  inputFields?: Array<
    { __typename?: '__InputValue' } & {
      ' $fragmentRefs'?: { InputValueFragment: InputValueFragment }
    }
  > | null
  interfaces?: Array<
    { __typename?: '__Type' } & {
      ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment }
    }
  > | null
  enumValues?: Array<{
    __typename?: '__EnumValue'
    name: string
    description?: string | null
    isDeprecated: boolean
    deprecationReason?: string | null
  }> | null
  possibleTypes?: Array<
    { __typename?: '__Type' } & {
      ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment }
    }
  > | null
} & { ' $fragmentName'?: 'FullTypeFragment' }

export type InputValueFragment = {
  __typename?: '__InputValue'
  name: string
  description?: string | null
  defaultValue?: string | null
  type: { __typename?: '__Type' } & {
    ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment }
  }
} & { ' $fragmentName'?: 'InputValueFragment' }

export type TypeRefFragment = {
  __typename?: '__Type'
  kind: __TypeKind
  name?: string | null
  ofType?: {
    __typename?: '__Type'
    kind: __TypeKind
    name?: string | null
    ofType?: {
      __typename?: '__Type'
      kind: __TypeKind
      name?: string | null
      ofType?: {
        __typename?: '__Type'
        kind: __TypeKind
        name?: string | null
        ofType?: {
          __typename?: '__Type'
          kind: __TypeKind
          name?: string | null
          ofType?: {
            __typename?: '__Type'
            kind: __TypeKind
            name?: string | null
            ofType?: {
              __typename?: '__Type'
              kind: __TypeKind
              name?: string | null
              ofType?: {
                __typename?: '__Type'
                kind: __TypeKind
                name?: string | null
                ofType?: {
                  __typename?: '__Type'
                  kind: __TypeKind
                  name?: string | null
                  ofType?: {
                    __typename?: '__Type'
                    kind: __TypeKind
                    name?: string | null
                  } | null
                } | null
              } | null
            } | null
          } | null
        } | null
      } | null
    } | null
  } | null
} & { ' $fragmentName'?: 'TypeRefFragment' }

export type SendMessageMutationVariables = Exact<{
  userId: Scalars['String']['input']
  data: AiConversationMessageInput
}>

export type SendMessageMutation = {
  __typename?: 'Mutation'
  sendMessage: Array<{
    __typename?: 'AiConversationMessage'
    id: string
    createdAt: string
  }>
}

export type CreateConversationMutationVariables = Exact<{
  data: AiConversationCreateInput
}>

export type CreateConversationMutation = {
  __typename?: 'Mutation'
  createAiConversation?: { __typename?: 'AiConversation'; id: string } | null
}

export type DeleteConversationMutationVariables = Exact<{
  conversationId: Scalars['String']['input']
}>

export type DeleteConversationMutation = {
  __typename?: 'Mutation'
  deleteAiConversation?: { __typename?: 'AiConversation'; id: string } | null
}

export type AddParticipantMutationVariables = Exact<{
  conversationId: Scalars['String']['input']
  userIds?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >
  assistantIds?: InputMaybe<
    Array<Scalars['String']['input']> | Scalars['String']['input']
  >
}>

export type AddParticipantMutation = {
  __typename?: 'Mutation'
  addConversationParticipants?: Array<
    | { __typename?: 'AssistantParticipant'; id: string }
    | { __typename?: 'HumanParticipant'; id: string }
  > | null
}

export type RemoveParticipantMutationVariables = Exact<{
  participantId: Scalars['String']['input']
}>

export type RemoveParticipantMutation = {
  __typename?: 'Mutation'
  removeConversationParticipant?:
    | { __typename?: 'AssistantParticipant'; id: string }
    | { __typename?: 'HumanParticipant'; id: string }
    | null
}

export type MyConversationUsersQueryVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type MyConversationUsersQuery = {
  __typename?: 'Query'
  myConversationUsers: Array<{
    __typename?: 'User'
    id: string
    username: string
    name?: string | null
    createdAt: string
    email: string
  }>
}

export const ConversationForm_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationForm_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationForm_ConversationFragment, unknown>
export const ConversationHistory_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationHistory_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'messages' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sequenceNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sender' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isBot' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'assistantId' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationHistory_ConversationFragment, unknown>
export const ConversationParticipants_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ConversationParticipants_ConversationFragment,
  unknown
>
export const ConversationParticipants_HumanParticipationCandidatesFragmentDoc =
  {
    kind: 'Document',
    definitions: [
      {
        kind: 'FragmentDefinition',
        name: {
          kind: 'Name',
          value: 'ConversationParticipants_HumanParticipationCandidates',
        },
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: 'User' },
        },
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
            { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          ],
        },
      },
    ],
  } as unknown as DocumentNode<
    ConversationParticipants_HumanParticipationCandidatesFragment,
    unknown
  >
export const ConversationParticipants_AssistantParticipationCandidatesFragmentDoc =
  {
    kind: 'Document',
    definitions: [
      {
        kind: 'FragmentDefinition',
        name: {
          kind: 'Name',
          value: 'ConversationParticipants_AssistantParticipationCandidates',
        },
        typeCondition: {
          kind: 'NamedType',
          name: { kind: 'Name', value: 'AiAssistant' },
        },
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          ],
        },
      },
    ],
  } as unknown as DocumentNode<
    ConversationParticipants_AssistantParticipationCandidatesFragment,
    unknown
  >
export const ConversationSelector_ConversationsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationSelector_conversations' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ConversationSelector_ConversationsFragment,
  unknown
>
export const ConversationDelete_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationDelete_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationDelete_ConversationFragment, unknown>
export const ConversationNew_HumanParticipationCandidatesFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: {
        kind: 'Name',
        value: 'ConversationNew_HumanParticipationCandidates',
      },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'User' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ConversationNew_HumanParticipationCandidatesFragment,
  unknown
>
export const ConversationNew_AssistantParticipationCandidatesFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: {
        kind: 'Name',
        value: 'ConversationNew_AssistantParticipationCandidates',
      },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiAssistant' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ConversationNew_AssistantParticipationCandidatesFragment,
  unknown
>
export const TypeRefFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TypeRef' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__Type' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ofType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ofType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'ofType' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'kind' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'ofType' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'kind' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ofType' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'kind' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'ofType',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'kind',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'ofType',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'kind',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'name',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'ofType',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'kind',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'ofType',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'kind',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'name',
                                                                  },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TypeRefFragment, unknown>
export const InputValueFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'InputValue' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__InputValue' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'type' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TypeRef' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'defaultValue' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TypeRef' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__Type' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ofType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ofType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'ofType' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'kind' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'ofType' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'kind' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ofType' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'kind' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'ofType',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'kind',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'ofType',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'kind',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'name',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'ofType',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'kind',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'ofType',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'kind',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'name',
                                                                  },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<InputValueFragment, unknown>
export const FullTypeFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FullType' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__Type' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'includeDeprecated' },
                value: { kind: 'BooleanValue', value: true },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'args' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'InputValue' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'type' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'TypeRef' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isDeprecated' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deprecationReason' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'inputFields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'InputValue' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'interfaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TypeRef' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'enumValues' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'includeDeprecated' },
                value: { kind: 'BooleanValue', value: true },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isDeprecated' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deprecationReason' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'possibleTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TypeRef' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TypeRef' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__Type' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ofType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ofType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'ofType' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'kind' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'ofType' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'kind' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ofType' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'kind' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'ofType',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'kind',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'ofType',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'kind',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'name',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'ofType',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'kind',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'ofType',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'kind',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'name',
                                                                  },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'InputValue' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__InputValue' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'type' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TypeRef' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'defaultValue' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FullTypeFragment, unknown>
export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'login' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'jwtToken' },
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
            name: { kind: 'Name', value: 'login' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'jwtToken' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'jwtToken' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>
export const DeleteAiAssistantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteAiAssistant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
            name: { kind: 'Name', value: 'deleteAiAssistant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
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
  DeleteAiAssistantMutation,
  DeleteAiAssistantMutationVariables
>
export const AssistantLibrariesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'assistantLibraries' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'assistantId' },
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
            name: { kind: 'Name', value: 'ownerId' },
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
            name: { kind: 'Name', value: 'aiLibraryUsage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'assistantId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssistantLibrariesQuery,
  AssistantLibrariesQueryVariables
>
export const UpdateLibraryUsageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateLibraryUsage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'assistantId' },
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
            name: { kind: 'Name', value: 'libraryId' },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'use' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Boolean' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateLibraryUsage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'assistantId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'assistantId' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'libraryId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'libraryId' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'use' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'use' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'usageId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deletedCount' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateLibraryUsageMutation,
  UpdateLibraryUsageMutationVariables
>
export const ClearEmbeddingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'clearEmbeddings' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'libraryId' },
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
            name: { kind: 'Name', value: 'clearEmbeddedFiles' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'libraryId' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ClearEmbeddingsMutation,
  ClearEmbeddingsMutationVariables
>
export const DropFileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'dropFile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
            name: { kind: 'Name', value: 'dropFile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
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
} as unknown as DocumentNode<DropFileMutation, DropFileMutationVariables>
export const ReProcessFileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'reProcessFile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
            name: { kind: 'Name', value: 'processFile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ReProcessFileMutation,
  ReProcessFileMutationVariables
>
export const EmbeddingsTableDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'EmbeddingsTable' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'libraryId' },
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
            name: { kind: 'Name', value: 'aiLibraryFiles' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'libraryId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'originUri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mimeType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EmbeddingsTableQuery,
  EmbeddingsTableQueryVariables
>
export const PrepareFileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'prepareFile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'file' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AiLibraryFileInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'prepareFile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'file' },
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
} as unknown as DocumentNode<PrepareFileMutation, PrepareFileMutationVariables>
export const ProcessFileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'processFile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'fileId' },
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
            name: { kind: 'Name', value: 'processFile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'fileId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProcessFileMutation, ProcessFileMutationVariables>
export const AiAssistantEditDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiAssistantEdit' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
            name: { kind: 'Name', value: 'ownerId' },
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
            name: { kind: 'Name', value: 'aiAssistant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'icon' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'assistantType' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiAssistants' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AiAssistantEditQuery,
  AiAssistantEditQueryVariables
>
export const ChangeAiAssistantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'changeAiAssistant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AiAssistantInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAiAssistant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangeAiAssistantMutation,
  ChangeAiAssistantMutationVariables
>
export const CreateAiAssistantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createAiAssistant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'ownerId' },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AiAssistantInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAiAssistant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateAiAssistantMutation,
  CreateAiAssistantMutationVariables
>
export const GetUserConversationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getUserConversations' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'userId' },
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
            name: { kind: 'Name', value: 'aiConversations' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'userId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: 'ConversationSelector_conversations',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationSelector_conversations' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetUserConversationsQuery,
  GetUserConversationsQueryVariables
>
export const GetConversationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getConversation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'conversationId' },
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
            name: { kind: 'Name', value: 'aiConversation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'conversationId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'conversationId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: 'ConversationForm_conversation',
                  },
                },
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: 'ConversationParticipants_conversation',
                  },
                },
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: 'ConversationDelete_conversation',
                  },
                },
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: 'ConversationHistory_conversation',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationForm_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationDelete_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationHistory_conversation' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiConversation' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'messages' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sequenceNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sender' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isBot' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'assistantId' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetConversationQuery,
  GetConversationQueryVariables
>
export const GetAssignableUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAssignableUsers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'userId' },
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
            name: { kind: 'Name', value: 'myConversationUsers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'userId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: 'ConversationNew_HumanParticipationCandidates',
                  },
                },
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value:
                      'ConversationParticipants_HumanParticipationCandidates',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: {
        kind: 'Name',
        value: 'ConversationNew_HumanParticipationCandidates',
      },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'User' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: {
        kind: 'Name',
        value: 'ConversationParticipants_HumanParticipationCandidates',
      },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'User' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAssignableUsersQuery,
  GetAssignableUsersQueryVariables
>
export const GetAssignableAssistantsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getAssignableAssistants' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'ownerId' },
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
            name: { kind: 'Name', value: 'aiAssistants' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value: 'ConversationNew_AssistantParticipationCandidates',
                  },
                },
                {
                  kind: 'FragmentSpread',
                  name: {
                    kind: 'Name',
                    value:
                      'ConversationParticipants_AssistantParticipationCandidates',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: {
        kind: 'Name',
        value: 'ConversationNew_AssistantParticipationCandidates',
      },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiAssistant' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: {
        kind: 'Name',
        value: 'ConversationParticipants_AssistantParticipationCandidates',
      },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AiAssistant' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAssignableAssistantsQuery,
  GetAssignableAssistantsQueryVariables
>
export const AiLibraryEditDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiLibraryEdit' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
            name: { kind: 'Name', value: 'ownerId' },
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
            name: { kind: 'Name', value: 'aiLibrary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryEditQuery, AiLibraryEditQueryVariables>
export const ChangeAiLibraryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'changeAiLibrary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AiLibraryInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAiLibrary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangeAiLibraryMutation,
  ChangeAiLibraryMutationVariables
>
export const AiLibrariesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiLibraries' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'ownerId' },
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
            name: { kind: 'Name', value: 'aiLibraries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryType' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibrariesQuery, AiLibrariesQueryVariables>
export const CreateAiLibraryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createAiLibrary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'ownerId' },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AiLibraryInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAiLibrary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateAiLibraryMutation,
  CreateAiLibraryMutationVariables
>
export const AiAssistantCardsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiAssistantCards' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'ownerId' },
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
            name: { kind: 'Name', value: 'aiAssistants' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ownerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ownerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'icon' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'assistantType' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AiAssistantCardsQuery,
  AiAssistantCardsQueryVariables
>
export const IntrospectionQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'IntrospectionQuery' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: '__schema' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'queryType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'mutationType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'subscriptionType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'types' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'FullType' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'directives' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'locations' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'args' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'InputValue' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TypeRef' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__Type' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ofType' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ofType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'ofType' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'kind' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'ofType' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'kind' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ofType' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'kind' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'name' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'ofType',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'kind',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'name',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'ofType',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'kind',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'name',
                                                      },
                                                    },
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'ofType',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'kind',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'name',
                                                            },
                                                          },
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value: 'ofType',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'kind',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'name',
                                                                  },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'InputValue' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__InputValue' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'type' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TypeRef' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'defaultValue' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FullType' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: '__Type' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'kind' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'includeDeprecated' },
                value: { kind: 'BooleanValue', value: true },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'args' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'InputValue' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'type' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'TypeRef' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isDeprecated' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deprecationReason' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'inputFields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'InputValue' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'interfaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TypeRef' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'enumValues' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'includeDeprecated' },
                value: { kind: 'BooleanValue', value: true },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isDeprecated' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deprecationReason' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'possibleTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TypeRef' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IntrospectionQueryQuery,
  IntrospectionQueryQueryVariables
>
export const SendMessageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'sendMessage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'userId' },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AiConversationMessageInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sendMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'userId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>
export const CreateConversationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createConversation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AiConversationCreateInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAiConversation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
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
  CreateConversationMutation,
  CreateConversationMutationVariables
>
export const DeleteConversationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteConversation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'conversationId' },
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
            name: { kind: 'Name', value: 'deleteAiConversation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'conversationId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'conversationId' },
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
  DeleteConversationMutation,
  DeleteConversationMutationVariables
>
export const AddParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addParticipant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'conversationId' },
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
            name: { kind: 'Name', value: 'userIds' },
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
            name: { kind: 'Name', value: 'assistantIds' },
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
            name: { kind: 'Name', value: 'addConversationParticipants' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'conversationId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'conversationId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userIds' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'userIds' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantIds' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'assistantIds' },
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
  AddParticipantMutation,
  AddParticipantMutationVariables
>
export const RemoveParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeParticipant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'participantId' },
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
            name: { kind: 'Name', value: 'removeConversationParticipant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'participantId' },
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
  RemoveParticipantMutation,
  RemoveParticipantMutationVariables
>
export const MyConversationUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'myConversationUsers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'userId' },
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
            name: { kind: 'Name', value: 'myConversationUsers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'userId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MyConversationUsersQuery,
  MyConversationUsersQueryVariables
>
