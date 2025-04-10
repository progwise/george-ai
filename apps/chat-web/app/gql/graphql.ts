/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
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
  baseCases: Array<AiAssistantBaseCase>
  createdAt: Scalars['DateTime']['output']
  description?: Maybe<Scalars['String']['output']>
  iconUrl?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  languageModel?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  ownerId: Scalars['ID']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url?: Maybe<Scalars['String']['output']>
}

export type AiAssistantBaseCase = {
  __typename?: 'AiAssistantBaseCase'
  assistant?: Maybe<AiAssistant>
  condition?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  id?: Maybe<Scalars['ID']['output']>
  instruction?: Maybe<Scalars['String']['output']>
  sequence?: Maybe<Scalars['Float']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AiAssistantInput = {
  description?: InputMaybe<Scalars['String']['input']>
  icon?: InputMaybe<Scalars['String']['input']>
  languageModel?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  url?: InputMaybe<Scalars['String']['input']>
}

export type AiBaseCaseInputType = {
  condition?: InputMaybe<Scalars['String']['input']>
  id?: InputMaybe<Scalars['String']['input']>
  instruction?: InputMaybe<Scalars['String']['input']>
  sequence?: InputMaybe<Scalars['Float']['input']>
}

export type AiConversation = {
  __typename?: 'AiConversation'
  assistants: Array<AiAssistant>
  createdAt: Scalars['DateTime']['output']
  humans: Array<User>
  id: Scalars['ID']['output']
  messages: Array<AiConversationMessage>
  owner?: Maybe<User>
  ownerId: Scalars['String']['output']
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
  hidden?: Maybe<Scalars['Boolean']['output']>
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
  crawlers: Array<AiLibraryCrawler>
  createdAt: Scalars['DateTime']['output']
  description?: Maybe<Scalars['String']['output']>
  files?: Maybe<Array<AiLibraryFile>>
  filesCount?: Maybe<Scalars['Int']['output']>
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  owner?: Maybe<User>
  ownerId: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url?: Maybe<Scalars['String']['output']>
}

export type AiLibraryCrawler = {
  __typename?: 'AiLibraryCrawler'
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  lastRun?: Maybe<Scalars['DateTime']['output']>
  maxDepth: Scalars['Int']['output']
  maxPages: Scalars['Int']['output']
  updatedAt: Scalars['DateTime']['output']
  url: Scalars['String']['output']
}

export type AiLibraryFile = {
  __typename?: 'AiLibraryFile'
  chunks?: Maybe<Scalars['Int']['output']>
  createdAt: Scalars['DateTime']['output']
  dropError?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  libraryId: Scalars['String']['output']
  mimeType: Scalars['String']['output']
  name: Scalars['String']['output']
  originUri?: Maybe<Scalars['String']['output']>
  processedAt?: Maybe<Scalars['DateTime']['output']>
  processingEndedAt?: Maybe<Scalars['DateTime']['output']>
  processingErrorAt?: Maybe<Scalars['DateTime']['output']>
  processingErrorMessage?: Maybe<Scalars['String']['output']>
  processingStartedAt?: Maybe<Scalars['DateTime']['output']>
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
  name: Scalars['String']['input']
  url?: InputMaybe<Scalars['String']['input']>
}

export type AiLibraryUsage = {
  __typename?: 'AiLibraryUsage'
  assistant: AiAssistant
  assistantId: Scalars['ID']['output']
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  library: AiLibrary
  libraryId: Scalars['ID']['output']
  updatedAt: Scalars['DateTime']['output']
  usedFor?: Maybe<Scalars['String']['output']>
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
  addLibraryUsage?: Maybe<AiLibraryUsage>
  cancelFileUpload?: Maybe<Scalars['Boolean']['output']>
  chat?: Maybe<ChatAnswer>
  clearEmbeddedFiles?: Maybe<Scalars['Boolean']['output']>
  confirmUserProfile?: Maybe<UserProfile>
  createAiAssistant?: Maybe<AiAssistant>
  createAiConversation?: Maybe<AiConversation>
  createAiLibrary?: Maybe<AiLibrary>
  createAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  createUser?: Maybe<User>
  createUserProfile?: Maybe<UserProfile>
  deleteAiAssistant?: Maybe<AiAssistant>
  deleteAiConversation?: Maybe<AiConversation>
  deleteAiLibrary?: Maybe<AiLibrary>
  deleteMessage?: Maybe<AiConversationMessage>
  dropFile?: Maybe<AiLibraryFile>
  dropFiles?: Maybe<Array<AiLibraryFile>>
  hideMessage?: Maybe<AiConversationMessage>
  leaveAiConversation?: Maybe<AiConversationParticipant>
  login?: Maybe<User>
  prepareFile?: Maybe<AiLibraryFile>
  processFile?: Maybe<AiLibraryFile>
  reProcessFile?: Maybe<AiLibraryFile>
  removeConversationParticipant?: Maybe<AiConversationParticipant>
  removeLibraryUsage?: Maybe<AiLibraryUsage>
  removeUserProfile?: Maybe<UserProfile>
  runAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  sendConfirmationMail?: Maybe<Scalars['Boolean']['output']>
  sendMessage: Array<AiConversationMessage>
  unhideMessage?: Maybe<AiConversationMessage>
  updateAiAssistant?: Maybe<AiAssistant>
  updateAiLibrary?: Maybe<AiLibrary>
  updateLibraryUsage?: Maybe<AiLibraryUsage>
  updateMessage?: Maybe<AiConversationMessage>
  updateUserProfile?: Maybe<UserProfile>
  upsertAiBaseCases?: Maybe<Array<AiAssistantBaseCase>>
}

export type MutationAddConversationParticipantsArgs = {
  assistantIds?: InputMaybe<Array<Scalars['String']['input']>>
  conversationId: Scalars['String']['input']
  userIds?: InputMaybe<Array<Scalars['String']['input']>>
}

export type MutationAddLibraryUsageArgs = {
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type MutationCancelFileUploadArgs = {
  fileId: Scalars['String']['input']
}

export type MutationChatArgs = {
  question: Scalars['String']['input']
  retrievalFlow?: InputMaybe<RetrievalFlow>
  sessionId?: InputMaybe<Scalars['String']['input']>
}

export type MutationClearEmbeddedFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type MutationConfirmUserProfileArgs = {
  profileId: Scalars['String']['input']
}

export type MutationCreateAiAssistantArgs = {
  name: Scalars['String']['input']
  ownerId: Scalars['String']['input']
}

export type MutationCreateAiConversationArgs = {
  data: AiConversationCreateInput
  ownerId: Scalars['String']['input']
}

export type MutationCreateAiLibraryArgs = {
  data: AiLibraryInput
  ownerId: Scalars['String']['input']
}

export type MutationCreateAiLibraryCrawlerArgs = {
  libraryId: Scalars['String']['input']
  maxDepth: Scalars['Int']['input']
  maxPages: Scalars['Int']['input']
  url: Scalars['String']['input']
}

export type MutationCreateUserArgs = {
  data: UserInput
  username: Scalars['String']['input']
}

export type MutationCreateUserProfileArgs = {
  userId: Scalars['String']['input']
}

export type MutationDeleteAiAssistantArgs = {
  assistantId: Scalars['String']['input']
}

export type MutationDeleteAiConversationArgs = {
  conversationId: Scalars['String']['input']
}

export type MutationDeleteAiLibraryArgs = {
  id: Scalars['String']['input']
}

export type MutationDeleteMessageArgs = {
  messageId: Scalars['String']['input']
}

export type MutationDropFileArgs = {
  fileId: Scalars['String']['input']
}

export type MutationDropFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type MutationHideMessageArgs = {
  messageId: Scalars['String']['input']
}

export type MutationLeaveAiConversationArgs = {
  id: Scalars['String']['input']
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

export type MutationReProcessFileArgs = {
  fileId: Scalars['String']['input']
}

export type MutationRemoveConversationParticipantArgs = {
  id: Scalars['String']['input']
}

export type MutationRemoveLibraryUsageArgs = {
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type MutationRemoveUserProfileArgs = {
  userId: Scalars['String']['input']
}

export type MutationRunAiLibraryCrawlerArgs = {
  id: Scalars['String']['input']
}

export type MutationSendConfirmationMailArgs = {
  confirmationUrl: Scalars['String']['input']
  userId: Scalars['String']['input']
}

export type MutationSendMessageArgs = {
  data: AiConversationMessageInput
  userId: Scalars['String']['input']
}

export type MutationUnhideMessageArgs = {
  messageId: Scalars['String']['input']
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
  id: Scalars['String']['input']
  usedFor?: InputMaybe<Scalars['String']['input']>
}

export type MutationUpdateMessageArgs = {
  content: Scalars['String']['input']
  messageId: Scalars['String']['input']
}

export type MutationUpdateUserProfileArgs = {
  input: UserProfileInput
  userId: Scalars['String']['input']
}

export type MutationUpsertAiBaseCasesArgs = {
  assistantId: Scalars['String']['input']
  baseCases: Array<AiBaseCaseInputType>
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
  userProfile?: Maybe<UserProfile>
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

export type QueryUserProfileArgs = {
  userId: Scalars['String']['input']
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
  profile?: Maybe<UserProfile>
  registered?: Maybe<Scalars['Boolean']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  username: Scalars['String']['output']
}

export type UserInput = {
  email: Scalars['String']['input']
  family_name?: InputMaybe<Scalars['String']['input']>
  given_name?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
}

export type UserProfile = {
  __typename?: 'UserProfile'
  business?: Maybe<Scalars['String']['output']>
  confirmationDate?: Maybe<Scalars['DateTime']['output']>
  createdAt: Scalars['DateTime']['output']
  email: Scalars['String']['output']
  expiresAt?: Maybe<Scalars['DateTime']['output']>
  firstName?: Maybe<Scalars['String']['output']>
  freeMessages: Scalars['Int']['output']
  freeStorage: Scalars['Int']['output']
  id: Scalars['ID']['output']
  lastName?: Maybe<Scalars['String']['output']>
  position?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  usedMessages?: Maybe<Scalars['Int']['output']>
  usedStorage?: Maybe<Scalars['Int']['output']>
  userId: Scalars['ID']['output']
}

export type UserProfileInput = {
  business?: InputMaybe<Scalars['String']['input']>
  email: Scalars['String']['input']
  firstName?: InputMaybe<Scalars['String']['input']>
  lastName?: InputMaybe<Scalars['String']['input']>
  position?: InputMaybe<Scalars['String']['input']>
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

export type UpsertAiBaseCasesMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
  baseCases: Array<AiBaseCaseInputType> | AiBaseCaseInputType
}>

export type UpsertAiBaseCasesMutation = {
  __typename?: 'Mutation'
  upsertAiBaseCases?: Array<{
    __typename?: 'AiAssistantBaseCase'
    id?: string | null
    sequence?: number | null
    condition?: string | null
    instruction?: string | null
  }> | null
}

export type AssistantBasecaseForm_AssistantFragment = {
  __typename?: 'AiAssistant'
  id: string
  baseCases: Array<{
    __typename?: 'AiAssistantBaseCase'
    id?: string | null
    sequence?: number | null
    condition?: string | null
    instruction?: string | null
  }>
} & { ' $fragmentName'?: 'AssistantBasecaseForm_AssistantFragment' }

export type AssistantCard_AssistantFragment = ({
  __typename?: 'AiAssistant'
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
} & { ' $fragmentRefs'?: { AssistantDelete_AssistantFragment: AssistantDelete_AssistantFragment } }) & {
  ' $fragmentName'?: 'AssistantCard_AssistantFragment'
}

export type DeleteAiAssistantMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
}>

export type DeleteAiAssistantMutation = {
  __typename?: 'Mutation'
  deleteAiAssistant?: { __typename?: 'AiAssistant'; id: string; name: string } | null
}

export type AssistantDelete_AssistantFragment = { __typename?: 'AiAssistant'; id: string; name: string } & {
  ' $fragmentName'?: 'AssistantDelete_AssistantFragment'
}

export type AssistantForm_AssistantFragment = {
  __typename?: 'AiAssistant'
  id: string
  name: string
  iconUrl?: string | null
  description?: string | null
  ownerId: string
  languageModel?: string | null
} & { ' $fragmentName'?: 'AssistantForm_AssistantFragment' }

export type UpdateAssistantMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiAssistantInput
}>

export type UpdateAssistantMutation = {
  __typename?: 'Mutation'
  updateAiAssistant?: { __typename?: 'AiAssistant'; id: string } | null
}

export type AssistantIcon_AssistantFragmentFragment = {
  __typename?: 'AiAssistant'
  id: string
  name: string
  updatedAt?: string | null
  iconUrl?: string | null
} & { ' $fragmentName'?: 'AssistantIcon_AssistantFragmentFragment' }

export type AssistantLibraries_AssistantFragment = { __typename?: 'AiAssistant'; id: string } & {
  ' $fragmentName'?: 'AssistantLibraries_AssistantFragment'
}

export type AssistantLibraries_LibraryFragment = { __typename?: 'AiLibrary'; id: string; name: string } & {
  ' $fragmentName'?: 'AssistantLibraries_LibraryFragment'
}

export type AssistantLibraries_LibraryUsageFragment = {
  __typename?: 'AiLibraryUsage'
  id: string
  assistantId: string
  libraryId: string
  usedFor?: string | null
  library: { __typename?: 'AiLibrary'; id: string; name: string }
} & { ' $fragmentName'?: 'AssistantLibraries_LibraryUsageFragment' }

export type AddLibraryUsageMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}>

export type AddLibraryUsageMutation = {
  __typename?: 'Mutation'
  addLibraryUsage?: { __typename?: 'AiLibraryUsage'; id: string } | null
}

export type RemoveLibraryUsageMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}>

export type RemoveLibraryUsageMutation = {
  __typename?: 'Mutation'
  removeLibraryUsage?: { __typename?: 'AiLibraryUsage'; id: string } | null
}

export type UpdateLibraryUsageMutationVariables = Exact<{
  id: Scalars['String']['input']
  usedFor: Scalars['String']['input']
}>

export type UpdateLibraryUsageMutation = {
  __typename?: 'Mutation'
  updateLibraryUsage?: { __typename?: 'AiLibraryUsage'; id: string } | null
}

export type CreateAiAssistantMutationVariables = Exact<{
  ownerId: Scalars['String']['input']
  name: Scalars['String']['input']
}>

export type CreateAiAssistantMutation = {
  __typename?: 'Mutation'
  createAiAssistant?: { __typename?: 'AiAssistant'; id: string; name: string } | null
}

export type AssistantSelector_AssistantFragment = { __typename?: 'AiAssistant'; id: string; name: string } & {
  ' $fragmentName'?: 'AssistantSelector_AssistantFragment'
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
    hidden?: boolean | null
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

export type HideMessageMutationVariables = Exact<{
  messageId: Scalars['String']['input']
}>

export type HideMessageMutation = {
  __typename?: 'Mutation'
  hideMessage?: { __typename?: 'AiConversationMessage'; id: string; hidden?: boolean | null } | null
}

export type UnhideMessageMutationVariables = Exact<{
  messageId: Scalars['String']['input']
}>

export type UnhideMessageMutation = {
  __typename?: 'Mutation'
  unhideMessage?: { __typename?: 'AiConversationMessage'; id: string; hidden?: boolean | null } | null
}

export type ConversationParticipants_ConversationFragment = ({
  __typename?: 'AiConversation'
  id: string
  ownerId: string
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
} & { ' $fragmentRefs'?: { ParticipantsDialog_ConversationFragment: ParticipantsDialog_ConversationFragment } }) & {
  ' $fragmentName'?: 'ConversationParticipants_ConversationFragment'
}

export type ConversationParticipants_AssistantFragment = ({ __typename?: 'AiAssistant' } & {
  ' $fragmentRefs'?: { ParticipantsDialog_AssistantFragment: ParticipantsDialog_AssistantFragment }
}) & { ' $fragmentName'?: 'ConversationParticipants_AssistantFragment' }

export type ConversationParticipants_HumanFragment = ({ __typename?: 'User' } & {
  ' $fragmentRefs'?: { ParticipantsDialog_HumanFragment: ParticipantsDialog_HumanFragment }
}) & { ' $fragmentName'?: 'ConversationParticipants_HumanFragment' }

export type ConversationSelector_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  createdAt: string
  assistants: Array<{ __typename?: 'AiAssistant'; id: string; name: string }>
} & { ' $fragmentName'?: 'ConversationSelector_ConversationFragment' }

export type ConversationDelete_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  assistants: Array<{ __typename?: 'AiAssistant'; name: string }>
  participants: Array<
    | { __typename?: 'AssistantParticipant'; id: string; userId?: string | null }
    | { __typename?: 'HumanParticipant'; id: string; userId?: string | null }
  >
} & { ' $fragmentName'?: 'ConversationDelete_ConversationFragment' }

export type NewConversationSelector_AssistantFragment = ({ __typename?: 'AiAssistant' } & {
  ' $fragmentRefs'?: { ParticipantsDialog_AssistantFragment: ParticipantsDialog_AssistantFragment }
}) & { ' $fragmentName'?: 'NewConversationSelector_AssistantFragment' }

export type NewConversationSelector_HumanFragment = ({ __typename?: 'User' } & {
  ' $fragmentRefs'?: { ParticipantsDialog_HumanFragment: ParticipantsDialog_HumanFragment }
}) & { ' $fragmentName'?: 'NewConversationSelector_HumanFragment' }

export type ParticipantsDialog_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  participants: Array<
    | { __typename?: 'AssistantParticipant'; id: string; userId?: string | null; assistantId?: string | null }
    | { __typename?: 'HumanParticipant'; id: string; userId?: string | null; assistantId?: string | null }
  >
} & { ' $fragmentName'?: 'ParticipantsDialog_ConversationFragment' }

export type ParticipantsDialog_AssistantFragment = { __typename?: 'AiAssistant'; id: string; name: string } & {
  ' $fragmentName'?: 'ParticipantsDialog_AssistantFragment'
}

export type ParticipantsDialog_HumanFragment = { __typename?: 'User'; id: string; username: string } & {
  ' $fragmentName'?: 'ParticipantsDialog_HumanFragment'
}

export type CreateAiLibraryCrawlerMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
  maxDepth: Scalars['Int']['input']
  maxPages: Scalars['Int']['input']
  url: Scalars['String']['input']
}>

export type CreateAiLibraryCrawlerMutation = {
  __typename?: 'Mutation'
  createAiLibraryCrawler?: { __typename?: 'AiLibraryCrawler'; id: string } | null
}

export type CrawlerTableQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type CrawlerTableQuery = {
  __typename?: 'Query'
  aiLibrary?: {
    __typename?: 'AiLibrary'
    crawlers: Array<{
      __typename?: 'AiLibraryCrawler'
      id: string
      url: string
      maxDepth: number
      maxPages: number
      lastRun?: string | null
    }>
  } | null
}

export type DropFilesMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type DropFilesMutation = {
  __typename?: 'Mutation'
  dropFiles?: Array<{ __typename?: 'AiLibraryFile'; id: string; libraryId: string }> | null
}

export type DeleteAiLibraryMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DeleteAiLibraryMutation = {
  __typename?: 'Mutation'
  deleteAiLibrary?: { __typename?: 'AiLibrary'; id: string } | null
}

export type DeleteLibraryDialog_LibraryFragment = {
  __typename?: 'AiLibrary'
  id: string
  name: string
  ownerId: string
  filesCount?: number | null
  createdAt: string
  description?: string | null
  url?: string | null
} & { ' $fragmentName'?: 'DeleteLibraryDialog_LibraryFragment' }

export type PrepareDesktopFileMutationVariables = Exact<{
  file: AiLibraryFileInput
}>

export type PrepareDesktopFileMutation = {
  __typename?: 'Mutation'
  prepareFile?: { __typename?: 'AiLibraryFile'; id: string } | null
}

export type CancelFileUploadMutationVariables = Exact<{
  fileId: Scalars['String']['input']
}>

export type CancelFileUploadMutation = { __typename?: 'Mutation'; cancelFileUpload?: boolean | null }

export type ClearEmbeddingsMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type ClearEmbeddingsMutation = { __typename?: 'Mutation'; clearEmbeddedFiles?: boolean | null }

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
    processingErrorMessage?: string | null
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
    processingErrorMessage?: string | null
    dropError?: string | null
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

export type LibraryFormFragmentFragment = {
  __typename?: 'AiLibrary'
  id: string
  name: string
  description?: string | null
} & { ' $fragmentName'?: 'LibraryFormFragmentFragment' }

export type CreateAiLibraryMutationVariables = Exact<{
  ownerId: Scalars['String']['input']
  data: AiLibraryInput
}>

export type CreateAiLibraryMutation = {
  __typename?: 'Mutation'
  createAiLibrary?: { __typename?: 'AiLibrary'; id: string; name: string } | null
}

export type UserProfileForm_UserProfileFragment = {
  __typename?: 'UserProfile'
  id: string
  userId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  freeMessages: number
  usedMessages?: number | null
  freeStorage: number
  usedStorage?: number | null
  createdAt: string
  updatedAt?: string | null
  confirmationDate?: string | null
  expiresAt?: string | null
  business?: string | null
  position?: string | null
} & { ' $fragmentName'?: 'UserProfileForm_UserProfileFragment' }

export type SaveUserProfileMutationVariables = Exact<{
  userId: Scalars['String']['input']
  userProfileInput: UserProfileInput
}>

export type SaveUserProfileMutation = {
  __typename?: 'Mutation'
  updateUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type AiAssistantDetailsQueryVariables = Exact<{
  id: Scalars['String']['input']
  ownerId: Scalars['String']['input']
}>

export type AiAssistantDetailsQuery = {
  __typename?: 'Query'
  aiAssistant?:
    | ({ __typename?: 'AiAssistant' } & {
        ' $fragmentRefs'?: {
          AssistantForm_AssistantFragment: AssistantForm_AssistantFragment
          AssistantSelector_AssistantFragment: AssistantSelector_AssistantFragment
          AssistantLibraries_AssistantFragment: AssistantLibraries_AssistantFragment
          AssistantBasecaseForm_AssistantFragment: AssistantBasecaseForm_AssistantFragment
        }
      })
    | null
  aiAssistants: Array<
    { __typename?: 'AiAssistant' } & {
      ' $fragmentRefs'?: { AssistantSelector_AssistantFragment: AssistantSelector_AssistantFragment }
    }
  >
  aiLibraryUsage?: Array<
    { __typename?: 'AiLibraryUsage' } & {
      ' $fragmentRefs'?: { AssistantLibraries_LibraryUsageFragment: AssistantLibraries_LibraryUsageFragment }
    }
  > | null
  aiLibraries?: Array<
    { __typename?: 'AiLibrary' } & {
      ' $fragmentRefs'?: { AssistantLibraries_LibraryFragment: AssistantLibraries_LibraryFragment }
    }
  > | null
}

export type AiAssistantCardsQueryVariables = Exact<{
  ownerId: Scalars['String']['input']
}>

export type AiAssistantCardsQuery = {
  __typename?: 'Query'
  aiAssistants: Array<
    { __typename?: 'AiAssistant'; id: string } & {
      ' $fragmentRefs'?: { AssistantCard_AssistantFragment: AssistantCard_AssistantFragment }
    }
  >
}

export type GetUserConversationsQueryVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type GetUserConversationsQuery = {
  __typename?: 'Query'
  aiConversations: Array<
    { __typename?: 'AiConversation'; id: string } & {
      ' $fragmentRefs'?: { ConversationSelector_ConversationFragment: ConversationSelector_ConversationFragment }
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
          ConversationParticipants_ConversationFragment: ConversationParticipants_ConversationFragment
          ConversationDelete_ConversationFragment: ConversationDelete_ConversationFragment
          ConversationHistory_ConversationFragment: ConversationHistory_ConversationFragment
          ConversationForm_ConversationFragment: ConversationForm_ConversationFragment
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
        NewConversationSelector_HumanFragment: NewConversationSelector_HumanFragment
        ConversationParticipants_HumanFragment: ConversationParticipants_HumanFragment
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
        NewConversationSelector_AssistantFragment: NewConversationSelector_AssistantFragment
        ConversationParticipants_AssistantFragment: ConversationParticipants_AssistantFragment
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
  aiLibrary?:
    | ({ __typename?: 'AiLibrary'; id: string; name: string } & {
        ' $fragmentRefs'?: {
          LibraryFormFragmentFragment: LibraryFormFragmentFragment
          DeleteLibraryDialog_LibraryFragment: DeleteLibraryDialog_LibraryFragment
        }
      })
    | null
  aiLibraries?: Array<{ __typename?: 'AiLibrary'; id: string; name: string }> | null
}

export type ChangeAiLibraryMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiLibraryInput
}>

export type ChangeAiLibraryMutation = {
  __typename?: 'Mutation'
  updateAiLibrary?: { __typename?: 'AiLibrary'; id: string; name: string } | null
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
    createdAt: string
    updatedAt?: string | null
    owner?: { __typename?: 'User'; id: string; name?: string | null } | null
  }> | null
}

export type UserProfileQueryVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type UserProfileQuery = {
  __typename?: 'Query'
  userProfile?:
    | ({ __typename?: 'UserProfile'; id: string } & {
        ' $fragmentRefs'?: { UserProfileForm_UserProfileFragment: UserProfileForm_UserProfileFragment }
      })
    | null
}

export type CreateUserProfileMutationVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type CreateUserProfileMutation = {
  __typename?: 'Mutation'
  createUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type RemoveUserProfileMutationVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type RemoveUserProfileMutation = {
  __typename?: 'Mutation'
  removeUserProfile?: { __typename?: 'UserProfile'; id: string } | null
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
    types: Array<{ __typename?: '__Type' } & { ' $fragmentRefs'?: { FullTypeFragment: FullTypeFragment } }>
    directives: Array<{
      __typename?: '__Directive'
      name: string
      description?: string | null
      locations: Array<__DirectiveLocation>
      args: Array<{ __typename?: '__InputValue' } & { ' $fragmentRefs'?: { InputValueFragment: InputValueFragment } }>
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
    args: Array<{ __typename?: '__InputValue' } & { ' $fragmentRefs'?: { InputValueFragment: InputValueFragment } }>
    type: { __typename?: '__Type' } & { ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment } }
  }> | null
  inputFields?: Array<
    { __typename?: '__InputValue' } & { ' $fragmentRefs'?: { InputValueFragment: InputValueFragment } }
  > | null
  interfaces?: Array<{ __typename?: '__Type' } & { ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment } }> | null
  enumValues?: Array<{
    __typename?: '__EnumValue'
    name: string
    description?: string | null
    isDeprecated: boolean
    deprecationReason?: string | null
  }> | null
  possibleTypes?: Array<{ __typename?: '__Type' } & { ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment } }> | null
} & { ' $fragmentName'?: 'FullTypeFragment' }

export type InputValueFragment = {
  __typename?: '__InputValue'
  name: string
  description?: string | null
  defaultValue?: string | null
  type: { __typename?: '__Type' } & { ' $fragmentRefs'?: { TypeRefFragment: TypeRefFragment } }
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
                  ofType?: { __typename?: '__Type'; kind: __TypeKind; name?: string | null } | null
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
  sendMessage: Array<{ __typename?: 'AiConversationMessage'; id: string; createdAt: string }>
}

export type CreateConversationMutationVariables = Exact<{
  ownerId: Scalars['String']['input']
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

export type LeaveConversationMutationVariables = Exact<{
  participantId: Scalars['String']['input']
}>

export type LeaveConversationMutation = {
  __typename?: 'Mutation'
  leaveAiConversation?:
    | { __typename?: 'AssistantParticipant'; id: string }
    | { __typename?: 'HumanParticipant'; id: string }
    | null
}

export type AddParticipantMutationVariables = Exact<{
  conversationId: Scalars['String']['input']
  userIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>
  assistantIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>
}>

export type AddParticipantMutation = {
  __typename?: 'Mutation'
  addConversationParticipants?: Array<
    { __typename?: 'AssistantParticipant'; id: string } | { __typename?: 'HumanParticipant'; id: string }
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

export type SendConfirmationMailMutationVariables = Exact<{
  userId: Scalars['String']['input']
  confirmationUrl: Scalars['String']['input']
}>

export type SendConfirmationMailMutation = { __typename?: 'Mutation'; sendConfirmationMail?: boolean | null }

export type ConfirmUserProfileMutationVariables = Exact<{
  profileId: Scalars['String']['input']
}>

export type ConfirmUserProfileMutation = {
  __typename?: 'Mutation'
  confirmUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type GetUserProfileQueryVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type GetUserProfileQuery = {
  __typename?: 'Query'
  userProfile?: {
    __typename?: 'UserProfile'
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    business?: string | null
    position?: string | null
    freeMessages: number
    usedMessages?: number | null
    freeStorage: number
    usedStorage?: number | null
  } | null
}

export const AssistantBasecaseForm_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantBasecaseForm_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'baseCases' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sequence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'condition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'instruction' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantBasecaseForm_AssistantFragment, unknown>
export const AssistantDelete_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantDelete_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantDelete_AssistantFragment, unknown>
export const AssistantCard_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantCard_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantDelete_Assistant' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantDelete_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantCard_AssistantFragment, unknown>
export const AssistantForm_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantForm_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantForm_AssistantFragment, unknown>
export const AssistantIcon_AssistantFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantIcon_assistantFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantIcon_AssistantFragmentFragment, unknown>
export const AssistantLibraries_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantLibraries_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }] },
    },
  ],
} as unknown as DocumentNode<AssistantLibraries_AssistantFragment, unknown>
export const AssistantLibraries_LibraryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantLibraries_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantLibraries_LibraryFragment, unknown>
export const AssistantLibraries_LibraryUsageFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantLibraries_LibraryUsage' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryUsage' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedFor' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'library' },
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
} as unknown as DocumentNode<AssistantLibraries_LibraryUsageFragment, unknown>
export const AssistantSelector_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantSelector_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantSelector_AssistantFragment, unknown>
export const ConversationForm_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationForm_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
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
      name: { kind: 'Name', value: 'ConversationHistory_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'sequenceNumber' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hidden' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sender' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isBot' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
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
export const ParticipantsDialog_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ParticipantsDialog_ConversationFragment, unknown>
export const ConversationParticipants_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Conversation' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationParticipants_ConversationFragment, unknown>
export const ParticipantsDialog_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ParticipantsDialog_AssistantFragment, unknown>
export const ConversationParticipants_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' } }],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationParticipants_AssistantFragment, unknown>
export const ParticipantsDialog_HumanFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ParticipantsDialog_HumanFragment, unknown>
export const ConversationParticipants_HumanFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Human' } }],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationParticipants_HumanFragment, unknown>
export const ConversationSelector_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationSelector_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
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
} as unknown as DocumentNode<ConversationSelector_ConversationFragment, unknown>
export const ConversationDelete_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationDelete_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationDelete_ConversationFragment, unknown>
export const NewConversationSelector_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NewConversationSelector_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' } }],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NewConversationSelector_AssistantFragment, unknown>
export const NewConversationSelector_HumanFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NewConversationSelector_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Human' } }],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NewConversationSelector_HumanFragment, unknown>
export const DeleteLibraryDialog_LibraryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DeleteLibraryDialog_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteLibraryDialog_LibraryFragment, unknown>
export const LibraryFormFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryFormFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LibraryFormFragmentFragment, unknown>
export const UserProfileForm_UserProfileFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserProfileForm_UserProfile' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'UserProfile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProfileForm_UserProfileFragment, unknown>
export const TypeRefFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TypeRef' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__Type' } },
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
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__InputValue' } },
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'defaultValue' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TypeRef' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__Type' } },
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
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__Type' } },
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
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'InputValue' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'type' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'isDeprecated' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deprecationReason' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'inputFields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'InputValue' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'interfaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
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
                { kind: 'Field', name: { kind: 'Name', value: 'isDeprecated' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deprecationReason' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'possibleTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TypeRef' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__Type' } },
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
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__InputValue' } },
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'jwtToken' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'jwtToken' } },
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
export const UpsertAiBaseCasesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'upsertAiBaseCases' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'baseCases' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiBaseCaseInputType' } },
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
            name: { kind: 'Name', value: 'upsertAiBaseCases' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'baseCases' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'baseCases' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sequence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'condition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'instruction' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpsertAiBaseCasesMutation, UpsertAiBaseCasesMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
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
} as unknown as DocumentNode<DeleteAiAssistantMutation, DeleteAiAssistantMutationVariables>
export const UpdateAssistantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateAssistant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistantInput' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateAssistantMutation, UpdateAssistantMutationVariables>
export const AddLibraryUsageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addLibraryUsage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addLibraryUsage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddLibraryUsageMutation, AddLibraryUsageMutationVariables>
export const RemoveLibraryUsageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeLibraryUsage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeLibraryUsage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveLibraryUsageMutation, RemoveLibraryUsageMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'usedFor' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'usedFor' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'usedFor' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateLibraryUsageMutation, UpdateLibraryUsageMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'name' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
} as unknown as DocumentNode<CreateAiAssistantMutation, CreateAiAssistantMutationVariables>
export const HideMessageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'hideMessage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'hideMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'messageId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hidden' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HideMessageMutation, HideMessageMutationVariables>
export const UnhideMessageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'unhideMessage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'unhideMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'messageId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hidden' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UnhideMessageMutation, UnhideMessageMutationVariables>
export const CreateAiLibraryCrawlerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createAiLibraryCrawler' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'maxDepth' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'maxPages' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAiLibraryCrawler' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'maxDepth' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'maxDepth' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'maxPages' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'maxPages' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'url' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateAiLibraryCrawlerMutation, CreateAiLibraryCrawlerMutationVariables>
export const CrawlerTableDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CrawlerTable' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'crawlers' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'lastRun' } },
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
} as unknown as DocumentNode<CrawlerTableQuery, CrawlerTableQueryVariables>
export const DropFilesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'dropFiles' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'dropFiles' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<DropFilesMutation, DropFilesMutationVariables>
export const DeleteAiLibraryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteAiLibrary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteAiLibrary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAiLibraryMutation, DeleteAiLibraryMutationVariables>
export const PrepareDesktopFileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'prepareDesktopFile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'file' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFileInput' } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'file' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PrepareDesktopFileMutation, PrepareDesktopFileMutationVariables>
export const CancelFileUploadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'cancelFileUpload' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cancelFileUpload' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CancelFileUploadMutation, CancelFileUploadMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClearEmbeddingsMutation, ClearEmbeddingsMutationVariables>
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
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
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
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'processingErrorMessage' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReProcessFileMutation, ReProcessFileMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'processingErrorMessage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dropError' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EmbeddingsTableQuery, EmbeddingsTableQueryVariables>
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
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFileInput' } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'file' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryInput' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
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
} as unknown as DocumentNode<CreateAiLibraryMutation, CreateAiLibraryMutationVariables>
export const SaveUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'saveUserProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userProfileInput' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'UserProfileInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUserProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userProfileInput' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SaveUserProfileMutation, SaveUserProfileMutationVariables>
export const AiAssistantDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiAssistantDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantForm_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantSelector_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantLibraries_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantBasecaseForm_Assistant' } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantSelector_Assistant' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraryUsage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantLibraries_LibraryUsage' } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantLibraries_Library' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantForm_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantSelector_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
      name: { kind: 'Name', value: 'AssistantLibraries_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }] },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantBasecaseForm_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'baseCases' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sequence' } },
                { kind: 'Field', name: { kind: 'Name', value: 'condition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'instruction' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantLibraries_LibraryUsage' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryUsage' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedFor' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'library' },
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
      name: { kind: 'Name', value: 'AssistantLibraries_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiAssistantDetailsQuery, AiAssistantDetailsQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantCard_Assistant' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantDelete_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
      name: { kind: 'Name', value: 'AssistantCard_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantDelete_Assistant' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiAssistantCardsQuery, AiAssistantCardsQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationSelector_Conversation' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationSelector_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
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
} as unknown as DocumentNode<GetUserConversationsQuery, GetUserConversationsQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationParticipants_Conversation' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationDelete_Conversation' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationHistory_Conversation' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationForm_Conversation' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
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
      name: { kind: 'Name', value: 'ConversationParticipants_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Conversation' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationDelete_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationHistory_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'sequenceNumber' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'source' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hidden' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sender' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isBot' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
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
      name: { kind: 'Name', value: 'ConversationForm_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
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
} as unknown as DocumentNode<GetConversationQuery, GetConversationQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'NewConversationSelector_Human' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationParticipants_Human' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NewConversationSelector_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Human' } }],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_Human' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Human' } }],
      },
    },
  ],
} as unknown as DocumentNode<GetAssignableUsersQuery, GetAssignableUsersQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'NewConversationSelector_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationParticipants_Assistant' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
      name: { kind: 'Name', value: 'NewConversationSelector_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' } }],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ParticipantsDialog_Assistant' } }],
      },
    },
  ],
} as unknown as DocumentNode<GetAssignableAssistantsQuery, GetAssignableAssistantsQueryVariables>
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
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'LibraryFormFragment' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'DeleteLibraryDialog_Library' } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
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
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryFormFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DeleteLibraryDialog_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
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
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryInput' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
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
} as unknown as DocumentNode<ChangeAiLibraryMutation, ChangeAiLibraryMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
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
export const UserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'userProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'userProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserProfileForm_UserProfile' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserProfileForm_UserProfile' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'UserProfile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>
export const CreateUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createUserProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createUserProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateUserProfileMutation, CreateUserProfileMutationVariables>
export const RemoveUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeUserProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeUserProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveUserProfileMutation, RemoveUserProfileMutationVariables>
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
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'mutationType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'subscriptionType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'types' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'FullType' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'directives' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'locations' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'args' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'InputValue' } }],
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
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__Type' } },
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
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__InputValue' } },
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'defaultValue' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FullType' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: '__Type' } },
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
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'InputValue' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'type' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'isDeprecated' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deprecationReason' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'inputFields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'InputValue' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'interfaces' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
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
                { kind: 'Field', name: { kind: 'Name', value: 'isDeprecated' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deprecationReason' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'possibleTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TypeRef' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<IntrospectionQueryQuery, IntrospectionQueryQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversationMessageInput' } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversationCreateInput' } },
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
                name: { kind: 'Name', value: 'ownerId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ownerId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateConversationMutation, CreateConversationMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteConversationMutation, DeleteConversationMutationVariables>
export const LeaveConversationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'leaveConversation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'participantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'leaveAiConversation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'participantId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LeaveConversationMutation, LeaveConversationMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userIds' } },
          type: {
            kind: 'ListType',
            type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantIds' } },
          type: {
            kind: 'ListType',
            type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userIds' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantIds' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddParticipantMutation, AddParticipantMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'participantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'participantId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveParticipantMutation, RemoveParticipantMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
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
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
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
} as unknown as DocumentNode<MyConversationUsersQuery, MyConversationUsersQueryVariables>
export const SendConfirmationMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'sendConfirmationMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'confirmationUrl' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sendConfirmationMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'confirmationUrl' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'confirmationUrl' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SendConfirmationMailMutation, SendConfirmationMailMutationVariables>
export const ConfirmUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'confirmUserProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'profileId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'confirmUserProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'profileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'profileId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConfirmUserProfileMutation, ConfirmUserProfileMutationVariables>
export const GetUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getUserProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'userProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'freeMessages' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usedMessages' } },
                { kind: 'Field', name: { kind: 'Name', value: 'freeStorage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usedStorage' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserProfileQuery, GetUserProfileQueryVariables>
