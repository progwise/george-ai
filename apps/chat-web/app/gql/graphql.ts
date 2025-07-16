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

/** AI Act Legal Disclaimer */
export type AiActLegalDisclaimer = {
  __typename?: 'AIActLegalDisclaimer'
  text: AiActString
  title: AiActString
}

/** AI Act Assessment Query */
export type AiActAssessment = {
  __typename?: 'AiActAssessment'
  assistantId: Scalars['String']['output']
  assistantSurvey: AiActAssistantSurvey
  identifyRiskInfo: AiActIdentifyRisksInfo
}

/** AI Act Assessment Basic System Info */
export type AiActAssistantSurvey = {
  __typename?: 'AiActAssistantSurvey'
  actions: Array<AiActRecommendedAction>
  actionsTitle: AiActString
  assistantId: Scalars['String']['output']
  hint: AiActString
  id: Scalars['String']['output']
  percentCompleted: Scalars['Int']['output']
  questions: Array<AiActQuestion>
  riskIndicator: AiActRiskIndicator
  title: AiActString
}

/** AI Act Compliance Area */
export type AiActComplianceArea = {
  __typename?: 'AiActComplianceArea'
  description: AiActString
  id: Scalars['String']['output']
  mandatory: Scalars['Boolean']['output']
  title: AiActString
}

/** AI Act Identify Risks Info */
export type AiActIdentifyRisksInfo = {
  __typename?: 'AiActIdentifyRisksInfo'
  complianceAreas: Array<AiActComplianceArea>
  legalDisclaimer: AiActLegalDisclaimer
  title: AiActString
}

export type AiActOption = {
  __typename?: 'AiActOption'
  id: Scalars['String']['output']
  risk?: Maybe<AiActOptionRisk>
  title: AiActString
}

export type AiActOptionRisk = {
  __typename?: 'AiActOptionRisk'
  description: AiActString
  points: Scalars['Int']['output']
  riskLevel?: Maybe<Scalars['String']['output']>
}

/** AI Act Questions */
export type AiActQuestion = {
  __typename?: 'AiActQuestion'
  hint: AiActString
  id: Scalars['String']['output']
  notes?: Maybe<Scalars['String']['output']>
  options: Array<AiActOption>
  title: AiActString
  value?: Maybe<Scalars['String']['output']>
}

/** AI Act Checklist Action */
export type AiActRecommendedAction = {
  __typename?: 'AiActRecommendedAction'
  description: AiActString
  level: Scalars['String']['output']
}

/** AI Act Risk Indicator */
export type AiActRiskIndicator = {
  __typename?: 'AiActRiskIndicator'
  description: AiActString
  factors: Array<AiActString>
  level: Scalars['String']['output']
}

export type AiActString = {
  __typename?: 'AiActString'
  de: Scalars['String']['output']
  en: Scalars['String']['output']
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
  participants: Array<User>
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
  owner: User
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
  files: Array<AiLibraryFile>
  filesCount: Scalars['Int']['output']
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  owner: User
  ownerId: Scalars['String']['output']
  participants: Array<User>
  updatedAt: Scalars['DateTime']['output']
  url?: Maybe<Scalars['String']['output']>
}

export type AiLibraryCrawler = {
  __typename?: 'AiLibraryCrawler'
  createdAt: Scalars['DateTime']['output']
  cronJob?: Maybe<AiLibraryCrawlerCronJob>
  filesCount: Scalars['Int']['output']
  id: Scalars['ID']['output']
  isRunning: Scalars['Boolean']['output']
  lastRun?: Maybe<AiLibraryCrawlerRun>
  maxDepth: Scalars['Int']['output']
  maxPages: Scalars['Int']['output']
  runCount: Scalars['Int']['output']
  runs: Array<AiLibraryCrawlerRun>
  updatedAt: Scalars['DateTime']['output']
  url: Scalars['String']['output']
}

export type AiLibraryCrawlerRunsArgs = {
  skip?: Scalars['Int']['input']
  take?: Scalars['Int']['input']
}

export type AiLibraryCrawlerCronJob = {
  __typename?: 'AiLibraryCrawlerCronJob'
  active: Scalars['Boolean']['output']
  createdAt: Scalars['DateTime']['output']
  cronExpression?: Maybe<Scalars['String']['output']>
  friday: Scalars['Boolean']['output']
  hour: Scalars['Int']['output']
  id: Scalars['ID']['output']
  minute: Scalars['Int']['output']
  monday: Scalars['Boolean']['output']
  saturday: Scalars['Boolean']['output']
  sunday: Scalars['Boolean']['output']
  thursday: Scalars['Boolean']['output']
  tuesday: Scalars['Boolean']['output']
  updatedAt: Scalars['DateTime']['output']
  wednesday: Scalars['Boolean']['output']
}

export type AiLibraryCrawlerCronJobInput = {
  active: Scalars['Boolean']['input']
  friday: Scalars['Boolean']['input']
  hour: Scalars['Int']['input']
  minute: Scalars['Int']['input']
  monday: Scalars['Boolean']['input']
  saturday: Scalars['Boolean']['input']
  sunday: Scalars['Boolean']['input']
  thursday: Scalars['Boolean']['input']
  tuesday: Scalars['Boolean']['input']
  wednesday: Scalars['Boolean']['input']
}

export type AiLibraryCrawlerInput = {
  cronJob?: InputMaybe<AiLibraryCrawlerCronJobInput>
  maxDepth: Scalars['Int']['input']
  maxPages: Scalars['Int']['input']
  url: Scalars['String']['input']
}

export type AiLibraryCrawlerRun = {
  __typename?: 'AiLibraryCrawlerRun'
  crawler: AiLibraryCrawler
  crawlerId: Scalars['ID']['output']
  endedAt?: Maybe<Scalars['DateTime']['output']>
  errorMessage?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  runByUserId?: Maybe<Scalars['ID']['output']>
  startedAt: Scalars['DateTime']['output']
  success?: Maybe<Scalars['Boolean']['output']>
  updates: Array<AiLibraryUpdate>
  updatesCount: Scalars['Int']['output']
}

export type AiLibraryCrawlerRunUpdatesArgs = {
  skip?: Scalars['Int']['input']
  take?: Scalars['Int']['input']
}

export type AiLibraryFile = {
  __typename?: 'AiLibraryFile'
  chunks?: Maybe<Scalars['Int']['output']>
  createdAt: Scalars['DateTime']['output']
  docPath?: Maybe<Scalars['String']['output']>
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

/** Query result for AI library files */
export type AiLibraryFileQueryResult = {
  __typename?: 'AiLibraryFileQueryResult'
  count: Scalars['Int']['output']
  files: Array<AiLibraryFile>
  library: AiLibrary
  libraryId: Scalars['String']['output']
  skip: Scalars['Int']['output']
  take: Scalars['Int']['output']
}

export type AiLibraryInput = {
  description?: InputMaybe<Scalars['String']['input']>
  icon?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  url?: InputMaybe<Scalars['String']['input']>
}

export type AiLibraryQueryHit = {
  __typename?: 'AiLibraryQueryHit'
  docId: Scalars['String']['output']
  docName: Scalars['String']['output']
  docPath: Scalars['String']['output']
  highlights: Array<AiLibraryQueryHitHighlight>
  id: Scalars['String']['output']
  originUri: Scalars['String']['output']
  pageContent: Scalars['String']['output']
}

export type AiLibraryQueryHitHighlight = {
  __typename?: 'AiLibraryQueryHitHighlight'
  field: Scalars['String']['output']
  snippet?: Maybe<Scalars['String']['output']>
}

export type AiLibraryQueryResult = {
  __typename?: 'AiLibraryQueryResult'
  hitCount: Scalars['Int']['output']
  hits: Array<AiLibraryQueryHit>
  libraryId: Scalars['String']['output']
  query: Scalars['String']['output']
  skip: Scalars['Int']['output']
  take: Scalars['Int']['output']
}

export type AiLibraryUpdate = {
  __typename?: 'AiLibraryUpdate'
  crawlerRun?: Maybe<AiLibraryCrawlerRun>
  crawlerRunId?: Maybe<Scalars['ID']['output']>
  createdAt: Scalars['DateTime']['output']
  file?: Maybe<AiLibraryFile>
  fileId?: Maybe<Scalars['ID']['output']>
  id: Scalars['ID']['output']
  library?: Maybe<AiLibrary>
  libraryId: Scalars['ID']['output']
  message?: Maybe<Scalars['String']['output']>
  success: Scalars['Boolean']['output']
}

/** Query result for AI library updates */
export type AiLibraryUpdateQueryResult = {
  __typename?: 'AiLibraryUpdateQueryResult'
  count: Scalars['Int']['output']
  crawlerId?: Maybe<Scalars['String']['output']>
  library: AiLibrary
  libraryId: Scalars['String']['output']
  skip: Scalars['Int']['output']
  take: Scalars['Int']['output']
  updates: Array<AiLibraryUpdate>
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

/** AI Models available in the system */
export type AiModel = {
  __typename?: 'AiModel'
  baseUrl?: Maybe<Scalars['String']['output']>
  modelName: Scalars['String']['output']
  modelType: Scalars['String']['output']
  options?: Maybe<Array<AiModelOption>>
  title: Scalars['String']['output']
}

/** Options for AI Models */
export type AiModelOption = {
  __typename?: 'AiModelOption'
  key: Scalars['String']['output']
  value: Scalars['String']['output']
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

export type ConversationInvitationInput = {
  allowDifferentEmailAddress: Scalars['Boolean']['input']
  allowMultipleParticipants: Scalars['Boolean']['input']
  email: Scalars['String']['input']
}

export type FileChunk = {
  __typename?: 'FileChunk'
  chunkIndex: Scalars['Int']['output']
  headingPath: Scalars['String']['output']
  id: Scalars['String']['output']
  section: Scalars['String']['output']
  subChunkIndex: Scalars['Int']['output']
  text: Scalars['String']['output']
}

export type FileChunkQueryResponse = {
  __typename?: 'FileChunkQueryResponse'
  chunks: Array<FileChunk>
  count: Scalars['Int']['output']
  fileId: Scalars['String']['output']
  fileName?: Maybe<Scalars['String']['output']>
  libraryId: Scalars['String']['output']
  skip: Scalars['Int']['output']
  take: Scalars['Int']['output']
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

export type ManagedUser = {
  __typename?: 'ManagedUser'
  activationDate?: Maybe<Scalars['DateTime']['output']>
  business?: Maybe<Scalars['String']['output']>
  confirmationDate?: Maybe<Scalars['DateTime']['output']>
  createdAt: Scalars['DateTime']['output']
  email: Scalars['String']['output']
  family_name?: Maybe<Scalars['String']['output']>
  given_name?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  isAdmin: Scalars['Boolean']['output']
  lastLogin?: Maybe<Scalars['DateTime']['output']>
  name?: Maybe<Scalars['String']['output']>
  position?: Maybe<Scalars['String']['output']>
  registered?: Maybe<Scalars['Boolean']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  username: Scalars['String']['output']
}

export type ManagedUsersResponse = {
  __typename?: 'ManagedUsersResponse'
  filter?: Maybe<Scalars['String']['output']>
  skip: Scalars['Int']['output']
  statusFilter?: Maybe<Scalars['String']['output']>
  take: Scalars['Int']['output']
  userStatistics: UserStatistic
  users: Array<ManagedUser>
}

export type Mutation = {
  __typename?: 'Mutation'
  activateUserProfile?: Maybe<UserProfile>
  addAssistantParticipants: Array<User>
  addConversationParticipants?: Maybe<Array<AiConversationParticipant>>
  addLibraryParticipants: Array<User>
  addLibraryUsage?: Maybe<AiLibraryUsage>
  cancelFileUpload: Scalars['Boolean']['output']
  chat?: Maybe<ChatAnswer>
  clearEmbeddedFiles?: Maybe<Scalars['Boolean']['output']>
  confirmConversationInvitation?: Maybe<AiConversation>
  confirmUserProfile?: Maybe<UserProfile>
  createAiAssistant?: Maybe<AiAssistant>
  createAiConversation?: Maybe<AiConversation>
  createAiLibrary?: Maybe<AiLibrary>
  createAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  createContactRequest: Scalars['Boolean']['output']
  createConversationInvitations?: Maybe<AiConversation>
  deleteAiAssistant?: Maybe<AiAssistant>
  deleteAiConversation?: Maybe<AiConversation>
  deleteAiConversations: Scalars['Boolean']['output']
  deleteAiLibrary?: Maybe<Scalars['Boolean']['output']>
  deleteAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  deleteMessage?: Maybe<AiConversationMessage>
  dropFile: AiLibraryFile
  dropFiles: Array<AiLibraryFile>
  ensureUserProfile?: Maybe<UserProfile>
  hideMessage?: Maybe<AiConversationMessage>
  leaveAiConversation?: Maybe<AiConversationParticipant>
  leaveAssistantParticipant?: Maybe<User>
  leaveLibraryParticipant?: Maybe<User>
  login?: Maybe<User>
  prepareFile?: Maybe<AiLibraryFile>
  processFile: AiLibraryFile
  processUnprocessedFiles?: Maybe<Array<Scalars['String']['output']>>
  removeAssistantParticipant: User
  removeConversationParticipant?: Maybe<AiConversationParticipant>
  removeLibraryParticipant: User
  removeLibraryUsage?: Maybe<AiLibraryUsage>
  resetAssessmentAnswers: Scalars['DateTime']['output']
  runAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  sendConfirmationMail?: Maybe<Scalars['Boolean']['output']>
  sendMessage: Array<AiConversationMessage>
  stopAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  toggleAdminStatus?: Maybe<User>
  unhideMessage?: Maybe<AiConversationMessage>
  updateAiAssistant?: Maybe<AiAssistant>
  updateAiLibrary?: Maybe<AiLibrary>
  updateAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  updateAssessmentQuestion: Scalars['DateTime']['output']
  updateLibraryUsage?: Maybe<AiLibraryUsage>
  updateMessage?: Maybe<AiConversationMessage>
  updateUserProfile?: Maybe<UserProfile>
  upsertAiBaseCases?: Maybe<Array<AiAssistantBaseCase>>
}

export type MutationActivateUserProfileArgs = {
  profileId: Scalars['String']['input']
}

export type MutationAddAssistantParticipantsArgs = {
  assistantId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']>
}

export type MutationAddConversationParticipantsArgs = {
  assistantIds?: InputMaybe<Array<Scalars['String']['input']>>
  conversationId: Scalars['String']['input']
  userIds?: InputMaybe<Array<Scalars['String']['input']>>
}

export type MutationAddLibraryParticipantsArgs = {
  libraryId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']>
}

export type MutationAddLibraryUsageArgs = {
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type MutationCancelFileUploadArgs = {
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type MutationChatArgs = {
  question: Scalars['String']['input']
  retrievalFlow?: InputMaybe<RetrievalFlow>
  sessionId?: InputMaybe<Scalars['String']['input']>
}

export type MutationClearEmbeddedFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type MutationConfirmConversationInvitationArgs = {
  conversationId: Scalars['String']['input']
  invitationId: Scalars['String']['input']
}

export type MutationConfirmUserProfileArgs = {
  profileId: Scalars['String']['input']
}

export type MutationCreateAiAssistantArgs = {
  name: Scalars['String']['input']
}

export type MutationCreateAiConversationArgs = {
  data: AiConversationCreateInput
}

export type MutationCreateAiLibraryArgs = {
  data: AiLibraryInput
}

export type MutationCreateAiLibraryCrawlerArgs = {
  data: AiLibraryCrawlerInput
  libraryId: Scalars['String']['input']
}

export type MutationCreateContactRequestArgs = {
  emailOrPhone: Scalars['String']['input']
  message: Scalars['String']['input']
  name: Scalars['String']['input']
}

export type MutationCreateConversationInvitationsArgs = {
  conversationId: Scalars['String']['input']
  data: Array<ConversationInvitationInput>
}

export type MutationDeleteAiAssistantArgs = {
  assistantId: Scalars['String']['input']
}

export type MutationDeleteAiConversationArgs = {
  conversationId: Scalars['String']['input']
}

export type MutationDeleteAiConversationsArgs = {
  conversationIds: Array<Scalars['String']['input']>
}

export type MutationDeleteAiLibraryArgs = {
  id: Scalars['String']['input']
}

export type MutationDeleteAiLibraryCrawlerArgs = {
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

export type MutationEnsureUserProfileArgs = {
  userId: Scalars['String']['input']
}

export type MutationHideMessageArgs = {
  messageId: Scalars['String']['input']
}

export type MutationLeaveAiConversationArgs = {
  participantId: Scalars['String']['input']
}

export type MutationLeaveAssistantParticipantArgs = {
  assistantId: Scalars['String']['input']
}

export type MutationLeaveLibraryParticipantArgs = {
  libraryId: Scalars['String']['input']
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

export type MutationProcessUnprocessedFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type MutationRemoveAssistantParticipantArgs = {
  assistantId: Scalars['String']['input']
  userId: Scalars['String']['input']
}

export type MutationRemoveConversationParticipantArgs = {
  participantId: Scalars['String']['input']
}

export type MutationRemoveLibraryParticipantArgs = {
  libraryId: Scalars['String']['input']
  userId: Scalars['String']['input']
}

export type MutationRemoveLibraryUsageArgs = {
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type MutationResetAssessmentAnswersArgs = {
  assistantId: Scalars['String']['input']
}

export type MutationRunAiLibraryCrawlerArgs = {
  crawlerId: Scalars['String']['input']
}

export type MutationSendConfirmationMailArgs = {
  activationUrl: Scalars['String']['input']
  confirmationUrl: Scalars['String']['input']
}

export type MutationSendMessageArgs = {
  data: AiConversationMessageInput
}

export type MutationStopAiLibraryCrawlerArgs = {
  crawlerId: Scalars['String']['input']
}

export type MutationToggleAdminStatusArgs = {
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

export type MutationUpdateAiLibraryCrawlerArgs = {
  data: AiLibraryCrawlerInput
  id: Scalars['String']['input']
}

export type MutationUpdateAssessmentQuestionArgs = {
  assistantId: Scalars['String']['input']
  notes?: InputMaybe<Scalars['String']['input']>
  questionId: Scalars['String']['input']
  value?: InputMaybe<Scalars['String']['input']>
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
  profileId: Scalars['String']['input']
}

export type MutationUpsertAiBaseCasesArgs = {
  assistantId: Scalars['String']['input']
  baseCases: Array<AiBaseCaseInputType>
}

export type Query = {
  __typename?: 'Query'
  aiActAssessment: AiActAssessment
  aiAssistant?: Maybe<AiAssistant>
  aiAssistants: Array<AiAssistant>
  aiConversation?: Maybe<AiConversation>
  aiConversationMessages?: Maybe<Array<AiConversationMessage>>
  aiConversations: Array<AiConversation>
  aiFileChunks: FileChunkQueryResponse
  aiLibraries: Array<AiLibrary>
  aiLibrary: AiLibrary
  aiLibraryCrawler: AiLibraryCrawler
  aiLibraryCrawlerRun: AiLibraryCrawlerRun
  aiLibraryFile: AiLibraryFile
  aiLibraryFiles: AiLibraryFileQueryResult
  aiLibraryUpdates: AiLibraryUpdateQueryResult
  aiLibraryUsage: Array<AiLibraryUsage>
  aiModels: Array<AiModel>
  managedUsers: ManagedUsersResponse
  queryAiLibraryFiles: AiLibraryQueryResult
  readFileMarkdown: Scalars['String']['output']
  unprocessedFileCount: Scalars['Int']['output']
  user?: Maybe<User>
  userProfile?: Maybe<UserProfile>
  users: Array<User>
  version?: Maybe<Scalars['String']['output']>
}

export type QueryAiActAssessmentArgs = {
  assistantId: Scalars['String']['input']
}

export type QueryAiAssistantArgs = {
  assistantId: Scalars['String']['input']
}

export type QueryAiConversationArgs = {
  conversationId: Scalars['String']['input']
}

export type QueryAiConversationMessagesArgs = {
  conversationId: Scalars['String']['input']
}

export type QueryAiFileChunksArgs = {
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
}

export type QueryAiLibraryArgs = {
  libraryId: Scalars['String']['input']
}

export type QueryAiLibraryCrawlerArgs = {
  crawlerId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type QueryAiLibraryCrawlerRunArgs = {
  crawlerRunId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type QueryAiLibraryFileArgs = {
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type QueryAiLibraryFilesArgs = {
  libraryId: Scalars['String']['input']
  skip?: Scalars['Int']['input']
  take?: Scalars['Int']['input']
}

export type QueryAiLibraryUpdatesArgs = {
  crawlerId?: InputMaybe<Scalars['ID']['input']>
  libraryId: Scalars['ID']['input']
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
}

export type QueryAiLibraryUsageArgs = {
  assistantId?: InputMaybe<Scalars['String']['input']>
  libraryId?: InputMaybe<Scalars['String']['input']>
}

export type QueryManagedUsersArgs = {
  filter?: InputMaybe<Scalars['String']['input']>
  skip?: Scalars['Int']['input']
  statusFilter?: InputMaybe<Scalars['String']['input']>
  take?: Scalars['Int']['input']
}

export type QueryQueryAiLibraryFilesArgs = {
  libraryId: Scalars['String']['input']
  query: Scalars['String']['input']
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
}

export type QueryReadFileMarkdownArgs = {
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type QueryUnprocessedFileCountArgs = {
  libraryId: Scalars['String']['input']
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
  isAdmin: Scalars['Boolean']['output']
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
  activationDate?: Maybe<Scalars['DateTime']['output']>
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
  freeMessages?: InputMaybe<Scalars['Int']['input']>
  freeStorage?: InputMaybe<Scalars['Int']['input']>
  lastName?: InputMaybe<Scalars['String']['input']>
  position?: InputMaybe<Scalars['String']['input']>
}

export type UserStatistic = {
  __typename?: 'UserStatistic'
  activated: Scalars['Int']['output']
  confirmed: Scalars['Int']['output']
  total: Scalars['Int']['output']
  unactivated: Scalars['Int']['output']
  unconfirmed: Scalars['Int']['output']
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
    isAdmin: boolean
  } | null
}

export type EnsureUserProfileMutationVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type EnsureUserProfileMutation = {
  __typename?: 'Mutation'
  ensureUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type ManagedUserFragment = {
  __typename?: 'ManagedUser'
  id: string
  username: string
  name?: string | null
  given_name?: string | null
  family_name?: string | null
  lastLogin?: string | null
  createdAt: string
  updatedAt?: string | null
  email: string
  isAdmin: boolean
  registered?: boolean | null
  business?: string | null
  position?: string | null
  confirmationDate?: string | null
  activationDate?: string | null
}

export type GetManagedUsersQueryVariables = Exact<{
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
  filter?: InputMaybe<Scalars['String']['input']>
  statusFilter?: InputMaybe<Scalars['String']['input']>
}>

export type GetManagedUsersQuery = {
  __typename?: 'Query'
  managedUsers: {
    __typename?: 'ManagedUsersResponse'
    skip: number
    take: number
    filter?: string | null
    userStatistics: {
      __typename?: 'UserStatistic'
      total: number
      confirmed: number
      unconfirmed: number
      activated: number
      unactivated: number
    }
    users: Array<{
      __typename?: 'ManagedUser'
      id: string
      username: string
      name?: string | null
      given_name?: string | null
      family_name?: string | null
      lastLogin?: string | null
      createdAt: string
      updatedAt?: string | null
      email: string
      isAdmin: boolean
      registered?: boolean | null
      business?: string | null
      position?: string | null
      confirmationDate?: string | null
      activationDate?: string | null
    }>
  }
}

export type ToggleAdminStatusMutationVariables = Exact<{
  userId: Scalars['String']['input']
}>

export type ToggleAdminStatusMutation = {
  __typename?: 'Mutation'
  toggleAdminStatus?: { __typename?: 'User'; id: string; isAdmin: boolean; username: string } | null
}

export type AssistantSurvey_AssessmentFragment = {
  __typename?: 'AiActAssessment'
  assistantId: string
  assistantSurvey: {
    __typename?: 'AiActAssistantSurvey'
    percentCompleted: number
    actionsTitle: { __typename?: 'AiActString'; de: string; en: string }
    actions: Array<{
      __typename?: 'AiActRecommendedAction'
      level: string
      description: { __typename?: 'AiActString'; de: string; en: string }
    }>
    questions: Array<{
      __typename?: 'AiActQuestion'
      id: string
      notes?: string | null
      value?: string | null
      title: { __typename?: 'AiActString'; de: string; en: string }
      hint: { __typename?: 'AiActString'; de: string; en: string }
      options: Array<{
        __typename?: 'AiActOption'
        id: string
        title: { __typename?: 'AiActString'; de: string; en: string }
      }>
    }>
    title: { __typename?: 'AiActString'; de: string; en: string }
    hint: { __typename?: 'AiActString'; de: string; en: string }
    riskIndicator: {
      __typename?: 'AiActRiskIndicator'
      level: string
      description: { __typename?: 'AiActString'; de: string; en: string }
    }
  }
}

export type AiActAssessmentQueryQueryVariables = Exact<{
  assistantId: Scalars['String']['input']
}>

export type AiActAssessmentQueryQuery = {
  __typename?: 'Query'
  aiActAssessment: {
    __typename?: 'AiActAssessment'
    assistantId: string
    identifyRiskInfo: {
      __typename?: 'AiActIdentifyRisksInfo'
      title: { __typename?: 'AiActString'; de: string; en: string }
      legalDisclaimer: {
        __typename?: 'AIActLegalDisclaimer'
        title: { __typename?: 'AiActString'; de: string; en: string }
        text: { __typename?: 'AiActString'; de: string; en: string }
      }
      complianceAreas: Array<{
        __typename?: 'AiActComplianceArea'
        id: string
        mandatory: boolean
        title: { __typename?: 'AiActString'; de: string; en: string }
        description: { __typename?: 'AiActString'; de: string; en: string }
      }>
    }
    assistantSurvey: {
      __typename?: 'AiActAssistantSurvey'
      percentCompleted: number
      questions: Array<{
        __typename?: 'AiActQuestion'
        id: string
        notes?: string | null
        value?: string | null
        title: { __typename?: 'AiActString'; de: string; en: string }
        options: Array<{
          __typename?: 'AiActOption'
          id: string
          title: { __typename?: 'AiActString'; de: string; en: string }
        }>
        hint: { __typename?: 'AiActString'; de: string; en: string }
      }>
      riskIndicator: {
        __typename?: 'AiActRiskIndicator'
        level: string
        description: { __typename?: 'AiActString'; de: string; en: string }
        factors: Array<{ __typename?: 'AiActString'; de: string; en: string }>
      }
      actionsTitle: { __typename?: 'AiActString'; de: string; en: string }
      actions: Array<{
        __typename?: 'AiActRecommendedAction'
        level: string
        description: { __typename?: 'AiActString'; de: string; en: string }
      }>
      title: { __typename?: 'AiActString'; de: string; en: string }
      hint: { __typename?: 'AiActString'; de: string; en: string }
    }
  }
}

export type UpdateAssessmentQuestionMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
  questionId: Scalars['String']['input']
  value?: InputMaybe<Scalars['String']['input']>
  notes?: InputMaybe<Scalars['String']['input']>
}>

export type UpdateAssessmentQuestionMutation = { __typename?: 'Mutation'; updateAssessmentQuestion: string }

export type ResetAssessmentAnswersMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
}>

export type ResetAssessmentAnswersMutation = { __typename?: 'Mutation'; resetAssessmentAnswers: string }

export type ComplianceArea_ComplianceFragment = {
  __typename?: 'AiActComplianceArea'
  mandatory: boolean
  title: { __typename?: 'AiActString'; de: string; en: string }
  description: { __typename?: 'AiActString'; de: string; en: string }
}

export type QuestionCard_QuestionFragment = {
  __typename?: 'AiActQuestion'
  id: string
  notes?: string | null
  value?: string | null
  title: { __typename?: 'AiActString'; de: string; en: string }
  hint: { __typename?: 'AiActString'; de: string; en: string }
  options: Array<{
    __typename?: 'AiActOption'
    id: string
    title: { __typename?: 'AiActString'; de: string; en: string }
  }>
}

export type RiskAreasIdentification_AssessmentFragment = {
  __typename?: 'AiActAssessment'
  identifyRiskInfo: {
    __typename?: 'AiActIdentifyRisksInfo'
    title: { __typename?: 'AiActString'; de: string; en: string }
    legalDisclaimer: {
      __typename?: 'AIActLegalDisclaimer'
      title: { __typename?: 'AiActString'; de: string; en: string }
      text: { __typename?: 'AiActString'; de: string; en: string }
    }
    complianceAreas: Array<{
      __typename?: 'AiActComplianceArea'
      id: string
      mandatory: boolean
      title: { __typename?: 'AiActString'; de: string; en: string }
      description: { __typename?: 'AiActString'; de: string; en: string }
    }>
  }
  assistantSurvey: {
    __typename?: 'AiActAssistantSurvey'
    questions: Array<{
      __typename?: 'AiActQuestion'
      id: string
      notes?: string | null
      value?: string | null
      title: { __typename?: 'AiActString'; de: string; en: string }
      options: Array<{
        __typename?: 'AiActOption'
        id: string
        title: { __typename?: 'AiActString'; de: string; en: string }
      }>
    }>
    riskIndicator: {
      __typename?: 'AiActRiskIndicator'
      level: string
      description: { __typename?: 'AiActString'; de: string; en: string }
      factors: Array<{ __typename?: 'AiActString'; de: string; en: string }>
    }
  }
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
}

export type DeleteAiAssistantMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
}>

export type DeleteAiAssistantMutation = {
  __typename?: 'Mutation'
  deleteAiAssistant?: { __typename?: 'AiAssistant'; id: string; name: string } | null
}

export type AssistantForm_AssistantFragment = {
  __typename?: 'AiAssistant'
  id: string
  name: string
  iconUrl?: string | null
  description?: string | null
  ownerId: string
  languageModel?: string | null
  updatedAt?: string | null
}

export type UpdateAssistantMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiAssistantInput
}>

export type UpdateAssistantMutation = {
  __typename?: 'Mutation'
  updateAiAssistant?: { __typename?: 'AiAssistant'; id: string } | null
}

export type AssistantLibraries_AssistantFragment = { __typename?: 'AiAssistant'; id: string; ownerId: string }

export type AssistantLibraries_LibraryUsageFragment = {
  __typename?: 'AiLibraryUsage'
  id: string
  assistantId: string
  libraryId: string
  usedFor?: string | null
  library: { __typename?: 'AiLibrary'; id: string; name: string }
}

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
  name: Scalars['String']['input']
}>

export type CreateAiAssistantMutation = {
  __typename?: 'Mutation'
  createAiAssistant?: { __typename?: 'AiAssistant'; id: string; name: string } | null
}

export type AssistantParticipantsDialogButton_AssistantFragment = {
  __typename?: 'AiAssistant'
  id: string
  ownerId: string
  participants: Array<{ __typename?: 'User'; id: string }>
}

export type AssistantParticipants_AssistantFragment = {
  __typename?: 'AiAssistant'
  id: string
  ownerId: string
  participants: Array<{ __typename?: 'User'; id: string; name?: string | null; username: string }>
}

export type AssistantSelector_AssistantFragment = { __typename?: 'AiAssistant'; id: string; name: string }

export type AiAssistantDetailsQueryVariables = Exact<{
  assistantId: Scalars['String']['input']
}>

export type AiAssistantDetailsQuery = {
  __typename?: 'Query'
  aiAssistant?: {
    __typename?: 'AiAssistant'
    id: string
    name: string
    iconUrl?: string | null
    description?: string | null
    ownerId: string
    languageModel?: string | null
    updatedAt?: string | null
    baseCases: Array<{
      __typename?: 'AiAssistantBaseCase'
      id?: string | null
      sequence?: number | null
      condition?: string | null
      instruction?: string | null
    }>
    participants: Array<{ __typename?: 'User'; id: string; name?: string | null; username: string }>
  } | null
  aiLibraryUsage: Array<{
    __typename?: 'AiLibraryUsage'
    id: string
    assistantId: string
    libraryId: string
    usedFor?: string | null
    library: { __typename?: 'AiLibrary'; id: string; name: string }
  }>
}

export type AssistantBaseFragment = {
  __typename?: 'AiAssistant'
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
  updatedAt?: string | null
  ownerId: string
}

export type AiAssistantCardsQueryVariables = Exact<{ [key: string]: never }>

export type AiAssistantCardsQuery = {
  __typename?: 'Query'
  aiAssistants: Array<{
    __typename?: 'AiAssistant'
    id: string
    name: string
    description?: string | null
    iconUrl?: string | null
    updatedAt?: string | null
    ownerId: string
  }>
}

export type ConversationForm_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
  assistants: Array<{ __typename?: 'AiAssistant'; id: string; name: string }>
}

export type ConversationHistory_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
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
}

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

export type DeleteMessageMutationVariables = Exact<{
  messageId: Scalars['String']['input']
}>

export type DeleteMessageMutation = {
  __typename?: 'Mutation'
  deleteMessage?: { __typename?: 'AiConversationMessage'; id: string } | null
}

export type ConversationParticipantsDialogButton_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
  participants: Array<
    | { __typename?: 'AssistantParticipant'; id: string; userId?: string | null; assistantId?: string | null }
    | { __typename?: 'HumanParticipant'; id: string; userId?: string | null; assistantId?: string | null }
  >
}

export type ConversationParticipantsDialogButton_AssistantFragment = {
  __typename?: 'AiAssistant'
  id: string
  name: string
}

export type ConversationParticipants_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
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
}

export type ConversationParticipants_AssistantFragment = { __typename?: 'AiAssistant'; id: string; name: string }

export type ConversationSelector_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
  owner: { __typename?: 'User'; id: string; name?: string | null }
  assistants: Array<{ __typename?: 'AiAssistant'; id: string; name: string }>
}

export type ConversationDelete_ConversationFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
  assistants: Array<{ __typename?: 'AiAssistant'; name: string }>
  participants: Array<
    | { __typename?: 'AssistantParticipant'; id: string; userId?: string | null }
    | { __typename?: 'HumanParticipant'; id: string; userId?: string | null }
  >
}

export type ConversationDetailFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
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
  assistants: Array<{ __typename?: 'AiAssistant'; name: string; id: string }>
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
}

export type GetConversationQueryVariables = Exact<{
  conversationId: Scalars['String']['input']
}>

export type GetConversationQuery = {
  __typename?: 'Query'
  aiConversation?: {
    __typename?: 'AiConversation'
    id: string
    ownerId: string
    createdAt: string
    updatedAt?: string | null
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
    assistants: Array<{ __typename?: 'AiAssistant'; name: string; id: string }>
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
  } | null
}

export type ConversationBaseFragment = {
  __typename?: 'AiConversation'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
}

export type GetUserConversationsQueryVariables = Exact<{ [key: string]: never }>

export type GetUserConversationsQuery = {
  __typename?: 'Query'
  aiConversations: Array<{
    __typename?: 'AiConversation'
    id: string
    ownerId: string
    createdAt: string
    updatedAt?: string | null
    owner: { __typename?: 'User'; id: string; name?: string | null }
    assistants: Array<{ __typename?: 'AiAssistant'; id: string; name: string }>
  }>
}

export type NewConversationSelector_AssistantFragment = { __typename?: 'AiAssistant'; id: string; name: string }

export type CreateContactRequestMutationVariables = Exact<{
  name: Scalars['String']['input']
  emailOrPhone: Scalars['String']['input']
  message: Scalars['String']['input']
}>

export type CreateContactRequestMutation = { __typename?: 'Mutation'; createContactRequest: boolean }

export type VersionQueryVariables = Exact<{ [key: string]: never }>

export type VersionQuery = { __typename?: 'Query'; version?: string | null }

export type CreateAiLibraryCrawlerMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
  data: AiLibraryCrawlerInput
}>

export type CreateAiLibraryCrawlerMutation = {
  __typename?: 'Mutation'
  createAiLibraryCrawler?: { __typename?: 'AiLibraryCrawler'; id: string } | null
}

export type CrawlerTable_LibraryCrawlerFragment = {
  __typename?: 'AiLibraryCrawler'
  id: string
  url: string
  maxDepth: number
  maxPages: number
  filesCount: number
  isRunning: boolean
  lastRun?: {
    __typename?: 'AiLibraryCrawlerRun'
    startedAt: string
    success?: boolean | null
    errorMessage?: string | null
  } | null
  cronJob?: {
    __typename?: 'AiLibraryCrawlerCronJob'
    cronExpression?: string | null
    id: string
    active: boolean
    hour: number
    minute: number
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  } | null
}

export type DeleteCrawlerMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DeleteCrawlerMutation = {
  __typename?: 'Mutation'
  deleteAiLibraryCrawler?: { __typename?: 'AiLibraryCrawler'; id: string } | null
}

export type GetCrawlerRunQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
  crawlerRunId: Scalars['String']['input']
  skipUpdates: Scalars['Int']['input']
  takeUpdates: Scalars['Int']['input']
}>

export type GetCrawlerRunQuery = {
  __typename?: 'Query'
  aiLibraryCrawlerRun: {
    __typename?: 'AiLibraryCrawlerRun'
    id: string
    startedAt: string
    endedAt?: string | null
    success?: boolean | null
    errorMessage?: string | null
    runByUserId?: string | null
    updatesCount: number
    updates: Array<{
      __typename?: 'AiLibraryUpdate'
      id: string
      success: boolean
      createdAt: string
      message?: string | null
      file?: {
        __typename?: 'AiLibraryFile'
        id: string
        name: string
        originUri?: string | null
        mimeType: string
        size?: number | null
      } | null
    }>
  }
}

export type GetCrawlerRunsQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
  crawlerId: Scalars['String']['input']
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
}>

export type GetCrawlerRunsQuery = {
  __typename?: 'Query'
  aiLibraryCrawler: {
    __typename?: 'AiLibraryCrawler'
    id: string
    runs: Array<{
      __typename?: 'AiLibraryCrawlerRun'
      id: string
      startedAt: string
      endedAt?: string | null
      success?: boolean | null
    }>
  }
}

export type GetCrawlerQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
  crawlerId: Scalars['String']['input']
}>

export type GetCrawlerQuery = {
  __typename?: 'Query'
  aiLibraryCrawler: {
    __typename?: 'AiLibraryCrawler'
    id: string
    url: string
    isRunning: boolean
    filesCount: number
    runCount: number
    maxDepth: number
    maxPages: number
    lastRun?: {
      __typename?: 'AiLibraryCrawlerRun'
      id: string
      startedAt: string
      endedAt?: string | null
      success?: boolean | null
      errorMessage?: string | null
    } | null
    cronJob?: {
      __typename?: 'AiLibraryCrawlerCronJob'
      id: string
      active: boolean
      hour: number
      minute: number
      monday: boolean
      tuesday: boolean
      wednesday: boolean
      thursday: boolean
      friday: boolean
      saturday: boolean
      sunday: boolean
    } | null
  }
}

export type CrawlerTableQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type CrawlerTableQuery = {
  __typename?: 'Query'
  aiLibrary: {
    __typename?: 'AiLibrary'
    crawlers: Array<{
      __typename?: 'AiLibraryCrawler'
      id: string
      url: string
      maxDepth: number
      maxPages: number
      filesCount: number
      isRunning: boolean
      lastRun?: {
        __typename?: 'AiLibraryCrawlerRun'
        startedAt: string
        success?: boolean | null
        errorMessage?: string | null
      } | null
      cronJob?: {
        __typename?: 'AiLibraryCrawlerCronJob'
        cronExpression?: string | null
        id: string
        active: boolean
        hour: number
        minute: number
        monday: boolean
        tuesday: boolean
        wednesday: boolean
        thursday: boolean
        friday: boolean
        saturday: boolean
        sunday: boolean
      } | null
    }>
  }
}

export type RunCrawlerButton_CrawlerFragment = { __typename?: 'AiLibraryCrawler'; id: string; isRunning: boolean }

export type RunCrawlerMutationVariables = Exact<{
  crawlerId: Scalars['String']['input']
}>

export type RunCrawlerMutation = {
  __typename?: 'Mutation'
  runAiLibraryCrawler?: {
    __typename?: 'AiLibraryCrawler'
    id: string
    lastRun?: { __typename?: 'AiLibraryCrawlerRun'; startedAt: string } | null
  } | null
}

export type StopCrawlerMutationVariables = Exact<{
  crawlerId: Scalars['String']['input']
}>

export type StopCrawlerMutation = {
  __typename?: 'Mutation'
  stopAiLibraryCrawler?: {
    __typename?: 'AiLibraryCrawler'
    id: string
    lastRun?: { __typename?: 'AiLibraryCrawlerRun'; startedAt: string } | null
  } | null
}

export type UpdateCrawlerButton_CrawlerFragment = {
  __typename?: 'AiLibraryCrawler'
  id: string
  url: string
  maxDepth: number
  maxPages: number
  cronJob?: {
    __typename?: 'AiLibraryCrawlerCronJob'
    id: string
    active: boolean
    hour: number
    minute: number
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  } | null
}

export type UpdateAiLibraryCrawlerMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiLibraryCrawlerInput
}>

export type UpdateAiLibraryCrawlerMutation = {
  __typename?: 'Mutation'
  updateAiLibraryCrawler?: { __typename?: 'AiLibraryCrawler'; id: string } | null
}

export type DropFileMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DropFileMutation = {
  __typename?: 'Mutation'
  dropFile: { __typename?: 'AiLibraryFile'; id: string; name: string }
}

export type ReprocessFileMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type ReprocessFileMutation = {
  __typename?: 'Mutation'
  processFile: {
    __typename?: 'AiLibraryFile'
    id: string
    name: string
    chunks?: number | null
    size?: number | null
    uploadedAt?: string | null
    processedAt?: string | null
    processingErrorMessage?: string | null
  }
}

export type ClearEmbeddedFilesMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type ClearEmbeddedFilesMutation = { __typename?: 'Mutation'; clearEmbeddedFiles?: boolean | null }

export type ProcessUnprocessedFilesMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type ProcessUnprocessedFilesMutation = {
  __typename?: 'Mutation'
  processUnprocessedFiles?: Array<string> | null
}

export type PrepareDesktopFileMutationVariables = Exact<{
  file: AiLibraryFileInput
}>

export type PrepareDesktopFileMutation = {
  __typename?: 'Mutation'
  prepareFile?: { __typename?: 'AiLibraryFile'; id: string } | null
}

export type CancelFileUploadMutationVariables = Exact<{
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}>

export type CancelFileUploadMutation = { __typename?: 'Mutation'; cancelFileUpload: boolean }

export type AiLibraryFile_TableItemFragment = {
  __typename?: 'AiLibraryFile'
  id: string
  libraryId: string
  name: string
  originUri?: string | null
  mimeType: string
  size?: number | null
  chunks?: number | null
  uploadedAt?: string | null
  processedAt?: string | null
  processingErrorMessage?: string | null
  dropError?: string | null
}

export type GetFileChunksQueryVariables = Exact<{
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
}>

export type GetFileChunksQuery = {
  __typename?: 'Query'
  aiFileChunks: {
    __typename?: 'FileChunkQueryResponse'
    fileId: string
    fileName?: string | null
    take: number
    skip: number
    count: number
    chunks: Array<{
      __typename?: 'FileChunk'
      id: string
      text: string
      section: string
      headingPath: string
      chunkIndex: number
      subChunkIndex: number
    }>
  }
}

export type GetFileContentQueryVariables = Exact<{
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}>

export type GetFileContentQuery = { __typename?: 'Query'; readFileMarkdown: string }

export type GetFileInfoQueryVariables = Exact<{
  fileId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}>

export type GetFileInfoQuery = {
  __typename?: 'Query'
  aiLibraryFile: {
    __typename?: 'AiLibraryFile'
    id: string
    name: string
    originUri?: string | null
    docPath?: string | null
    mimeType: string
    size?: number | null
    createdAt: string
    updatedAt?: string | null
    processedAt?: string | null
    processingErrorMessage?: string | null
  }
}

export type EmbeddingsTableQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
}>

export type EmbeddingsTableQuery = {
  __typename?: 'Query'
  aiLibraryFiles: {
    __typename?: 'AiLibraryFileQueryResult'
    libraryId: string
    take: number
    skip: number
    count: number
    library: { __typename?: 'AiLibrary'; name: string }
    files: Array<{
      __typename?: 'AiLibraryFile'
      id: string
      libraryId: string
      name: string
      originUri?: string | null
      mimeType: string
      size?: number | null
      chunks?: number | null
      uploadedAt?: string | null
      processedAt?: string | null
      processingErrorMessage?: string | null
      dropError?: string | null
    }>
  }
}

export type UnprocessedFileCountQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type UnprocessedFileCountQuery = { __typename?: 'Query'; unprocessedFileCount: number }

export type AiLibraryBaseFragment = {
  __typename?: 'AiLibrary'
  id: string
  name: string
  createdAt: string
  updatedAt: string
  owner: { __typename?: 'User'; name?: string | null }
}

export type AiLibrariesQueryVariables = Exact<{ [key: string]: never }>

export type AiLibrariesQuery = {
  __typename?: 'Query'
  aiLibraries: Array<{
    __typename?: 'AiLibrary'
    id: string
    name: string
    createdAt: string
    updatedAt: string
    owner: { __typename?: 'User'; name?: string | null }
  }>
}

export type AiLibraryDetailFragment = {
  __typename?: 'AiLibrary'
  ownerId: string
  filesCount: number
  description?: string | null
  id: string
  name: string
  createdAt: string
  updatedAt: string
  owner: { __typename?: 'User'; name?: string | null }
}

export type AiLibraryDetailQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type AiLibraryDetailQuery = {
  __typename?: 'Query'
  aiLibrary: {
    __typename?: 'AiLibrary'
    ownerId: string
    filesCount: number
    description?: string | null
    id: string
    name: string
    createdAt: string
    updatedAt: string
    participants: Array<{ __typename?: 'User'; id: string; name?: string | null; username: string }>
    owner: { __typename?: 'User'; name?: string | null }
  }
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
  processFile: {
    __typename?: 'AiLibraryFile'
    id: string
    chunks?: number | null
    size?: number | null
    uploadedAt?: string | null
    processedAt?: string | null
  }
}

export type DropFilesMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type DropFilesMutation = {
  __typename?: 'Mutation'
  dropFiles: Array<{ __typename?: 'AiLibraryFile'; id: string; libraryId: string }>
}

export type DeleteAiLibraryMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DeleteAiLibraryMutation = { __typename?: 'Mutation'; deleteAiLibrary?: boolean | null }

export type CreateAiLibraryMutationVariables = Exact<{
  data: AiLibraryInput
}>

export type CreateAiLibraryMutation = {
  __typename?: 'Mutation'
  createAiLibrary?: { __typename?: 'AiLibrary'; id: string; name: string } | null
}

export type LibraryParticipantsDialogButton_LibraryFragment = {
  __typename?: 'AiLibrary'
  id: string
  ownerId: string
  participants: Array<{ __typename?: 'User'; id: string }>
}

export type LibraryParticipants_LibraryFragment = {
  __typename?: 'AiLibrary'
  id: string
  ownerId: string
  participants: Array<{ __typename?: 'User'; id: string; name?: string | null; username: string }>
}

export type QueryLibraryFilesQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
  query: Scalars['String']['input']
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
}>

export type QueryLibraryFilesQuery = {
  __typename?: 'Query'
  queryAiLibraryFiles: {
    __typename?: 'AiLibraryQueryResult'
    libraryId: string
    query: string
    take: number
    skip: number
    hitCount: number
    hits: Array<{
      __typename?: 'AiLibraryQueryHit'
      pageContent: string
      docName: string
      docId: string
      id: string
      docPath: string
      originUri: string
      highlights: Array<{ __typename?: 'AiLibraryQueryHitHighlight'; field: string; snippet?: string | null }>
    }>
  }
}

export type LibraryUpdatesListQueryVariables = Exact<{
  libraryId: Scalars['ID']['input']
  crawlerId?: InputMaybe<Scalars['ID']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
}>

export type LibraryUpdatesListQuery = {
  __typename?: 'Query'
  aiLibraryUpdates: {
    __typename?: 'AiLibraryUpdateQueryResult'
    libraryId: string
    crawlerId?: string | null
    take: number
    skip: number
    count: number
    library: { __typename?: 'AiLibrary'; name: string }
    updates: Array<{
      __typename?: 'AiLibraryUpdate'
      id: string
      createdAt: string
      libraryId: string
      crawlerRunId?: string | null
      fileId?: string | null
      success: boolean
      message?: string | null
      crawlerRun?: {
        __typename?: 'AiLibraryCrawlerRun'
        id: string
        crawlerId: string
        crawler: { __typename?: 'AiLibraryCrawler'; id: string; url: string }
      } | null
      file?: { __typename?: 'AiLibraryFile'; id: string; name: string } | null
    }>
  }
}

export type AiLibraryUpdate_TableItemFragment = {
  __typename?: 'AiLibraryUpdate'
  id: string
  createdAt: string
  libraryId: string
  crawlerRunId?: string | null
  fileId?: string | null
  success: boolean
  message?: string | null
  crawlerRun?: {
    __typename?: 'AiLibraryCrawlerRun'
    id: string
    crawlerId: string
    crawler: { __typename?: 'AiLibraryCrawler'; id: string; url: string }
  } | null
  file?: { __typename?: 'AiLibraryFile'; id: string; name: string } | null
}

export type AiModelsQueryVariables = Exact<{ [key: string]: never }>

export type AiModelsQuery = {
  __typename?: 'Query'
  aiModels: Array<{ __typename?: 'AiModel'; modelName: string; title: string }>
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
  activationDate?: string | null
  expiresAt?: string | null
  business?: string | null
  position?: string | null
}

export type SaveUserProfileMutationVariables = Exact<{
  profileId: Scalars['String']['input']
  userProfileInput: UserProfileInput
}>

export type SaveUserProfileMutation = {
  __typename?: 'Mutation'
  updateUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type ChangeAiLibraryMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiLibraryInput
}>

export type ChangeAiLibraryMutation = {
  __typename?: 'Mutation'
  updateAiLibrary?: { __typename?: 'AiLibrary'; id: string; name: string } | null
}

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>

export type UserProfileQuery = {
  __typename?: 'Query'
  userProfile?: {
    __typename?: 'UserProfile'
    id: string
    confirmationDate?: string | null
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
    activationDate?: string | null
    expiresAt?: string | null
    business?: string | null
    position?: string | null
  } | null
}

export type AddAssistantParticipantMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type AddAssistantParticipantMutation = {
  __typename?: 'Mutation'
  addAssistantParticipants: Array<{ __typename?: 'User'; id: string }>
}

export type RemoveAssistantParticipantMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
  userId: Scalars['String']['input']
}>

export type RemoveAssistantParticipantMutation = {
  __typename?: 'Mutation'
  removeAssistantParticipant: { __typename?: 'User'; id: string }
}

export type LeaveAssistantParticipantMutationVariables = Exact<{
  assistantId: Scalars['String']['input']
}>

export type LeaveAssistantParticipantMutation = {
  __typename?: 'Mutation'
  leaveAssistantParticipant?: { __typename?: 'User'; id: string } | null
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
    types: Array<{
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
        args: Array<{
          __typename?: '__InputValue'
          name: string
          description?: string | null
          defaultValue?: string | null
          type: {
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
          }
        }>
        type: {
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
        }
      }> | null
      inputFields?: Array<{
        __typename?: '__InputValue'
        name: string
        description?: string | null
        defaultValue?: string | null
        type: {
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
        }
      }> | null
      interfaces?: Array<{
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
      }> | null
      enumValues?: Array<{
        __typename?: '__EnumValue'
        name: string
        description?: string | null
        isDeprecated: boolean
        deprecationReason?: string | null
      }> | null
      possibleTypes?: Array<{
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
      }> | null
    }>
    directives: Array<{
      __typename?: '__Directive'
      name: string
      description?: string | null
      locations: Array<__DirectiveLocation>
      args: Array<{
        __typename?: '__InputValue'
        name: string
        description?: string | null
        defaultValue?: string | null
        type: {
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
        }
      }>
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
    args: Array<{
      __typename?: '__InputValue'
      name: string
      description?: string | null
      defaultValue?: string | null
      type: {
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
      }
    }>
    type: {
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
    }
  }> | null
  inputFields?: Array<{
    __typename?: '__InputValue'
    name: string
    description?: string | null
    defaultValue?: string | null
    type: {
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
    }
  }> | null
  interfaces?: Array<{
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
  }> | null
  enumValues?: Array<{
    __typename?: '__EnumValue'
    name: string
    description?: string | null
    isDeprecated: boolean
    deprecationReason?: string | null
  }> | null
  possibleTypes?: Array<{
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
  }> | null
}

export type InputValueFragment = {
  __typename?: '__InputValue'
  name: string
  description?: string | null
  defaultValue?: string | null
  type: {
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
  }
}

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
}

export type AddConversationParticipantMutationVariables = Exact<{
  conversationId: Scalars['String']['input']
  userIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>
  assistantIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>
}>

export type AddConversationParticipantMutation = {
  __typename?: 'Mutation'
  addConversationParticipants?: Array<
    { __typename?: 'AssistantParticipant'; id: string } | { __typename?: 'HumanParticipant'; id: string }
  > | null
}

export type RemoveConversationParticipantMutationVariables = Exact<{
  participantId: Scalars['String']['input']
}>

export type RemoveConversationParticipantMutation = {
  __typename?: 'Mutation'
  removeConversationParticipant?:
    | { __typename?: 'AssistantParticipant'; id: string }
    | { __typename?: 'HumanParticipant'; id: string }
    | null
}

export type CreateConversationInvitationsMutationVariables = Exact<{
  conversationId: Scalars['String']['input']
  data: Array<ConversationInvitationInput> | ConversationInvitationInput
}>

export type CreateConversationInvitationsMutation = {
  __typename?: 'Mutation'
  createConversationInvitations?: { __typename?: 'AiConversation'; id: string } | null
}

export type ConfirmInvitationMutationVariables = Exact<{
  conversationId: Scalars['String']['input']
  invitationId: Scalars['String']['input']
}>

export type ConfirmInvitationMutation = {
  __typename?: 'Mutation'
  confirmConversationInvitation?: { __typename?: 'AiConversation'; id: string } | null
}

export type SendMessageMutationVariables = Exact<{
  data: AiConversationMessageInput
}>

export type SendMessageMutation = {
  __typename?: 'Mutation'
  sendMessage: Array<{ __typename?: 'AiConversationMessage'; id: string; createdAt: string }>
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

export type DeleteConversationsMutationVariables = Exact<{
  conversationIds: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type DeleteConversationsMutation = { __typename?: 'Mutation'; deleteAiConversations: boolean }

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

export type AddLibraryParticipantMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type AddLibraryParticipantMutation = {
  __typename?: 'Mutation'
  addLibraryParticipants: Array<{ __typename?: 'User'; id: string }>
}

export type RemoveLibraryParticipantMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
  userId: Scalars['String']['input']
}>

export type RemoveLibraryParticipantMutation = {
  __typename?: 'Mutation'
  removeLibraryParticipant: { __typename?: 'User'; id: string }
}

export type LeaveLibraryParticipantMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type LeaveLibraryParticipantMutation = {
  __typename?: 'Mutation'
  leaveLibraryParticipant?: { __typename?: 'User'; id: string } | null
}

export type UserFragment = {
  __typename?: 'User'
  id: string
  username: string
  name?: string | null
  createdAt: string
  email: string
  isAdmin: boolean
  profile?: {
    __typename?: 'UserProfile'
    firstName?: string | null
    lastName?: string | null
    business?: string | null
    position?: string | null
    confirmationDate?: string | null
    activationDate?: string | null
  } | null
}

export type UsersQueryVariables = Exact<{ [key: string]: never }>

export type UsersQuery = {
  __typename?: 'Query'
  users: Array<{
    __typename?: 'User'
    id: string
    username: string
    name?: string | null
    createdAt: string
    email: string
    isAdmin: boolean
    profile?: {
      __typename?: 'UserProfile'
      firstName?: string | null
      lastName?: string | null
      business?: string | null
      position?: string | null
      confirmationDate?: string | null
      activationDate?: string | null
    } | null
  }>
}

export type SendConfirmationMailMutationVariables = Exact<{
  confirmationUrl: Scalars['String']['input']
  activationUrl: Scalars['String']['input']
}>

export type SendConfirmationMailMutation = { __typename?: 'Mutation'; sendConfirmationMail?: boolean | null }

export type ConfirmUserProfileMutationVariables = Exact<{
  profileId: Scalars['String']['input']
}>

export type ConfirmUserProfileMutation = {
  __typename?: 'Mutation'
  confirmUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type UserProfileFragment = {
  __typename?: 'UserProfile'
  id: string
  userId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  business?: string | null
  position?: string | null
  freeMessages: number
  usedMessages?: number | null
  freeStorage: number
  usedStorage?: number | null
  createdAt: string
  updatedAt?: string | null
  confirmationDate?: string | null
  activationDate?: string | null
  expiresAt?: string | null
}

export type GetUserProfileQueryVariables = Exact<{ [key: string]: never }>

export type GetUserProfileQuery = {
  __typename?: 'Query'
  userProfile?: {
    __typename?: 'UserProfile'
    id: string
    userId: string
    email: string
    firstName?: string | null
    lastName?: string | null
    business?: string | null
    position?: string | null
    freeMessages: number
    usedMessages?: number | null
    freeStorage: number
    usedStorage?: number | null
    createdAt: string
    updatedAt?: string | null
    confirmationDate?: string | null
    activationDate?: string | null
    expiresAt?: string | null
  } | null
}

export type UpdateUserProfileMutationVariables = Exact<{
  profileId: Scalars['String']['input']
  userProfileInput: UserProfileInput
}>

export type UpdateUserProfileMutation = {
  __typename?: 'Mutation'
  updateUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type ActivateUserProfileMutationVariables = Exact<{
  profileId: Scalars['String']['input']
}>

export type ActivateUserProfileMutation = {
  __typename?: 'Mutation'
  activateUserProfile?: { __typename?: 'UserProfile'; id: string } | null
}

export type AdminUserByIdQueryVariables = Exact<{
  email: Scalars['String']['input']
}>

export type AdminUserByIdQuery = {
  __typename?: 'Query'
  user?: {
    __typename?: 'User'
    id: string
    username: string
    name?: string | null
    createdAt: string
    email: string
    isAdmin: boolean
    profile?: {
      __typename?: 'UserProfile'
      firstName?: string | null
      lastName?: string | null
      business?: string | null
      position?: string | null
      confirmationDate?: string | null
      activationDate?: string | null
      id: string
      userId: string
      email: string
      freeMessages: number
      usedMessages?: number | null
      freeStorage: number
      usedStorage?: number | null
      createdAt: string
      updatedAt?: string | null
      expiresAt?: string | null
    } | null
  } | null
}

export const ManagedUserFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ManagedUser' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ManagedUser' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isAdmin' } },
          { kind: 'Field', name: { kind: 'Name', value: 'registered' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
          { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManagedUserFragment, unknown>
export const QuestionCard_QuestionFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'QuestionCard_Question' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActQuestion' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'title' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
          { kind: 'Field', name: { kind: 'Name', value: 'value' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'hint' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'options' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'title' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
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
} as unknown as DocumentNode<QuestionCard_QuestionFragment, unknown>
export const AssistantSurvey_AssessmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantSurvey_Assessment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActAssessment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistantSurvey' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'actionsTitle' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'actions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'questions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'QuestionCard_Question' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'title' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'percentCompleted' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hint' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'riskIndicator' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'level' } },
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
      name: { kind: 'Name', value: 'QuestionCard_Question' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActQuestion' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'title' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
          { kind: 'Field', name: { kind: 'Name', value: 'value' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'hint' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'options' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'title' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
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
} as unknown as DocumentNode<AssistantSurvey_AssessmentFragment, unknown>
export const ComplianceArea_ComplianceFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ComplianceArea_Compliance' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActComplianceArea' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'title' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'description' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'mandatory' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ComplianceArea_ComplianceFragment, unknown>
export const RiskAreasIdentification_AssessmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RiskAreasIdentification_Assessment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActAssessment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'identifyRiskInfo' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'title' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'legalDisclaimer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'title' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'text' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'complianceAreas' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ComplianceArea_Compliance' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistantSurvey' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'questions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'title' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'options' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'title' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'en' } },
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
                  kind: 'Field',
                  name: { kind: 'Name', value: 'riskIndicator' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'factors' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'level' } },
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
      name: { kind: 'Name', value: 'ComplianceArea_Compliance' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActComplianceArea' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'title' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'description' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'mandatory' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RiskAreasIdentification_AssessmentFragment, unknown>
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
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantForm_AssistantFragment, unknown>
export const AssistantLibraries_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantLibraries_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantLibraries_AssistantFragment, unknown>
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
export const AssistantParticipantsDialogButton_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantParticipantsDialogButton_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantParticipantsDialogButton_AssistantFragment, unknown>
export const AssistantParticipants_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantParticipants_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantParticipantsDialogButton_Assistant' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantParticipantsDialogButton_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantParticipants_AssistantFragment, unknown>
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
export const AssistantBaseFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssistantBaseFragment, unknown>
export const ConversationParticipantsDialogButton_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Assistant' },
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
} as unknown as DocumentNode<ConversationParticipantsDialogButton_AssistantFragment, unknown>
export const ConversationParticipants_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipants_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Assistant' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Assistant' },
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
export const ConversationBaseFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationBaseFragment, unknown>
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationSelector_ConversationFragment, unknown>
export const ConversationParticipantsDialogButton_ConversationFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationParticipantsDialogButton_ConversationFragment, unknown>
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          {
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationDelete_ConversationFragment, unknown>
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationHistory_ConversationFragment, unknown>
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConversationForm_ConversationFragment, unknown>
export const ConversationDetailFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationDetail' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationParticipants_Conversation' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationDelete_Conversation' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationHistory_Conversation' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationForm_Conversation' } },
          {
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          {
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
          },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
} as unknown as DocumentNode<ConversationDetailFragment, unknown>
export const NewConversationSelector_AssistantFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NewConversationSelector_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Assistant' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Assistant' },
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
export const RunCrawlerButton_CrawlerFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RunCrawlerButton_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RunCrawlerButton_CrawlerFragment, unknown>
export const UpdateCrawlerButton_CrawlerFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UpdateCrawlerButton_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cronJob' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'active' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hour' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minute' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tuesday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wednesday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'thursday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'friday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'saturday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sunday' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCrawlerButton_CrawlerFragment, unknown>
export const CrawlerTable_LibraryCrawlerFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CrawlerTable_LibraryCrawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastRun' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cronJob' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'cronExpression' } }],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RunCrawlerButton_Crawler' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UpdateCrawlerButton_Crawler' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RunCrawlerButton_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UpdateCrawlerButton_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cronJob' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'active' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hour' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minute' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tuesday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wednesday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'thursday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'friday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'saturday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sunday' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CrawlerTable_LibraryCrawlerFragment, unknown>
export const AiLibraryFile_TableItemFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_TableItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
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
} as unknown as DocumentNode<AiLibraryFile_TableItemFragment, unknown>
export const AiLibraryBaseFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryBaseFragment, unknown>
export const AiLibraryDetailFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryDetail' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryDetailFragment, unknown>
export const LibraryParticipantsDialogButton_LibraryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryParticipantsDialogButton_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
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
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LibraryParticipantsDialogButton_LibraryFragment, unknown>
export const LibraryParticipants_LibraryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryParticipants_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'LibraryParticipantsDialogButton_Library' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryParticipantsDialogButton_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
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
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LibraryParticipants_LibraryFragment, unknown>
export const AiLibraryUpdate_TableItemFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryUpdate_TableItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryUpdate' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'crawlerRunId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'crawlerRun' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'crawlerId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'crawler' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'file' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'success' } },
          { kind: 'Field', name: { kind: 'Name', value: 'message' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryUpdate_TableItemFragment, unknown>
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
          { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
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
export const UserFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'User' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isAdmin' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserFragment, unknown>
export const UserProfileFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserProfile' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'UserProfile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProfileFragment, unknown>
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
                { kind: 'Field', name: { kind: 'Name', value: 'isAdmin' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>
export const EnsureUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ensureUserProfile' },
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
            name: { kind: 'Name', value: 'ensureUserProfile' },
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
} as unknown as DocumentNode<EnsureUserProfileMutation, EnsureUserProfileMutationVariables>
export const GetManagedUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getManagedUsers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'statusFilter' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'managedUsers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'statusFilter' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'statusFilter' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                { kind: 'Field', name: { kind: 'Name', value: 'take' } },
                { kind: 'Field', name: { kind: 'Name', value: 'filter' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'userStatistics' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'total' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'confirmed' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'unconfirmed' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'activated' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'unactivated' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'users' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ManagedUser' } }],
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
      name: { kind: 'Name', value: 'ManagedUser' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ManagedUser' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isAdmin' } },
          { kind: 'Field', name: { kind: 'Name', value: 'registered' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
          { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetManagedUsersQuery, GetManagedUsersQueryVariables>
export const ToggleAdminStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'toggleAdminStatus' },
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
            name: { kind: 'Name', value: 'toggleAdminStatus' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'isAdmin' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ToggleAdminStatusMutation, ToggleAdminStatusMutationVariables>
export const AiActAssessmentQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AiActAssessmentQuery' },
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
            name: { kind: 'Name', value: 'aiActAssessment' },
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
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RiskAreasIdentification_Assessment' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantSurvey_Assessment' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ComplianceArea_Compliance' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActComplianceArea' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'title' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'description' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'mandatory' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'QuestionCard_Question' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActQuestion' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'title' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
          { kind: 'Field', name: { kind: 'Name', value: 'value' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'hint' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                { kind: 'Field', name: { kind: 'Name', value: 'en' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'options' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'title' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
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
      name: { kind: 'Name', value: 'RiskAreasIdentification_Assessment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActAssessment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'identifyRiskInfo' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'title' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'legalDisclaimer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'title' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'text' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'complianceAreas' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ComplianceArea_Compliance' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistantSurvey' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'questions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'title' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'options' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'title' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'en' } },
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
                  kind: 'Field',
                  name: { kind: 'Name', value: 'riskIndicator' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'factors' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'level' } },
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
      name: { kind: 'Name', value: 'AssistantSurvey_Assessment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiActAssessment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistantSurvey' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'actionsTitle' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'actions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'questions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'QuestionCard_Question' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'title' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'percentCompleted' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hint' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'riskIndicator' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'de' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'en' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'level' } },
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
} as unknown as DocumentNode<AiActAssessmentQueryQuery, AiActAssessmentQueryQueryVariables>
export const UpdateAssessmentQuestionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateAssessmentQuestion' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'questionId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'value' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'notes' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAssessmentQuestion' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'questionId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'questionId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'value' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'value' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'notes' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'notes' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateAssessmentQuestionMutation, UpdateAssessmentQuestionMutationVariables>
export const ResetAssessmentAnswersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'resetAssessmentAnswers' },
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
            name: { kind: 'Name', value: 'resetAssessmentAnswers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResetAssessmentAnswersMutation, ResetAssessmentAnswersMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
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
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantForm_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantSelector_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantLibraries_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantBasecaseForm_Assistant' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantParticipants_Assistant' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraryUsage' },
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
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantLibraries_LibraryUsage' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantParticipantsDialogButton_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
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
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
        ],
      },
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
      name: { kind: 'Name', value: 'AssistantParticipants_Assistant' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantParticipantsDialogButton_Assistant' } },
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
  ],
} as unknown as DocumentNode<AiAssistantDetailsQuery, AiAssistantDetailsQueryVariables>
export const AiAssistantCardsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiAssistantCards' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiAssistants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AssistantBase' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AssistantBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiAssistantCardsQuery, AiAssistantCardsQueryVariables>
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
export const DeleteMessageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteMessage' },
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
            name: { kind: 'Name', value: 'deleteMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'messageId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'messageId' } },
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
} as unknown as DocumentNode<DeleteMessageMutation, DeleteMessageMutationVariables>
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationDetail' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          {
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
          },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
      name: { kind: 'Name', value: 'ConversationDetail' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationParticipants_Conversation' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationDelete_Conversation' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationHistory_Conversation' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationForm_Conversation' } },
          {
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'ConversationParticipantsDialogButton_Conversation' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetConversationQuery, GetConversationQueryVariables>
export const GetUserConversationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getUserConversations' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiConversations' },
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
      name: { kind: 'Name', value: 'ConversationBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiConversation' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ConversationBase' } },
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
export const CreateContactRequestDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createContactRequest' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'emailOrPhone' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'message' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createContactRequest' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'name' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'emailOrPhone' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'emailOrPhone' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'message' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'message' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateContactRequestMutation, CreateContactRequestMutationVariables>
export const VersionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'version' },
      selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: 'version' } }] },
    },
  ],
} as unknown as DocumentNode<VersionQuery, VersionQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawlerInput' } },
          },
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
} as unknown as DocumentNode<CreateAiLibraryCrawlerMutation, CreateAiLibraryCrawlerMutationVariables>
export const DeleteCrawlerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteCrawler' },
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
            name: { kind: 'Name', value: 'deleteAiLibraryCrawler' },
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
} as unknown as DocumentNode<DeleteCrawlerMutation, DeleteCrawlerMutationVariables>
export const GetCrawlerRunDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCrawlerRun' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerRunId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skipUpdates' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'takeUpdates' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraryCrawlerRun' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'crawlerRunId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerRunId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'endedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runByUserId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatesCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'updates' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'take' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'takeUpdates' } },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'skip' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'skipUpdates' } },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'file' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'originUri' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'mimeType' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'size' } },
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
} as unknown as DocumentNode<GetCrawlerRunQuery, GetCrawlerRunQueryVariables>
export const GetCrawlerRunsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCrawlerRuns' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraryCrawler' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'crawlerId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'runs' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'take' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'skip' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'endedAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'success' } },
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
} as unknown as DocumentNode<GetCrawlerRunsQuery, GetCrawlerRunsQueryVariables>
export const GetCrawlerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCrawler' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraryCrawler' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'crawlerId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'lastRun' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'endedAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'cronJob' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'active' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'hour' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'minute' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'monday' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'tuesday' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'wednesday' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'thursday' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'friday' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'saturday' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'sunday' } },
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
} as unknown as DocumentNode<GetCrawlerQuery, GetCrawlerQueryVariables>
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
                name: { kind: 'Name', value: 'libraryId' },
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
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CrawlerTable_LibraryCrawler' } },
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
      name: { kind: 'Name', value: 'RunCrawlerButton_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UpdateCrawlerButton_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cronJob' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'active' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hour' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minute' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tuesday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wednesday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'thursday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'friday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'saturday' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sunday' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CrawlerTable_LibraryCrawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'url' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastRun' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cronJob' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'cronExpression' } }],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RunCrawlerButton_Crawler' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UpdateCrawlerButton_Crawler' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CrawlerTableQuery, CrawlerTableQueryVariables>
export const RunCrawlerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'runCrawler' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'runAiLibraryCrawler' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'crawlerId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'lastRun' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'startedAt' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RunCrawlerMutation, RunCrawlerMutationVariables>
export const StopCrawlerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'stopCrawler' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stopAiLibraryCrawler' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'crawlerId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'lastRun' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'startedAt' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StopCrawlerMutation, StopCrawlerMutationVariables>
export const UpdateAiLibraryCrawlerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateAiLibraryCrawler' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawlerInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAiLibraryCrawler' },
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
} as unknown as DocumentNode<UpdateAiLibraryCrawlerMutation, UpdateAiLibraryCrawlerMutationVariables>
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
} as unknown as DocumentNode<DropFileMutation, DropFileMutationVariables>
export const ReprocessFileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'reprocessFile' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
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
} as unknown as DocumentNode<ReprocessFileMutation, ReprocessFileMutationVariables>
export const ClearEmbeddedFilesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'clearEmbeddedFiles' },
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
} as unknown as DocumentNode<ClearEmbeddedFilesMutation, ClearEmbeddedFilesMutationVariables>
export const ProcessUnprocessedFilesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'processUnprocessedFiles' },
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
            name: { kind: 'Name', value: 'processUnprocessedFiles' },
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
} as unknown as DocumentNode<ProcessUnprocessedFilesMutation, ProcessUnprocessedFilesMutationVariables>
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
            name: { kind: 'Name', value: 'cancelFileUpload' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
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
} as unknown as DocumentNode<CancelFileUploadMutation, CancelFileUploadMutationVariables>
export const GetFileChunksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getFileChunks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiFileChunks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'take' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'chunks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'section' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'headingPath' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'chunkIndex' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'subChunkIndex' } },
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
} as unknown as DocumentNode<GetFileChunksQuery, GetFileChunksQueryVariables>
export const GetFileContentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getFileContent' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
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
            name: { kind: 'Name', value: 'readFileMarkdown' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
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
} as unknown as DocumentNode<GetFileContentQuery, GetFileContentQueryVariables>
export const GetFileInfoDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getFileInfo' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
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
            name: { kind: 'Name', value: 'aiLibraryFile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
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
                { kind: 'Field', name: { kind: 'Name', value: 'docPath' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mimeType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingErrorMessage' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetFileInfoQuery, GetFileInfoQueryVariables>
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          defaultValue: { kind: 'IntValue', value: '0' },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          defaultValue: { kind: 'IntValue', value: '20' },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'library' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'take' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'files' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFile_TableItem' } }],
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
      name: { kind: 'Name', value: 'AiLibraryFile_TableItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
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
} as unknown as DocumentNode<EmbeddingsTableQuery, EmbeddingsTableQueryVariables>
export const UnprocessedFileCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'UnprocessedFileCount' },
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
            name: { kind: 'Name', value: 'unprocessedFileCount' },
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
} as unknown as DocumentNode<UnprocessedFileCountQuery, UnprocessedFileCountQueryVariables>
export const AiLibrariesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiLibraries' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraries' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryBase' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibrariesQuery, AiLibrariesQueryVariables>
export const AiLibraryDetailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiLibraryDetail' },
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
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryDetail' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'LibraryParticipants_Library' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryParticipantsDialogButton_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
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
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryDetail' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryParticipants_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'LibraryParticipantsDialogButton_Library' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryDetailQuery, AiLibraryDetailQueryVariables>
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
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAiLibraryMutation, DeleteAiLibraryMutationVariables>
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
export const QueryLibraryFilesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'queryLibraryFiles' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'queryAiLibraryFiles' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'query' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
                { kind: 'Field', name: { kind: 'Name', value: 'take' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hits' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'pageContent' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'docName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'docId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'docPath' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'originUri' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'highlights' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'field' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'snippet' } },
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
} as unknown as DocumentNode<QueryLibraryFilesQuery, QueryLibraryFilesQueryVariables>
export const LibraryUpdatesListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'libraryUpdatesList' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLibraryUpdates' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'crawlerId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'crawlerId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'library' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'crawlerId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'take' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'updates' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryUpdate_TableItem' } },
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
      name: { kind: 'Name', value: 'AiLibraryUpdate_TableItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryUpdate' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'crawlerRunId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'crawlerRun' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'crawlerId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'crawler' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'file' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'success' } },
          { kind: 'Field', name: { kind: 'Name', value: 'message' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LibraryUpdatesListQuery, LibraryUpdatesListQueryVariables>
export const AiModelsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiModels' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiModels' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'modelName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiModelsQuery, AiModelsQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'profileId' } },
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
                name: { kind: 'Name', value: 'profileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'profileId' } },
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
export const UserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'userProfile' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'userProfile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>
export const AddAssistantParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addAssistantParticipant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userIds' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addAssistantParticipants' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userIds' } },
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
} as unknown as DocumentNode<AddAssistantParticipantMutation, AddAssistantParticipantMutationVariables>
export const RemoveAssistantParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeAssistantParticipant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
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
            name: { kind: 'Name', value: 'removeAssistantParticipant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
              },
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
} as unknown as DocumentNode<RemoveAssistantParticipantMutation, RemoveAssistantParticipantMutationVariables>
export const LeaveAssistantParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'leaveAssistantParticipant' },
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
            name: { kind: 'Name', value: 'leaveAssistantParticipant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assistantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assistantId' } },
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
} as unknown as DocumentNode<LeaveAssistantParticipantMutation, LeaveAssistantParticipantMutationVariables>
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
export const AddConversationParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addConversationParticipant' },
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
} as unknown as DocumentNode<AddConversationParticipantMutation, AddConversationParticipantMutationVariables>
export const RemoveConversationParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeConversationParticipant' },
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
                name: { kind: 'Name', value: 'participantId' },
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
} as unknown as DocumentNode<RemoveConversationParticipantMutation, RemoveConversationParticipantMutationVariables>
export const CreateConversationInvitationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createConversationInvitations' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'ConversationInvitationInput' } },
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
            name: { kind: 'Name', value: 'createConversationInvitations' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'conversationId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
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
} as unknown as DocumentNode<CreateConversationInvitationsMutation, CreateConversationInvitationsMutationVariables>
export const ConfirmInvitationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'confirmInvitation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'invitationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'confirmConversationInvitation' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'conversationId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'conversationId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'invitationId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'invitationId' } },
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
} as unknown as DocumentNode<ConfirmInvitationMutation, ConfirmInvitationMutationVariables>
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
export const DeleteConversationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteConversations' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'conversationIds' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteAiConversations' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'conversationIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'conversationIds' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteConversationsMutation, DeleteConversationsMutationVariables>
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
                name: { kind: 'Name', value: 'participantId' },
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
export const AddLibraryParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addLibraryParticipant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userIds' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addLibraryParticipants' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userIds' } },
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
} as unknown as DocumentNode<AddLibraryParticipantMutation, AddLibraryParticipantMutationVariables>
export const RemoveLibraryParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeLibraryParticipant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
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
            name: { kind: 'Name', value: 'removeLibraryParticipant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
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
} as unknown as DocumentNode<RemoveLibraryParticipantMutation, RemoveLibraryParticipantMutationVariables>
export const LeaveLibraryParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'leaveLibraryParticipant' },
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
            name: { kind: 'Name', value: 'leaveLibraryParticipant' },
            arguments: [
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
} as unknown as DocumentNode<LeaveLibraryParticipantMutation, LeaveLibraryParticipantMutationVariables>
export const UsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'users' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'users' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'User' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'User' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isAdmin' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'confirmationUrl' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'activationUrl' } },
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
                name: { kind: 'Name', value: 'confirmationUrl' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'confirmationUrl' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'activationUrl' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'activationUrl' } },
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
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'userProfile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserProfile' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserProfile' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'UserProfile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedMessages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'freeStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usedStorage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserProfileQuery, GetUserProfileQueryVariables>
export const UpdateUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateUserProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'profileId' } },
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
                name: { kind: 'Name', value: 'profileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'profileId' } },
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
} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>
export const ActivateUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'activateUserProfile' },
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
            name: { kind: 'Name', value: 'activateUserProfile' },
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
} as unknown as DocumentNode<ActivateUserProfileMutation, ActivateUserProfileMutationVariables>
export const AdminUserByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'adminUserById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'email' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'user' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'email' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'email' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'User' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'profile' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserProfileForm_UserProfile' } },
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
      name: { kind: 'Name', value: 'User' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isAdmin' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'confirmationDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'activationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'business' } },
          { kind: 'Field', name: { kind: 'Name', value: 'position' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminUserByIdQuery, AdminUserByIdQueryVariables>
