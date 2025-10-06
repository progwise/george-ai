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
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  url?: Maybe<Scalars['String']['output']>
  users: Array<User>
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

export type AiContentExtractionSubTask = {
  __typename?: 'AiContentExtractionSubTask'
  contentProcessingTask: AiContentProcessingTask
  contentProcessingTaskId: Scalars['String']['output']
  extractionMethod: Scalars['String']['output']
  failedAt?: Maybe<Scalars['DateTime']['output']>
  finishedAt?: Maybe<Scalars['DateTime']['output']>
  id: Scalars['ID']['output']
  markdownFileName?: Maybe<Scalars['String']['output']>
  startedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AiContentProcessingTask = {
  __typename?: 'AiContentProcessingTask'
  chunksCount?: Maybe<Scalars['Int']['output']>
  chunksSize?: Maybe<Scalars['Int']['output']>
  createdAt: Scalars['DateTime']['output']
  embeddingFailedAt?: Maybe<Scalars['DateTime']['output']>
  embeddingFinishedAt?: Maybe<Scalars['DateTime']['output']>
  embeddingModelName?: Maybe<Scalars['String']['output']>
  embeddingStartedAt?: Maybe<Scalars['DateTime']['output']>
  embeddingStatus: EmbeddingStatus
  embeddingTimeMs?: Maybe<Scalars['Int']['output']>
  embeddingTimeout: Scalars['Boolean']['output']
  extractionFailedAt?: Maybe<Scalars['DateTime']['output']>
  extractionFinishedAt?: Maybe<Scalars['DateTime']['output']>
  extractionOptions?: Maybe<Scalars['String']['output']>
  extractionStartedAt?: Maybe<Scalars['DateTime']['output']>
  extractionStatus: ExtractionStatus
  extractionSubTasks: Array<AiContentExtractionSubTask>
  extractionTimeMs?: Maybe<Scalars['Int']['output']>
  extractionTimeout: Scalars['Boolean']['output']
  file: AiLibraryFile
  fileId: Scalars['String']['output']
  id: Scalars['ID']['output']
  library: AiLibrary
  libraryId: Scalars['String']['output']
  metadata?: Maybe<Scalars['String']['output']>
  processingFailedAt?: Maybe<Scalars['DateTime']['output']>
  processingFinishedAt?: Maybe<Scalars['DateTime']['output']>
  processingStartedAt?: Maybe<Scalars['DateTime']['output']>
  processingStatus: ProcessingStatus
  processingTimeMs?: Maybe<Scalars['Int']['output']>
  processingTimeout: Scalars['Boolean']['output']
  timeoutMs?: Maybe<Scalars['Int']['output']>
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

export type AiEnrichmentTask = {
  __typename?: 'AiEnrichmentTask'
  completedAt?: Maybe<Scalars['DateTime']['output']>
  error?: Maybe<Scalars['String']['output']>
  field: AiListField
  fieldId: Scalars['String']['output']
  file: AiLibraryFile
  fileId: Scalars['String']['output']
  id: Scalars['ID']['output']
  list: AiList
  listId: Scalars['String']['output']
  metadata?: Maybe<Scalars['String']['output']>
  priority: Scalars['Int']['output']
  processingData: AiEnrichmentTaskProcessingData
  requestedAt: Scalars['DateTime']['output']
  startedAt?: Maybe<Scalars['DateTime']['output']>
  status: EnrichmentStatus
}

export type AiEnrichmentTaskProcessingData = {
  __typename?: 'AiEnrichmentTaskProcessingData'
  input?: Maybe<AiEnrichmentTaskProcessingDataInput>
  output?: Maybe<AiEnrichmentTaskProcessingDataOutput>
}

export type AiEnrichmentTaskProcessingDataInput = {
  __typename?: 'AiEnrichmentTaskProcessingDataInput'
  aiGenerationPrompt: Scalars['String']['output']
  aiModel: Scalars['String']['output']
  contentQuery?: Maybe<Scalars['String']['output']>
  contextFields: Array<EnrichmentTaskContextField>
  dataType: ListFieldType
  fileId: Scalars['String']['output']
  fileName: Scalars['String']['output']
  libraryEmbeddingModel?: Maybe<Scalars['String']['output']>
  libraryId: Scalars['String']['output']
  libraryName: Scalars['String']['output']
  useVectorStore: Scalars['Boolean']['output']
}

export type AiEnrichmentTaskProcessingDataOutput = {
  __typename?: 'AiEnrichmentTaskProcessingDataOutput'
  aiInstance?: Maybe<Scalars['String']['output']>
  enrichedValue?: Maybe<Scalars['String']['output']>
  issues: Array<Scalars['String']['output']>
  messages: Array<EnrichmentTaskMessage>
  similarChunks?: Maybe<Array<EnrichmentTaskSimilarChunk>>
}

export type AiLibrary = {
  __typename?: 'AiLibrary'
  crawlers: Array<AiLibraryCrawler>
  createdAt: Scalars['DateTime']['output']
  description?: Maybe<Scalars['String']['output']>
  embeddingModelName?: Maybe<Scalars['String']['output']>
  embeddingTimeoutMs?: Maybe<Scalars['Int']['output']>
  fileConverterOptions?: Maybe<Scalars['String']['output']>
  filesCount: Scalars['Int']['output']
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  owner: User
  ownerId: Scalars['String']['output']
  participants: Array<AiLibraryParticipant>
  updatedAt: Scalars['DateTime']['output']
  url?: Maybe<Scalars['String']['output']>
}

export type AiLibraryCrawler = {
  __typename?: 'AiLibraryCrawler'
  allowedMimeTypes?: Maybe<Scalars['String']['output']>
  createdAt: Scalars['DateTime']['output']
  cronJob?: Maybe<AiLibraryCrawlerCronJob>
  excludePatterns?: Maybe<Scalars['String']['output']>
  filesCount: Scalars['Int']['output']
  id: Scalars['ID']['output']
  includePatterns?: Maybe<Scalars['String']['output']>
  isRunning: Scalars['Boolean']['output']
  lastRun?: Maybe<AiLibraryCrawlerRun>
  libraryId: Scalars['String']['output']
  maxDepth: Scalars['Int']['output']
  maxFileSize?: Maybe<Scalars['Int']['output']>
  maxPages: Scalars['Int']['output']
  minFileSize?: Maybe<Scalars['Int']['output']>
  runCount: Scalars['Int']['output']
  runs: Array<AiLibraryCrawlerRun>
  updatedAt: Scalars['DateTime']['output']
  uri: Scalars['String']['output']
  uriType: CrawlerUriType
}

export type AiLibraryCrawlerRunsArgs = {
  skip?: Scalars['Int']['input']
  take?: Scalars['Int']['input']
}

export type AiLibraryCrawlerCredentialsInput = {
  boxCustomerId?: InputMaybe<Scalars['String']['input']>
  boxToken?: InputMaybe<Scalars['String']['input']>
  password?: InputMaybe<Scalars['String']['input']>
  sharepointAuth?: InputMaybe<Scalars['String']['input']>
  username?: InputMaybe<Scalars['String']['input']>
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
  allowedMimeTypes?: InputMaybe<Array<Scalars['String']['input']>>
  cronJob?: InputMaybe<AiLibraryCrawlerCronJobInput>
  excludePatterns?: InputMaybe<Array<Scalars['String']['input']>>
  includePatterns?: InputMaybe<Array<Scalars['String']['input']>>
  maxDepth: Scalars['Int']['input']
  maxFileSize?: InputMaybe<Scalars['Int']['input']>
  maxPages: Scalars['Int']['input']
  minFileSize?: InputMaybe<Scalars['Int']['input']>
  uri: Scalars['String']['input']
  uriType: CrawlerUriType
}

export type AiLibraryCrawlerRun = {
  __typename?: 'AiLibraryCrawlerRun'
  crawler: AiLibraryCrawler
  crawlerId: Scalars['ID']['output']
  endedAt?: Maybe<Scalars['DateTime']['output']>
  errorMessage?: Maybe<Scalars['String']['output']>
  filteredUpdatesCount: Scalars['Int']['output']
  id: Scalars['ID']['output']
  runByUserId?: Maybe<Scalars['ID']['output']>
  startedAt: Scalars['DateTime']['output']
  stoppedByUser?: Maybe<Scalars['DateTime']['output']>
  success?: Maybe<Scalars['Boolean']['output']>
  updateStats: Array<UpdateStats>
  updates: Array<AiLibraryUpdate>
  updatesCount: Scalars['Int']['output']
}

export type AiLibraryCrawlerRunFilteredUpdatesCountArgs = {
  updateTypeFilter?: InputMaybe<Array<Scalars['String']['input']>>
}

export type AiLibraryCrawlerRunUpdatesArgs = {
  skip?: Scalars['Int']['input']
  take?: Scalars['Int']['input']
  updateTypeFilter?: InputMaybe<Array<Scalars['String']['input']>>
}

export type AiLibraryFile = {
  __typename?: 'AiLibraryFile'
  archivedAt?: Maybe<Scalars['DateTime']['output']>
  availableExtractionMarkdownFileNames: Array<Scalars['String']['output']>
  cache: Array<AiListItemCache>
  crawledByCrawler?: Maybe<AiLibraryCrawler>
  crawler?: Maybe<AiLibraryCrawler>
  createdAt: Scalars['DateTime']['output']
  docPath?: Maybe<Scalars['String']['output']>
  dropError?: Maybe<Scalars['String']['output']>
  embeddingStatus: EmbeddingStatus
  extractionStatus: ExtractionStatus
  id: Scalars['ID']['output']
  isLegacyFile: Scalars['Boolean']['output']
  lastEmbedding?: Maybe<AiContentProcessingTask>
  lastExtraction?: Maybe<AiContentProcessingTask>
  lastSuccessfulEmbedding?: Maybe<AiContentProcessingTask>
  lastSuccessfulExtraction?: Maybe<AiContentProcessingTask>
  lastUpdate?: Maybe<AiLibraryUpdate>
  latestExtractionMarkdownFileNames: Array<Scalars['String']['output']>
  library: AiLibrary
  libraryId: Scalars['String']['output']
  markdown?: Maybe<MarkdownResult>
  mimeType: Scalars['String']['output']
  name: Scalars['String']['output']
  originModificationDate?: Maybe<Scalars['DateTime']['output']>
  originUri?: Maybe<Scalars['String']['output']>
  processingStatus: ProcessingStatus
  size?: Maybe<Scalars['Int']['output']>
  sourceFiles: Array<SourceFileLink>
  status: Scalars['String']['output']
  supportedExtractionMethods: Array<Scalars['String']['output']>
  taskCount: Scalars['Int']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  uploadedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AiLibraryFileMarkdownArgs = {
  markdownFileName?: InputMaybe<Scalars['String']['input']>
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
  archivedCount: Scalars['Int']['output']
  count: Scalars['Int']['output']
  files: Array<AiLibraryFile>
  library: AiLibrary
  libraryId: Scalars['String']['output']
  showArchived?: Maybe<Scalars['Boolean']['output']>
  skip: Scalars['Int']['output']
  take: Scalars['Int']['output']
}

export type AiLibraryInput = {
  description?: InputMaybe<Scalars['String']['input']>
  embeddingModelName?: InputMaybe<Scalars['String']['input']>
  embeddingTimeoutMs?: InputMaybe<Scalars['Int']['input']>
  fileConverterOptions?: InputMaybe<Scalars['String']['input']>
  icon?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  url?: InputMaybe<Scalars['String']['input']>
}

export type AiLibraryParticipant = {
  __typename?: 'AiLibraryParticipant'
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  library: AiLibrary
  libraryId: Scalars['String']['output']
  user: User
  userId: Scalars['String']['output']
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
  fileName?: Maybe<Scalars['String']['output']>
  filePath?: Maybe<Scalars['String']['output']>
  fileSize?: Maybe<Scalars['Int']['output']>
  filterType?: Maybe<Scalars['String']['output']>
  filterValue?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  library?: Maybe<AiLibrary>
  libraryId: Scalars['ID']['output']
  message?: Maybe<Scalars['String']['output']>
  updateType: Scalars['String']['output']
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

export type AiList = {
  __typename?: 'AiList'
  createdAt: Scalars['DateTime']['output']
  enrichmentTasks: Array<AiEnrichmentTask>
  fields: Array<AiListField>
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  owner: User
  ownerId: Scalars['String']['output']
  participants: Array<AiListParticipant>
  sources: Array<AiListSource>
  statistics: Array<AiListFieldStatistics>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
}

export type AiListField = {
  __typename?: 'AiListField'
  contentQuery?: Maybe<Scalars['String']['output']>
  context: Array<AiListFieldContext>
  failureTerms?: Maybe<Scalars['String']['output']>
  fileProperty?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  languageModel?: Maybe<Scalars['String']['output']>
  list: AiList
  listId: Scalars['String']['output']
  name: Scalars['String']['output']
  order: Scalars['Int']['output']
  pendingItemsCount: Scalars['Int']['output']
  processingItemsCount: Scalars['Int']['output']
  prompt?: Maybe<Scalars['String']['output']>
  sourceType: ListFieldSourceType
  type: ListFieldType
  useVectorStore?: Maybe<Scalars['Boolean']['output']>
}

export type AiListFieldContext = {
  __typename?: 'AiListFieldContext'
  contextField: AiListField
  contextFieldId: Scalars['String']['output']
  createdAt: Scalars['DateTime']['output']
  field: AiListField
  fieldId: Scalars['String']['output']
}

export type AiListFieldInput = {
  contentQuery?: InputMaybe<Scalars['String']['input']>
  context?: InputMaybe<Array<Scalars['String']['input']>>
  fileProperty?: InputMaybe<Scalars['String']['input']>
  languageModel?: InputMaybe<Scalars['String']['input']>
  name: Scalars['String']['input']
  order?: InputMaybe<Scalars['Int']['input']>
  prompt?: InputMaybe<Scalars['String']['input']>
  /** Source type: file_property or llm_computed */
  sourceType: ListFieldSourceType
  /** Field type: string, number, date, datetime, boolean */
  type: ListFieldType
  useVectorStore?: InputMaybe<Scalars['Boolean']['input']>
}

export type AiListFieldStatistics = {
  __typename?: 'AiListFieldStatistics'
  cacheCount: Scalars['Int']['output']
  completedTasksCount: Scalars['Int']['output']
  failedTasksCount: Scalars['Int']['output']
  fieldId: Scalars['String']['output']
  fieldName: Scalars['String']['output']
  itemCount: Scalars['Int']['output']
  listId: Scalars['String']['output']
  pendingTasksCount: Scalars['Int']['output']
  processingTasksCount: Scalars['Int']['output']
  valuesCount: Scalars['Int']['output']
}

export type AiListFilterInput = {
  fieldId: Scalars['String']['input']
  filterType: AiListFilterType
  value: Scalars['String']['input']
}

export enum AiListFilterType {
  Contains = 'contains',
  EndsWith = 'ends_with',
  Equals = 'equals',
  IsEmpty = 'is_empty',
  IsNotEmpty = 'is_not_empty',
  NotContains = 'not_contains',
  NotEquals = 'not_equals',
  StartsWith = 'starts_with',
}

export type AiListInput = {
  name: Scalars['String']['input']
}

export type AiListItemCache = {
  __typename?: 'AiListItemCache'
  enrichmentErrorMessage?: Maybe<Scalars['String']['output']>
  fieldId: Scalars['String']['output']
  id: Scalars['ID']['output']
  valueBoolean?: Maybe<Scalars['Boolean']['output']>
  valueDate?: Maybe<Scalars['DateTime']['output']>
  valueNumber?: Maybe<Scalars['Float']['output']>
  valueString?: Maybe<Scalars['String']['output']>
}

export type AiListParticipant = {
  __typename?: 'AiListParticipant'
  id: Scalars['ID']['output']
  list: AiList
  listId: Scalars['String']['output']
  user: User
  userId: Scalars['String']['output']
}

export enum AiListSortingDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type AiListSortingInput = {
  direction: AiListSortingDirection
  fieldId: Scalars['String']['input']
}

export type AiListSource = {
  __typename?: 'AiListSource'
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  library?: Maybe<AiLibrary>
  libraryId?: Maybe<Scalars['String']['output']>
  listId: Scalars['String']['output']
}

export type AiListSourceInput = {
  libraryId: Scalars['String']['input']
}

export type AiModelInfo = {
  __typename?: 'AiModelInfo'
  capabilities: Array<Scalars['String']['output']>
  digest?: Maybe<Scalars['String']['output']>
  family?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  parameterSize?: Maybe<Scalars['String']['output']>
  quantizationLevel?: Maybe<Scalars['String']['output']>
  size: Scalars['Float']['output']
}

export type AiModelQueue = {
  __typename?: 'AiModelQueue'
  estimatedRequestSize: Scalars['Float']['output']
  maxConcurrency: Scalars['Int']['output']
  modelName: Scalars['String']['output']
  queueLength: Scalars['Int']['output']
}

export type AiRunningModel = {
  __typename?: 'AiRunningModel'
  activeRequests: Scalars['Int']['output']
  expiresAt: Scalars['String']['output']
  name: Scalars['String']['output']
  size: Scalars['Float']['output']
}

export type AiServiceClusterStatus = {
  __typename?: 'AiServiceClusterStatus'
  availableInstances: Scalars['Int']['output']
  healthyInstances: Scalars['Int']['output']
  instances: Array<AiServiceInstance>
  totalInstances: Scalars['Int']['output']
  totalMaxConcurrency: Scalars['Int']['output']
  totalMemory: Scalars['Float']['output']
  totalQueueLength: Scalars['Int']['output']
  totalUsedMemory: Scalars['Float']['output']
}

export type AiServiceInstance = {
  __typename?: 'AiServiceInstance'
  availableModels?: Maybe<Array<AiModelInfo>>
  isOnline: Scalars['Boolean']['output']
  modelQueues?: Maybe<Array<AiModelQueue>>
  name: Scalars['String']['output']
  runningModels?: Maybe<Array<AiRunningModel>>
  totalVram: Scalars['Float']['output']
  type: Scalars['String']['output']
  url: Scalars['String']['output']
  usedVram: Scalars['Float']['output']
  version: Scalars['String']['output']
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

export type ComputeFieldValueResult = {
  __typename?: 'ComputeFieldValueResult'
  error?: Maybe<Scalars['String']['output']>
  success?: Maybe<Scalars['Boolean']['output']>
  value?: Maybe<Scalars['String']['output']>
}

export type ContentExtractionTaskQueryResult = {
  __typename?: 'ContentExtractionTaskQueryResult'
  count: Scalars['Int']['output']
  fileId?: Maybe<Scalars['String']['output']>
  libraryId: Scalars['String']['output']
  skip: Scalars['Int']['output']
  status?: Maybe<ProcessingStatus>
  take: Scalars['Int']['output']
  tasks: Array<AiContentProcessingTask>
}

export type ContentQueryResult = {
  __typename?: 'ContentQueryResult'
  contentQuery?: Maybe<Scalars['String']['output']>
  fieldId: Scalars['String']['output']
  fieldName: Scalars['String']['output']
  listId: Scalars['String']['output']
  listName: Scalars['String']['output']
}

export type ConversationInvitationInput = {
  allowDifferentEmailAddress: Scalars['Boolean']['input']
  allowMultipleParticipants: Scalars['Boolean']['input']
  email: Scalars['String']['input']
}

export enum CrawlerUriType {
  Box = 'box',
  Http = 'http',
  Sharepoint = 'sharepoint',
  Smb = 'smb',
}

export enum EmbeddingStatus {
  Completed = 'completed',
  Failed = 'failed',
  None = 'none',
  Pending = 'pending',
  Running = 'running',
  Skipped = 'skipped',
}

export type EnrichmentQueueResult = {
  __typename?: 'EnrichmentQueueResult'
  enrichments: Array<AiEnrichmentTask>
  fieldId?: Maybe<Scalars['String']['output']>
  fileId?: Maybe<Scalars['String']['output']>
  listId?: Maybe<Scalars['String']['output']>
  skip?: Maybe<Scalars['Int']['output']>
  status?: Maybe<EnrichmentStatus>
  statusCounts: Array<EnrichmentStatusCount>
  take?: Maybe<Scalars['Int']['output']>
  totalCount: Scalars['Int']['output']
}

export type EnrichmentQueueTasksMutationResult = {
  __typename?: 'EnrichmentQueueTasksMutationResult'
  cleanedUpEnrichmentsCount?: Maybe<Scalars['Int']['output']>
  cleanedUpTasksCount?: Maybe<Scalars['Int']['output']>
  createdTasksCount?: Maybe<Scalars['Int']['output']>
}

export enum EnrichmentStatus {
  Canceled = 'canceled',
  Completed = 'completed',
  Failed = 'failed',
  Pending = 'pending',
  Processing = 'processing',
}

export type EnrichmentStatusCount = {
  __typename?: 'EnrichmentStatusCount'
  count: Scalars['Int']['output']
  status: EnrichmentStatus
}

export type EnrichmentTaskContextField = {
  __typename?: 'EnrichmentTaskContextField'
  errorMessage?: Maybe<Scalars['String']['output']>
  fieldId: Scalars['String']['output']
  fieldName: Scalars['String']['output']
  value?: Maybe<Scalars['String']['output']>
}

export type EnrichmentTaskMessage = {
  __typename?: 'EnrichmentTaskMessage'
  content: Scalars['String']['output']
  role: Scalars['String']['output']
}

export type EnrichmentTaskSimilarChunk = {
  __typename?: 'EnrichmentTaskSimilarChunk'
  distance: Scalars['Float']['output']
  fileId: Scalars['String']['output']
  fileName: Scalars['String']['output']
  id: Scalars['String']['output']
  text: Scalars['String']['output']
}

export enum ExtractionStatus {
  Completed = 'completed',
  Failed = 'failed',
  None = 'none',
  Pending = 'pending',
  Running = 'running',
  Skipped = 'skipped',
}

export type FieldValueResult = {
  __typename?: 'FieldValueResult'
  displayValue?: Maybe<Scalars['String']['output']>
  enrichmentErrorMessage?: Maybe<Scalars['String']['output']>
  fieldId: Scalars['String']['output']
  fieldName: Scalars['String']['output']
  queueStatus?: Maybe<Scalars['String']['output']>
}

export type FileChunk = {
  __typename?: 'FileChunk'
  chunkIndex: Scalars['Int']['output']
  distance?: Maybe<Scalars['Float']['output']>
  fileId?: Maybe<Scalars['String']['output']>
  fileName?: Maybe<Scalars['String']['output']>
  headingPath: Scalars['String']['output']
  id: Scalars['String']['output']
  originUri?: Maybe<Scalars['String']['output']>
  points?: Maybe<Scalars['Int']['output']>
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

export enum ListFieldFileProperty {
  CrawlerUrl = 'crawlerUrl',
  LastUpdate = 'lastUpdate',
  MimeType = 'mimeType',
  Name = 'name',
  OriginModificationDate = 'originModificationDate',
  OriginUri = 'originUri',
  ProcessedAt = 'processedAt',
  Size = 'size',
  Source = 'source',
}

export enum ListFieldSourceType {
  FileProperty = 'file_property',
  LlmComputed = 'llm_computed',
}

export enum ListFieldType {
  Boolean = 'boolean',
  Date = 'date',
  Datetime = 'datetime',
  Number = 'number',
  String = 'string',
  Text = 'text',
}

export type ListItemQueryResult = {
  __typename?: 'ListItemQueryResult'
  origin: ListItemResult
  values: Array<FieldValueResult>
}

export type ListItemResult = {
  __typename?: 'ListItemResult'
  archivedAt?: Maybe<Scalars['DateTime']['output']>
  createdAt: Scalars['DateTime']['output']
  docPath?: Maybe<Scalars['String']['output']>
  dropError?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  libraryId: Scalars['String']['output']
  libraryName: Scalars['String']['output']
  mimeType: Scalars['String']['output']
  name: Scalars['String']['output']
  originModificationDate?: Maybe<Scalars['DateTime']['output']>
  originUri?: Maybe<Scalars['String']['output']>
  size?: Maybe<Scalars['Int']['output']>
  type: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  uploadedAt?: Maybe<Scalars['DateTime']['output']>
}

/** Query result for AI list files from all source libraries */
export type ListItemsQueryResult = {
  __typename?: 'ListItemsQueryResult'
  count: Scalars['Int']['output']
  items: Array<ListItemQueryResult>
  showArchived?: Maybe<Scalars['Boolean']['output']>
  skip: Scalars['Int']['output']
  take: Scalars['Int']['output']
  unfilteredCount: Scalars['Int']['output']
}

export type ManagedUser = {
  __typename?: 'ManagedUser'
  activationDate?: Maybe<Scalars['DateTime']['output']>
  avatarUrl?: Maybe<Scalars['String']['output']>
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

export type MarkdownResult = {
  __typename?: 'MarkdownResult'
  content: Scalars['String']['output']
  fileName: Scalars['String']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  activateUserProfile?: Maybe<UserProfile>
  addAssistantParticipants: Array<User>
  addConversationParticipants?: Maybe<Array<AiConversationParticipant>>
  addLibraryUsage?: Maybe<AiLibraryUsage>
  addListField: AiListField
  addListSource: AiListSource
  cancelContentProcessingTasks: QueueOperationResult
  cancelFileUpload: Scalars['Boolean']['output']
  cancelProcessingTask: AiContentProcessingTask
  clearEmbeddedFiles?: Maybe<Scalars['Boolean']['output']>
  clearFailedTasks: QueueOperationResult
  clearListEnrichments: EnrichmentQueueTasksMutationResult
  clearPendingTasks: QueueOperationResult
  computeFieldValue?: Maybe<ComputeFieldValueResult>
  confirmConversationInvitation?: Maybe<AiConversation>
  confirmUserProfile?: Maybe<UserProfile>
  createAiAssistant?: Maybe<AiAssistant>
  createAiConversation?: Maybe<AiConversation>
  createAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  createContactRequest: Scalars['Boolean']['output']
  createContentProcessingTask: AiContentProcessingTask
  createConversationInvitations?: Maybe<AiConversation>
  createEmbeddingOnlyProcessingTask: AiContentProcessingTask
  createEnrichmentTasks: EnrichmentQueueTasksMutationResult
  createLibrary?: Maybe<AiLibrary>
  createList: AiList
  deleteAiAssistant?: Maybe<AiAssistant>
  deleteAiConversation?: Maybe<AiConversation>
  deleteAiConversations: Scalars['Boolean']['output']
  deleteAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  deleteFile: AiLibraryFile
  deleteFiles: Scalars['Int']['output']
  deleteLibrary?: Maybe<Scalars['Boolean']['output']>
  deleteLibraryFiles: Scalars['Int']['output']
  deleteList: AiList
  deleteMessage?: Maybe<AiConversationMessage>
  deletePendingEnrichmentTasks: EnrichmentQueueTasksMutationResult
  dropOutdatedMarkdowns: Scalars['Int']['output']
  ensureUserProfile?: Maybe<UserProfile>
  hideMessage?: Maybe<AiConversationMessage>
  leaveAiConversation?: Maybe<AiConversationParticipant>
  leaveAssistantParticipant?: Maybe<User>
  login: User
  prepareFile?: Maybe<AiLibraryFile>
  removeAssistantParticipant: User
  removeConversationParticipant?: Maybe<AiConversationParticipant>
  removeLibraryParticipant: Scalars['Boolean']['output']
  removeLibraryUsage?: Maybe<AiLibraryUsage>
  removeListField: AiListField
  removeListParticipant: Scalars['Boolean']['output']
  removeListSource: AiListSource
  reorderListFields: Array<AiListField>
  resetAssessmentAnswers: Scalars['DateTime']['output']
  retryFailedTasks: QueueOperationResult
  runAiLibraryCrawler: Scalars['String']['output']
  sendConfirmationMail?: Maybe<Scalars['Boolean']['output']>
  sendMessage: Array<AiConversationMessage>
  startAllQueueWorkers: QueueOperationResult
  startQueueWorker: QueueOperationResult
  stopAiLibraryCrawler: Scalars['String']['output']
  stopAllQueueWorkers: QueueOperationResult
  stopQueueWorker: QueueOperationResult
  toggleAdminStatus?: Maybe<User>
  unhideMessage?: Maybe<AiConversationMessage>
  updateAiAssistant?: Maybe<AiAssistant>
  updateAiLibraryCrawler?: Maybe<AiLibraryCrawler>
  updateAssessmentQuestion: Scalars['DateTime']['output']
  updateLibrary: AiLibrary
  updateLibraryParticipants: UpdateLibraryParticipantsResult
  updateLibraryUsage?: Maybe<AiLibraryUsage>
  updateList?: Maybe<AiList>
  updateListField: AiListField
  updateListParticipants: UpdateListParticipantsResult
  updateMessage?: Maybe<AiConversationMessage>
  updateUserAvatar?: Maybe<User>
  updateUserProfile?: Maybe<UserProfile>
  upsertAiBaseCases?: Maybe<Array<AiAssistantBaseCase>>
  validateSharePointConnection: SharePointValidationResult
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

export type MutationAddLibraryUsageArgs = {
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type MutationAddListFieldArgs = {
  data: AiListFieldInput
  listId: Scalars['String']['input']
}

export type MutationAddListSourceArgs = {
  data: AiListSourceInput
  listId: Scalars['String']['input']
}

export type MutationCancelContentProcessingTasksArgs = {
  libraryId?: InputMaybe<Scalars['String']['input']>
}

export type MutationCancelFileUploadArgs = {
  fileId: Scalars['String']['input']
}

export type MutationCancelProcessingTaskArgs = {
  fileId: Scalars['String']['input']
  taskId: Scalars['String']['input']
}

export type MutationClearEmbeddedFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type MutationClearFailedTasksArgs = {
  libraryId?: InputMaybe<Scalars['String']['input']>
  queueType: QueueType
}

export type MutationClearListEnrichmentsArgs = {
  fieldId?: InputMaybe<Scalars['String']['input']>
  fileId?: InputMaybe<Scalars['String']['input']>
  listId: Scalars['String']['input']
}

export type MutationClearPendingTasksArgs = {
  libraryId?: InputMaybe<Scalars['String']['input']>
  queueType: QueueType
}

export type MutationComputeFieldValueArgs = {
  fieldId: Scalars['String']['input']
  fileId: Scalars['String']['input']
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

export type MutationCreateAiLibraryCrawlerArgs = {
  credentials?: InputMaybe<AiLibraryCrawlerCredentialsInput>
  data: AiLibraryCrawlerInput
  libraryId: Scalars['String']['input']
}

export type MutationCreateContactRequestArgs = {
  emailOrPhone: Scalars['String']['input']
  message: Scalars['String']['input']
  name: Scalars['String']['input']
}

export type MutationCreateContentProcessingTaskArgs = {
  fileId: Scalars['String']['input']
}

export type MutationCreateConversationInvitationsArgs = {
  conversationId: Scalars['String']['input']
  data: Array<ConversationInvitationInput>
}

export type MutationCreateEmbeddingOnlyProcessingTaskArgs = {
  existingTaskId?: InputMaybe<Scalars['String']['input']>
  fileId: Scalars['String']['input']
}

export type MutationCreateEnrichmentTasksArgs = {
  fieldId: Scalars['String']['input']
  fileId?: InputMaybe<Scalars['String']['input']>
  filters?: InputMaybe<Array<AiListFilterInput>>
  listId: Scalars['String']['input']
  onlyMissingValues?: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationCreateLibraryArgs = {
  data: AiLibraryInput
}

export type MutationCreateListArgs = {
  data: AiListInput
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

export type MutationDeleteAiLibraryCrawlerArgs = {
  id: Scalars['String']['input']
}

export type MutationDeleteFileArgs = {
  fileId: Scalars['String']['input']
}

export type MutationDeleteFilesArgs = {
  fileIds: Array<Scalars['ID']['input']>
}

export type MutationDeleteLibraryArgs = {
  id: Scalars['String']['input']
}

export type MutationDeleteLibraryFilesArgs = {
  libraryId: Scalars['String']['input']
}

export type MutationDeleteListArgs = {
  id: Scalars['String']['input']
}

export type MutationDeleteMessageArgs = {
  messageId: Scalars['String']['input']
}

export type MutationDeletePendingEnrichmentTasksArgs = {
  fieldId?: InputMaybe<Scalars['String']['input']>
  fileId?: InputMaybe<Scalars['String']['input']>
  listId: Scalars['String']['input']
}

export type MutationDropOutdatedMarkdownsArgs = {
  fileId: Scalars['String']['input']
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

export type MutationLoginArgs = {
  jwtToken: Scalars['String']['input']
}

export type MutationPrepareFileArgs = {
  data: AiLibraryFileInput
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
  participantId: Scalars['String']['input']
}

export type MutationRemoveLibraryUsageArgs = {
  assistantId: Scalars['String']['input']
  libraryId: Scalars['String']['input']
}

export type MutationRemoveListFieldArgs = {
  id: Scalars['String']['input']
}

export type MutationRemoveListParticipantArgs = {
  listId: Scalars['String']['input']
  participantId: Scalars['String']['input']
}

export type MutationRemoveListSourceArgs = {
  id: Scalars['String']['input']
}

export type MutationReorderListFieldsArgs = {
  fieldId: Scalars['String']['input']
  newPlace: Scalars['Int']['input']
}

export type MutationResetAssessmentAnswersArgs = {
  assistantId: Scalars['String']['input']
}

export type MutationRetryFailedTasksArgs = {
  libraryId?: InputMaybe<Scalars['String']['input']>
  queueType: QueueType
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

export type MutationStartQueueWorkerArgs = {
  queueType: QueueType
}

export type MutationStopAiLibraryCrawlerArgs = {
  crawlerId: Scalars['String']['input']
}

export type MutationStopQueueWorkerArgs = {
  queueType: QueueType
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

export type MutationUpdateAiLibraryCrawlerArgs = {
  credentials?: InputMaybe<AiLibraryCrawlerCredentialsInput>
  data: AiLibraryCrawlerInput
  id: Scalars['String']['input']
}

export type MutationUpdateAssessmentQuestionArgs = {
  assistantId: Scalars['String']['input']
  notes?: InputMaybe<Scalars['String']['input']>
  questionId: Scalars['String']['input']
  value?: InputMaybe<Scalars['String']['input']>
}

export type MutationUpdateLibraryArgs = {
  data: AiLibraryInput
  id: Scalars['String']['input']
}

export type MutationUpdateLibraryParticipantsArgs = {
  libraryId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']>
}

export type MutationUpdateLibraryUsageArgs = {
  id: Scalars['String']['input']
  usedFor?: InputMaybe<Scalars['String']['input']>
}

export type MutationUpdateListArgs = {
  data: AiListInput
  id: Scalars['String']['input']
}

export type MutationUpdateListFieldArgs = {
  data: AiListFieldInput
  id: Scalars['String']['input']
}

export type MutationUpdateListParticipantsArgs = {
  listId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']>
}

export type MutationUpdateMessageArgs = {
  content: Scalars['String']['input']
  messageId: Scalars['String']['input']
}

export type MutationUpdateUserAvatarArgs = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>
}

export type MutationUpdateUserProfileArgs = {
  input: UserProfileInput
  profileId: Scalars['String']['input']
}

export type MutationUpsertAiBaseCasesArgs = {
  assistantId: Scalars['String']['input']
  baseCases: Array<AiBaseCaseInputType>
}

export type MutationValidateSharePointConnectionArgs = {
  sharepointAuth: Scalars['String']['input']
  uri: Scalars['String']['input']
}

export enum ProcessingStatus {
  Cancelled = 'cancelled',
  Completed = 'completed',
  Embedding = 'embedding',
  EmbeddingFailed = 'embeddingFailed',
  EmbeddingFinished = 'embeddingFinished',
  Extracting = 'extracting',
  ExtractionFailed = 'extractionFailed',
  ExtractionFinished = 'extractionFinished',
  Failed = 'failed',
  None = 'none',
  Pending = 'pending',
  TimedOut = 'timedOut',
  Validating = 'validating',
  ValidationFailed = 'validationFailed',
}

export type Query = {
  __typename?: 'Query'
  aiActAssessment: AiActAssessment
  aiAssistant?: Maybe<AiAssistant>
  aiAssistants: Array<AiAssistant>
  aiChatModels: Array<Scalars['String']['output']>
  aiContentProcessingTasks: ContentExtractionTaskQueryResult
  aiContentQueries: Array<ContentQueryResult>
  aiConversation?: Maybe<AiConversation>
  aiConversationMessages?: Maybe<Array<AiConversationMessage>>
  aiConversations: Array<AiConversation>
  aiEmbeddingModels: Array<Scalars['String']['output']>
  aiFileChunks: FileChunkQueryResponse
  aiLibraries: Array<AiLibrary>
  aiLibrary: AiLibrary
  aiLibraryCrawler: AiLibraryCrawler
  aiLibraryCrawlerRun: AiLibraryCrawlerRun
  aiLibraryFile: AiLibraryFile
  aiLibraryFiles: AiLibraryFileQueryResult
  aiLibraryUpdates: AiLibraryUpdateQueryResult
  aiLibraryUsage: Array<AiLibraryUsage>
  aiList: AiList
  aiListEnrichments: EnrichmentQueueResult
  aiListItems: ListItemsQueryResult
  aiLists: Array<AiList>
  aiServiceStatus: AiServiceClusterStatus
  aiSimilarFileChunks: Array<FileChunk>
  aiVisionModels: Array<Scalars['String']['output']>
  /** Get all available OCR-capable vision models */
  availableOCRModels: Array<Scalars['String']['output']>
  managedUsers: ManagedUsersResponse
  queryAiLibraryFiles: AiLibraryQueryResult
  queueSystemStatus: QueueSystemStatus
  user?: Maybe<User>
  userProfile: UserProfile
  users: Array<User>
  version?: Maybe<Scalars['String']['output']>
}

export type QueryAiActAssessmentArgs = {
  assistantId: Scalars['String']['input']
}

export type QueryAiAssistantArgs = {
  assistantId: Scalars['String']['input']
}

export type QueryAiContentProcessingTasksArgs = {
  fileId?: InputMaybe<Scalars['String']['input']>
  libraryId: Scalars['String']['input']
  skip?: InputMaybe<Scalars['Int']['input']>
  status?: InputMaybe<ProcessingStatus>
  take?: InputMaybe<Scalars['Int']['input']>
}

export type QueryAiContentQueriesArgs = {
  libraryId?: InputMaybe<Scalars['String']['input']>
  listId?: InputMaybe<Scalars['String']['input']>
}

export type QueryAiConversationArgs = {
  conversationId: Scalars['String']['input']
}

export type QueryAiConversationMessagesArgs = {
  conversationId: Scalars['String']['input']
}

export type QueryAiFileChunksArgs = {
  fileId: Scalars['String']['input']
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
}

export type QueryAiLibraryFilesArgs = {
  libraryId: Scalars['String']['input']
  showArchived?: InputMaybe<Scalars['Boolean']['input']>
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

export type QueryAiListArgs = {
  id: Scalars['String']['input']
}

export type QueryAiListEnrichmentsArgs = {
  fieldId?: InputMaybe<Scalars['String']['input']>
  fileId?: InputMaybe<Scalars['String']['input']>
  listId?: InputMaybe<Scalars['String']['input']>
  skip?: InputMaybe<Scalars['Int']['input']>
  status?: InputMaybe<EnrichmentStatus>
  take?: InputMaybe<Scalars['Int']['input']>
}

export type QueryAiListItemsArgs = {
  fieldIds: Array<Scalars['String']['input']>
  filters?: InputMaybe<Array<AiListFilterInput>>
  listId: Scalars['String']['input']
  showArchived?: InputMaybe<Scalars['Boolean']['input']>
  skip?: Scalars['Int']['input']
  sorting?: InputMaybe<Array<AiListSortingInput>>
  take?: Scalars['Int']['input']
}

export type QueryAiSimilarFileChunksArgs = {
  fileId: Scalars['String']['input']
  hits?: InputMaybe<Scalars['Int']['input']>
  term?: InputMaybe<Scalars['String']['input']>
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

export type QueryUserArgs = {
  email: Scalars['String']['input']
}

export type QueueOperationResult = {
  __typename?: 'QueueOperationResult'
  affectedCount?: Maybe<Scalars['Int']['output']>
  message: Scalars['String']['output']
  success: Scalars['Boolean']['output']
}

export type QueueStatus = {
  __typename?: 'QueueStatus'
  completedTasks: Scalars['Int']['output']
  failedTasks: Scalars['Int']['output']
  isRunning: Scalars['Boolean']['output']
  lastProcessedAt?: Maybe<Scalars['String']['output']>
  pendingTasks: Scalars['Int']['output']
  processingTasks: Scalars['Int']['output']
  queueType: QueueType
}

export type QueueSystemStatus = {
  __typename?: 'QueueSystemStatus'
  allWorkersRunning: Scalars['Boolean']['output']
  lastUpdated: Scalars['String']['output']
  queues: Array<QueueStatus>
  totalFailedTasks: Scalars['Int']['output']
  totalPendingTasks: Scalars['Int']['output']
  totalProcessingTasks: Scalars['Int']['output']
}

export enum QueueType {
  ContentProcessing = 'CONTENT_PROCESSING',
  Enrichment = 'ENRICHMENT',
}

export type SharePointValidationResult = {
  __typename?: 'SharePointValidationResult'
  errorMessage?: Maybe<Scalars['String']['output']>
  errorType?: Maybe<Scalars['String']['output']>
  success?: Maybe<Scalars['Boolean']['output']>
}

export type SourceFileLink = {
  __typename?: 'SourceFileLink'
  fileName: Scalars['String']['output']
  url: Scalars['String']['output']
}

export type UpdateLibraryParticipantsResult = {
  __typename?: 'UpdateLibraryParticipantsResult'
  addedParticipants: Scalars['Int']['output']
  removedParticipants: Scalars['Int']['output']
  totalParticipants: Scalars['Int']['output']
}

export type UpdateListParticipantsResult = {
  __typename?: 'UpdateListParticipantsResult'
  addedParticipants: Scalars['Int']['output']
  removedParticipants: Scalars['Int']['output']
  totalParticipants: Scalars['Int']['output']
}

export type UpdateStats = {
  __typename?: 'UpdateStats'
  count?: Maybe<Scalars['Int']['output']>
  updateType?: Maybe<Scalars['String']['output']>
}

export type User = {
  __typename?: 'User'
  avatarUrl?: Maybe<Scalars['String']['output']>
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
  avatarUrl?: InputMaybe<Scalars['String']['input']>
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
  usedStorage?: Maybe<Scalars['BigInt']['output']>
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
  login: {
    __typename?: 'User'
    id: string
    username: string
    email: string
    name?: string | null
    given_name?: string | null
    family_name?: string | null
    avatarUrl?: string | null
    createdAt: string
    isAdmin: boolean
  }
}

export type GetAiServiceStatusQueryVariables = Exact<{ [key: string]: never }>

export type GetAiServiceStatusQuery = {
  __typename?: 'Query'
  aiServiceStatus: {
    __typename?: 'AiServiceClusterStatus'
    totalInstances: number
    availableInstances: number
    healthyInstances: number
    totalMemory: number
    totalUsedMemory: number
    totalMaxConcurrency: number
    totalQueueLength: number
    instances: Array<{
      __typename?: 'AiServiceInstance'
      name: string
      url: string
      type: string
      isOnline: boolean
      version: string
      totalVram: number
      usedVram: number
      runningModels?: Array<{
        __typename?: 'AiRunningModel'
        name: string
        size: number
        expiresAt: string
        activeRequests: number
      }> | null
      availableModels?: Array<{
        __typename?: 'AiModelInfo'
        name: string
        size: number
        capabilities: Array<string>
        family?: string | null
        parameterSize?: string | null
      }> | null
      modelQueues?: Array<{
        __typename?: 'AiModelQueue'
        modelName: string
        queueLength: number
        maxConcurrency: number
        estimatedRequestSize: number
      }> | null
    }>
  }
}

export type GetQueueSystemStatusQueryVariables = Exact<{ [key: string]: never }>

export type GetQueueSystemStatusQuery = {
  __typename?: 'Query'
  queueSystemStatus: {
    __typename?: 'QueueSystemStatus'
    allWorkersRunning: boolean
    totalPendingTasks: number
    totalProcessingTasks: number
    totalFailedTasks: number
    lastUpdated: string
    queues: Array<{
      __typename?: 'QueueStatus'
      queueType: QueueType
      isRunning: boolean
      pendingTasks: number
      processingTasks: number
      failedTasks: number
      completedTasks: number
      lastProcessedAt?: string | null
    }>
  }
}

export type StartQueueWorkerMutationVariables = Exact<{
  queueType: QueueType
}>

export type StartQueueWorkerMutation = {
  __typename?: 'Mutation'
  startQueueWorker: { __typename?: 'QueueOperationResult'; success: boolean; message: string }
}

export type StopQueueWorkerMutationVariables = Exact<{
  queueType: QueueType
}>

export type StopQueueWorkerMutation = {
  __typename?: 'Mutation'
  stopQueueWorker: { __typename?: 'QueueOperationResult'; success: boolean; message: string }
}

export type RetryFailedTasksMutationVariables = Exact<{
  queueType: QueueType
  libraryId?: InputMaybe<Scalars['String']['input']>
}>

export type RetryFailedTasksMutation = {
  __typename?: 'Mutation'
  retryFailedTasks: {
    __typename?: 'QueueOperationResult'
    success: boolean
    message: string
    affectedCount?: number | null
  }
}

export type ClearFailedTasksMutationVariables = Exact<{
  queueType: QueueType
  libraryId?: InputMaybe<Scalars['String']['input']>
}>

export type ClearFailedTasksMutation = {
  __typename?: 'Mutation'
  clearFailedTasks: {
    __typename?: 'QueueOperationResult'
    success: boolean
    message: string
    affectedCount?: number | null
  }
}

export type ClearTasksMutationVariables = Exact<{
  queueType: QueueType
  libraryId?: InputMaybe<Scalars['String']['input']>
}>

export type ClearTasksMutation = {
  __typename?: 'Mutation'
  clearPendingTasks: {
    __typename?: 'QueueOperationResult'
    success: boolean
    message: string
    affectedCount?: number | null
  }
}

export type CancelContentProcessingTasksMutationVariables = Exact<{
  libraryId?: InputMaybe<Scalars['String']['input']>
}>

export type CancelContentProcessingTasksMutation = {
  __typename?: 'Mutation'
  cancelContentProcessingTasks: {
    __typename?: 'QueueOperationResult'
    success: boolean
    message: string
    affectedCount?: number | null
  }
}

export type QueueSystemStatus_ManagementPanelFragment = {
  __typename?: 'QueueSystemStatus'
  allWorkersRunning: boolean
  totalPendingTasks: number
  totalProcessingTasks: number
  totalFailedTasks: number
  lastUpdated: string
  queues: Array<{
    __typename?: 'QueueStatus'
    queueType: QueueType
    isRunning: boolean
    pendingTasks: number
    processingTasks: number
    failedTasks: number
    completedTasks: number
    lastProcessedAt?: string | null
  }>
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
  avatarUrl?: string | null
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
      avatarUrl?: string | null
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
  users: Array<{ __typename?: 'User'; id: string }>
}

export type AssistantParticipants_AssistantFragment = {
  __typename?: 'AiAssistant'
  id: string
  ownerId: string
  users: Array<{ __typename?: 'User'; id: string; name?: string | null; username: string; avatarUrl?: string | null }>
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
    users: Array<{ __typename?: 'User'; id: string; name?: string | null; username: string; avatarUrl?: string | null }>
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
          __typename: 'AssistantParticipant'
          id: string
          name?: string | null
          isBot: boolean
          assistantId?: string | null
          assistant?: { __typename?: 'AiAssistant'; iconUrl?: string | null; updatedAt?: string | null } | null
        }
      | {
          __typename: 'HumanParticipant'
          id: string
          name?: string | null
          isBot: boolean
          assistantId?: string | null
          user?: { __typename?: 'User'; avatarUrl?: string | null } | null
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
        __typename: 'AssistantParticipant'
        id: string
        name?: string | null
        userId?: string | null
        assistantId?: string | null
        assistant?: { __typename?: 'AiAssistant'; iconUrl?: string | null; updatedAt?: string | null } | null
      }
    | {
        __typename: 'HumanParticipant'
        id: string
        name?: string | null
        userId?: string | null
        assistantId?: string | null
        user?: { __typename?: 'User'; avatarUrl?: string | null; username: string } | null
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
        __typename: 'AssistantParticipant'
        id: string
        name?: string | null
        userId?: string | null
        assistantId?: string | null
        assistant?: { __typename?: 'AiAssistant'; iconUrl?: string | null; updatedAt?: string | null } | null
      }
    | {
        __typename: 'HumanParticipant'
        id: string
        name?: string | null
        userId?: string | null
        assistantId?: string | null
        user?: { __typename?: 'User'; avatarUrl?: string | null; username: string } | null
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
          __typename: 'AssistantParticipant'
          id: string
          name?: string | null
          isBot: boolean
          assistantId?: string | null
          assistant?: { __typename?: 'AiAssistant'; iconUrl?: string | null; updatedAt?: string | null } | null
        }
      | {
          __typename: 'HumanParticipant'
          id: string
          name?: string | null
          isBot: boolean
          assistantId?: string | null
          user?: { __typename?: 'User'; avatarUrl?: string | null } | null
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
          __typename: 'AssistantParticipant'
          id: string
          name?: string | null
          userId?: string | null
          assistantId?: string | null
          assistant?: { __typename?: 'AiAssistant'; iconUrl?: string | null; updatedAt?: string | null } | null
        }
      | {
          __typename: 'HumanParticipant'
          id: string
          name?: string | null
          userId?: string | null
          assistantId?: string | null
          user?: { __typename?: 'User'; avatarUrl?: string | null; username: string } | null
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
            __typename: 'AssistantParticipant'
            id: string
            name?: string | null
            isBot: boolean
            assistantId?: string | null
            assistant?: { __typename?: 'AiAssistant'; iconUrl?: string | null; updatedAt?: string | null } | null
          }
        | {
            __typename: 'HumanParticipant'
            id: string
            name?: string | null
            isBot: boolean
            assistantId?: string | null
            user?: { __typename?: 'User'; avatarUrl?: string | null } | null
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

export type CreateContactRequestMutationVariables = Exact<{
  name: Scalars['String']['input']
  emailOrPhone: Scalars['String']['input']
  message: Scalars['String']['input']
}>

export type CreateContactRequestMutation = { __typename?: 'Mutation'; createContactRequest: boolean }

export type VersionQueryVariables = Exact<{ [key: string]: never }>

export type VersionQuery = { __typename?: 'Query'; version?: string | null }

export type ValidateSharePointConnectionMutationVariables = Exact<{
  uri: Scalars['String']['input']
  sharepointAuth: Scalars['String']['input']
}>

export type ValidateSharePointConnectionMutation = {
  __typename?: 'Mutation'
  validateSharePointConnection: {
    __typename?: 'SharePointValidationResult'
    success?: boolean | null
    errorMessage?: string | null
    errorType?: string | null
  }
}

export type CreateAiLibraryCrawlerMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
  data: AiLibraryCrawlerInput
  credentials?: InputMaybe<AiLibraryCrawlerCredentialsInput>
}>

export type CreateAiLibraryCrawlerMutation = {
  __typename?: 'Mutation'
  createAiLibraryCrawler?: { __typename?: 'AiLibraryCrawler'; id: string } | null
}

export type CrawlerForm_CrawlerFragment = {
  __typename?: 'AiLibraryCrawler'
  id: string
  libraryId: string
  uri: string
  uriType: CrawlerUriType
  maxDepth: number
  maxPages: number
  includePatterns?: string | null
  excludePatterns?: string | null
  maxFileSize?: number | null
  minFileSize?: number | null
  allowedMimeTypes?: string | null
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

export type CrawlerTable_LibraryCrawlerFragment = {
  __typename?: 'AiLibraryCrawler'
  id: string
  uri: string
  uriType: CrawlerUriType
  maxDepth: number
  maxPages: number
  filesCount: number
  libraryId: string
  isRunning: boolean
  lastRun?: {
    __typename?: 'AiLibraryCrawlerRun'
    startedAt: string
    success?: boolean | null
    errorMessage?: string | null
  } | null
  cronJob?: { __typename?: 'AiLibraryCrawlerCronJob'; cronExpression?: string | null } | null
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
  updateTypeFilter?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>
}>

export type GetCrawlerRunQuery = {
  __typename?: 'Query'
  aiLibraryCrawlerRun: {
    __typename?: 'AiLibraryCrawlerRun'
    id: string
    startedAt: string
    endedAt?: string | null
    success?: boolean | null
    stoppedByUser?: string | null
    errorMessage?: string | null
    runByUserId?: string | null
    updatesCount: number
    filteredUpdatesCount: number
    updateStats: Array<{ __typename?: 'UpdateStats'; updateType?: string | null; count?: number | null }>
    updates: Array<{
      __typename?: 'AiLibraryUpdate'
      id: string
      createdAt: string
      message?: string | null
      updateType: string
      filePath?: string | null
      fileName?: string | null
      fileSize?: number | null
      filterType?: string | null
      filterValue?: string | null
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
    libraryId: string
    uri: string
    uriType: CrawlerUriType
    isRunning: boolean
    filesCount: number
    runCount: number
    maxDepth: number
    maxPages: number
    includePatterns?: string | null
    excludePatterns?: string | null
    maxFileSize?: number | null
    minFileSize?: number | null
    allowedMimeTypes?: string | null
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
      uri: string
      uriType: CrawlerUriType
      maxDepth: number
      maxPages: number
      filesCount: number
      libraryId: string
      isRunning: boolean
      lastRun?: {
        __typename?: 'AiLibraryCrawlerRun'
        startedAt: string
        success?: boolean | null
        errorMessage?: string | null
      } | null
      cronJob?: { __typename?: 'AiLibraryCrawlerCronJob'; cronExpression?: string | null } | null
    }>
  }
}

export type RunCrawlerButton_CrawlerFragment = {
  __typename?: 'AiLibraryCrawler'
  id: string
  libraryId: string
  isRunning: boolean
}

export type RunCrawlerMutationVariables = Exact<{
  crawlerId: Scalars['String']['input']
}>

export type RunCrawlerMutation = { __typename?: 'Mutation'; runAiLibraryCrawler: string }

export type StopCrawlerMutationVariables = Exact<{
  crawlerId: Scalars['String']['input']
}>

export type StopCrawlerMutation = { __typename?: 'Mutation'; stopAiLibraryCrawler: string }

export type UpdateAiLibraryCrawlerMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiLibraryCrawlerInput
  credentials?: InputMaybe<AiLibraryCrawlerCredentialsInput>
}>

export type UpdateAiLibraryCrawlerMutation = {
  __typename?: 'Mutation'
  updateAiLibraryCrawler?: { __typename?: 'AiLibraryCrawler'; id: string } | null
}

export type DeleteLibraryFilesMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type DeleteLibraryFilesMutation = { __typename?: 'Mutation'; deleteLibraryFiles: number }

export type DeleteFileMutationVariables = Exact<{
  fileId: Scalars['String']['input']
}>

export type DeleteFileMutation = {
  __typename?: 'Mutation'
  deleteFile: { __typename?: 'AiLibraryFile'; id: string; name: string }
}

export type DeleteFilesMutationVariables = Exact<{
  fileIds: Array<Scalars['ID']['input']> | Scalars['ID']['input']
}>

export type DeleteFilesMutation = { __typename?: 'Mutation'; deleteFiles: number }

export type CreateEmbeddingTasksMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type CreateEmbeddingTasksMutation = {
  __typename?: 'Mutation'
  createEmbeddingOnlyProcessingTask: {
    __typename?: 'AiContentProcessingTask'
    id: string
    file: { __typename?: 'AiLibraryFile'; name: string }
  }
}

export type CreateExtractionTasksMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type CreateExtractionTasksMutation = {
  __typename?: 'Mutation'
  createContentProcessingTask: {
    __typename?: 'AiContentProcessingTask'
    id: string
    file: { __typename?: 'AiLibraryFile'; name: string }
  }
}

export type DropOutdatedMarkdownFilesMutationVariables = Exact<{
  fileId: Scalars['String']['input']
}>

export type DropOutdatedMarkdownFilesMutation = { __typename?: 'Mutation'; dropOutdatedMarkdowns: number }

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

export type CancelFileUploadMutation = { __typename?: 'Mutation'; cancelFileUpload: boolean }

export type AiLibraryFileInfo_CaptionCardFragment = {
  __typename?: 'AiLibraryFile'
  id: string
  libraryId: string
  name: string
  originUri?: string | null
  isLegacyFile: boolean
  supportedExtractionMethods: Array<string>
  originModificationDate?: string | null
  size?: number | null
  uploadedAt?: string | null
  archivedAt?: string | null
  taskCount: number
  status: string
  lastSuccessfulExtraction?: {
    __typename?: 'AiContentProcessingTask'
    id: string
    extractionTimeMs?: number | null
    extractionFinishedAt?: string | null
    metadata?: string | null
    createdAt: string
    extractionStartedAt?: string | null
    processingStatus: ProcessingStatus
  } | null
  lastSuccessfulEmbedding?: {
    __typename?: 'AiContentProcessingTask'
    id: string
    embeddingTimeMs?: number | null
    embeddingFinishedAt?: string | null
    metadata?: string | null
    createdAt: string
    embeddingStartedAt?: string | null
    processingStatus: ProcessingStatus
    chunksCount?: number | null
  } | null
  sourceFiles: Array<{ __typename?: 'SourceFileLink'; fileName: string; url: string }>
  crawler?: { __typename?: 'AiLibraryCrawler'; id: string; uri: string; uriType: CrawlerUriType } | null
}

export type AiContentProcessingTask_ListFragment = {
  __typename?: 'AiContentProcessingTask'
  id: string
  createdAt: string
  processingStartedAt?: string | null
  processingFinishedAt?: string | null
  processingFailedAt?: string | null
  extractionStartedAt?: string | null
  extractionFinishedAt?: string | null
  extractionFailedAt?: string | null
  embeddingStartedAt?: string | null
  embeddingFinishedAt?: string | null
  embeddingFailedAt?: string | null
  chunksCount?: number | null
  chunksSize?: number | null
  embeddingModelName?: string | null
  extractionOptions?: string | null
  processingStatus: ProcessingStatus
  extractionStatus: ExtractionStatus
  embeddingStatus: EmbeddingStatus
  metadata?: string | null
}

export type AiLibraryFile_InfoBoxFragment = {
  __typename?: 'AiLibraryFile'
  originModificationDate?: string | null
  size?: number | null
  uploadedAt?: string | null
  archivedAt?: string | null
  taskCount: number
  status: string
  crawler?: { __typename?: 'AiLibraryCrawler'; id: string; uri: string; uriType: CrawlerUriType } | null
  lastSuccessfulExtraction?: {
    __typename?: 'AiContentProcessingTask'
    id: string
    createdAt: string
    extractionStartedAt?: string | null
    extractionFinishedAt?: string | null
    processingStatus: ProcessingStatus
    metadata?: string | null
  } | null
  lastSuccessfulEmbedding?: {
    __typename?: 'AiContentProcessingTask'
    id: string
    createdAt: string
    embeddingStartedAt?: string | null
    embeddingFinishedAt?: string | null
    processingStatus: ProcessingStatus
    metadata?: string | null
    chunksCount?: number | null
  } | null
}

export type AiLibraryFileInfo_FilesFragment = {
  __typename?: 'AiLibraryFile'
  id: string
  name: string
  sourceFiles: Array<{ __typename?: 'SourceFileLink'; fileName: string; url: string }>
}

export type AiLibraryFile_FileStatusLabelsFragment = {
  __typename?: 'AiLibraryFile'
  id: string
  isLegacyFile: boolean
  supportedExtractionMethods: Array<string>
  name: string
  lastSuccessfulExtraction?: {
    __typename?: 'AiContentProcessingTask'
    id: string
    extractionTimeMs?: number | null
    extractionFinishedAt?: string | null
    metadata?: string | null
  } | null
  lastSuccessfulEmbedding?: {
    __typename?: 'AiContentProcessingTask'
    id: string
    embeddingTimeMs?: number | null
    embeddingFinishedAt?: string | null
    metadata?: string | null
  } | null
}

export type AiLibraryFile_TableItemFragment = {
  __typename?: 'AiLibraryFile'
  id: string
  libraryId: string
  name: string
  originUri?: string | null
  mimeType: string
  size?: number | null
  uploadedAt?: string | null
  dropError?: string | null
  createdAt: string
  originModificationDate?: string | null
  archivedAt?: string | null
  taskCount: number
  processingStatus: ProcessingStatus
  extractionStatus: ExtractionStatus
  embeddingStatus: EmbeddingStatus
  lastSuccessfulEmbedding?: {
    __typename?: 'AiContentProcessingTask'
    id: string
    createdAt: string
    processingFinishedAt?: string | null
    chunksCount?: number | null
    chunksSize?: number | null
  } | null
}

export type GetFileChunksQueryVariables = Exact<{
  fileId: Scalars['String']['input']
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

export type GetFileInfoQueryVariables = Exact<{
  fileId: Scalars['String']['input']
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
    archivedAt?: string | null
    originModificationDate?: string | null
    processingStatus: ProcessingStatus
    extractionStatus: ExtractionStatus
    embeddingStatus: EmbeddingStatus
    latestExtractionMarkdownFileNames: Array<string>
    libraryId: string
    availableExtractionMarkdownFileNames: Array<string>
    isLegacyFile: boolean
    supportedExtractionMethods: Array<string>
    uploadedAt?: string | null
    taskCount: number
    status: string
    lastUpdate?: {
      __typename?: 'AiLibraryUpdate'
      id: string
      createdAt: string
      message?: string | null
      updateType: string
    } | null
    lastSuccessfulExtraction?: {
      __typename?: 'AiContentProcessingTask'
      id: string
      extractionTimeMs?: number | null
      extractionFinishedAt?: string | null
      metadata?: string | null
      createdAt: string
      extractionStartedAt?: string | null
      processingStatus: ProcessingStatus
    } | null
    lastSuccessfulEmbedding?: {
      __typename?: 'AiContentProcessingTask'
      id: string
      embeddingTimeMs?: number | null
      embeddingFinishedAt?: string | null
      metadata?: string | null
      createdAt: string
      embeddingStartedAt?: string | null
      processingStatus: ProcessingStatus
      chunksCount?: number | null
    } | null
    sourceFiles: Array<{ __typename?: 'SourceFileLink'; fileName: string; url: string }>
    crawler?: { __typename?: 'AiLibraryCrawler'; id: string; uri: string; uriType: CrawlerUriType } | null
  }
}

export type GetSimilarFileChunksQueryVariables = Exact<{
  fileId: Scalars['String']['input']
  term?: InputMaybe<Scalars['String']['input']>
  hits: Scalars['Int']['input']
}>

export type GetSimilarFileChunksQuery = {
  __typename?: 'Query'
  aiSimilarFileChunks: Array<{
    __typename?: 'FileChunk'
    id: string
    fileName?: string | null
    fileId?: string | null
    originUri?: string | null
    text: string
    section: string
    headingPath: string
    chunkIndex: number
    subChunkIndex: number
    distance?: number | null
    points?: number | null
  }>
}

export type EmbeddingsTableQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
  showArchived?: InputMaybe<Scalars['Boolean']['input']>
}>

export type EmbeddingsTableQuery = {
  __typename?: 'Query'
  aiLibraryFiles: {
    __typename?: 'AiLibraryFileQueryResult'
    libraryId: string
    take: number
    skip: number
    showArchived?: boolean | null
    count: number
    archivedCount: number
    library: { __typename?: 'AiLibrary'; name: string }
    files: Array<{
      __typename?: 'AiLibraryFile'
      id: string
      libraryId: string
      name: string
      originUri?: string | null
      mimeType: string
      size?: number | null
      uploadedAt?: string | null
      dropError?: string | null
      createdAt: string
      originModificationDate?: string | null
      archivedAt?: string | null
      taskCount: number
      processingStatus: ProcessingStatus
      extractionStatus: ExtractionStatus
      embeddingStatus: EmbeddingStatus
      lastSuccessfulEmbedding?: {
        __typename?: 'AiContentProcessingTask'
        id: string
        createdAt: string
        processingFinishedAt?: string | null
        chunksCount?: number | null
        chunksSize?: number | null
      } | null
    }>
  }
}

export type GetMarkdownQueryVariables = Exact<{
  fileId: Scalars['String']['input']
  markdownFileName?: InputMaybe<Scalars['String']['input']>
}>

export type GetMarkdownQuery = {
  __typename?: 'Query'
  aiLibraryFile: {
    __typename?: 'AiLibraryFile'
    markdown?: { __typename?: 'MarkdownResult'; fileName: string; content: string } | null
  }
}

export type AiLibraryFile_MarkdownFileSelectorFragment = {
  __typename?: 'AiLibraryFile'
  id: string
  libraryId: string
  latestExtractionMarkdownFileNames: Array<string>
  availableExtractionMarkdownFileNames: Array<string>
}

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

export type AiLibraryDetailQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
}>

export type AiLibraryDetailQuery = {
  __typename?: 'Query'
  aiLibrary: {
    __typename?: 'AiLibrary'
    id: string
    name: string
    createdAt: string
    updatedAt: string
    embeddingTimeoutMs?: number | null
    ownerId: string
    filesCount: number
    description?: string | null
    embeddingModelName?: string | null
    fileConverterOptions?: string | null
    owner: {
      __typename?: 'User'
      name?: string | null
      id: string
      username: string
      given_name?: string | null
      family_name?: string | null
      email: string
      avatarUrl?: string | null
      profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
    }
    participants: Array<{
      __typename?: 'AiLibraryParticipant'
      id: string
      user: {
        __typename?: 'User'
        id: string
        name?: string | null
        username: string
        given_name?: string | null
        family_name?: string | null
        email: string
        avatarUrl?: string | null
        profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
      }
    }>
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
  createContentProcessingTask: { __typename?: 'AiContentProcessingTask'; id: string }
}

export type LibraryDeleteDialog_LibraryFragment = {
  __typename?: 'AiLibrary'
  id: string
  name: string
  filesCount: number
}

export type AiLibraryForm_LibraryFragment = {
  __typename?: 'AiLibrary'
  id: string
  name: string
  embeddingTimeoutMs?: number | null
  ownerId: string
  filesCount: number
  description?: string | null
  embeddingModelName?: string | null
  fileConverterOptions?: string | null
}

export type LibraryMenu_AiLibraryFragment = {
  __typename?: 'AiLibrary'
  id: string
  name: string
  ownerId: string
  owner: {
    __typename?: 'User'
    id: string
    name?: string | null
    username: string
    given_name?: string | null
    family_name?: string | null
    email: string
    avatarUrl?: string | null
    profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
  }
  participants: Array<{
    __typename?: 'AiLibraryParticipant'
    id: string
    user: {
      __typename?: 'User'
      id: string
      name?: string | null
      username: string
      given_name?: string | null
      family_name?: string | null
      email: string
      avatarUrl?: string | null
      profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
    }
  }>
}

export type LibraryMenu_AiLibrariesFragment = { __typename?: 'AiLibrary'; id: string; name: string }

export type CreateLibraryMutationVariables = Exact<{
  data: AiLibraryInput
}>

export type CreateLibraryMutation = {
  __typename?: 'Mutation'
  createLibrary?: { __typename?: 'AiLibrary'; id: string; name: string } | null
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

export type DeleteLibraryMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DeleteLibraryMutation = { __typename?: 'Mutation'; deleteLibrary?: boolean | null }

export type ChangeLibraryMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiLibraryInput
}>

export type ChangeLibraryMutation = {
  __typename?: 'Mutation'
  updateLibrary: {
    __typename?: 'AiLibrary'
    id: string
    name: string
    embeddingTimeoutMs?: number | null
    ownerId: string
    filesCount: number
    description?: string | null
    embeddingModelName?: string | null
    fileConverterOptions?: string | null
  }
}

export type GetContentProcessingTasksQueryVariables = Exact<{
  libraryId: Scalars['String']['input']
  fileId?: InputMaybe<Scalars['String']['input']>
  status?: InputMaybe<ProcessingStatus>
  skip?: InputMaybe<Scalars['Int']['input']>
  take?: InputMaybe<Scalars['Int']['input']>
}>

export type GetContentProcessingTasksQuery = {
  __typename?: 'Query'
  aiContentProcessingTasks: {
    __typename?: 'ContentExtractionTaskQueryResult'
    count: number
    tasks: Array<{
      __typename?: 'AiContentProcessingTask'
      id: string
      createdAt: string
      timeoutMs?: number | null
      metadata?: string | null
      extractionOptions?: string | null
      extractionStatus: ExtractionStatus
      embeddingStatus: EmbeddingStatus
      processingTimeMs?: number | null
      processingStatus: ProcessingStatus
      chunksCount?: number | null
      chunksSize?: number | null
      processingStartedAt?: string | null
      processingFinishedAt?: string | null
      processingFailedAt?: string | null
      processingTimeout: boolean
      extractionStartedAt?: string | null
      extractionFinishedAt?: string | null
      extractionFailedAt?: string | null
      extractionTimeMs?: number | null
      extractionTimeout: boolean
      embeddingStartedAt?: string | null
      embeddingFinishedAt?: string | null
      embeddingFailedAt?: string | null
      embeddingTimeMs?: number | null
      embeddingTimeout: boolean
      embeddingModelName?: string | null
      file: {
        __typename?: 'AiLibraryFile'
        id: string
        name: string
        libraryId: string
        library: { __typename?: 'AiLibrary'; fileConverterOptions?: string | null }
      }
      extractionSubTasks: Array<{
        __typename?: 'AiContentExtractionSubTask'
        id: string
        extractionMethod: string
        markdownFileName?: string | null
        startedAt?: string | null
        finishedAt?: string | null
        failedAt?: string | null
      }>
    }>
  }
}

export type AiContentProcessingTask_AccordionItemFragment = {
  __typename?: 'AiContentProcessingTask'
  id: string
  createdAt: string
  timeoutMs?: number | null
  metadata?: string | null
  extractionOptions?: string | null
  extractionStatus: ExtractionStatus
  embeddingStatus: EmbeddingStatus
  processingTimeMs?: number | null
  processingStatus: ProcessingStatus
  chunksCount?: number | null
  chunksSize?: number | null
  processingStartedAt?: string | null
  processingFinishedAt?: string | null
  processingFailedAt?: string | null
  processingTimeout: boolean
  extractionStartedAt?: string | null
  extractionFinishedAt?: string | null
  extractionFailedAt?: string | null
  extractionTimeMs?: number | null
  extractionTimeout: boolean
  embeddingStartedAt?: string | null
  embeddingFinishedAt?: string | null
  embeddingFailedAt?: string | null
  embeddingTimeMs?: number | null
  embeddingTimeout: boolean
  embeddingModelName?: string | null
  file: {
    __typename?: 'AiLibraryFile'
    id: string
    name: string
    libraryId: string
    library: { __typename?: 'AiLibrary'; fileConverterOptions?: string | null }
  }
  extractionSubTasks: Array<{
    __typename?: 'AiContentExtractionSubTask'
    id: string
    extractionMethod: string
    markdownFileName?: string | null
    startedAt?: string | null
    finishedAt?: string | null
    failedAt?: string | null
  }>
}

export type AiContentProcessingTask_TimelineFragment = {
  __typename?: 'AiContentProcessingTask'
  createdAt: string
  processingStartedAt?: string | null
  processingFinishedAt?: string | null
  processingFailedAt?: string | null
  processingTimeout: boolean
  extractionStartedAt?: string | null
  extractionFinishedAt?: string | null
  extractionFailedAt?: string | null
  extractionTimeMs?: number | null
  extractionTimeout: boolean
  embeddingStartedAt?: string | null
  embeddingFinishedAt?: string | null
  embeddingFailedAt?: string | null
  embeddingTimeMs?: number | null
  embeddingTimeout: boolean
  embeddingModelName?: string | null
  extractionSubTasks: Array<{
    __typename?: 'AiContentExtractionSubTask'
    id: string
    extractionMethod: string
    markdownFileName?: string | null
    startedAt?: string | null
    finishedAt?: string | null
    failedAt?: string | null
  }>
}

export type CancelProcessingTaskMutationVariables = Exact<{
  taskId: Scalars['String']['input']
  fileId: Scalars['String']['input']
}>

export type CancelProcessingTaskMutation = {
  __typename?: 'Mutation'
  cancelProcessingTask: { __typename?: 'AiContentProcessingTask'; id: string }
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
      message?: string | null
      updateType: string
      filePath?: string | null
      fileName?: string | null
      fileSize?: number | null
      filterType?: string | null
      filterValue?: string | null
      crawlerRun?: {
        __typename?: 'AiLibraryCrawlerRun'
        id: string
        crawlerId: string
        crawler: { __typename?: 'AiLibraryCrawler'; id: string; uri: string; uriType: CrawlerUriType }
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
  message?: string | null
  updateType: string
  filePath?: string | null
  fileName?: string | null
  fileSize?: number | null
  filterType?: string | null
  filterValue?: string | null
  crawlerRun?: {
    __typename?: 'AiLibraryCrawlerRun'
    id: string
    crawlerId: string
    crawler: { __typename?: 'AiLibraryCrawler'; id: string; uri: string; uriType: CrawlerUriType }
  } | null
  file?: { __typename?: 'AiLibraryFile'; id: string; name: string } | null
}

export type UpdateLibraryParticipantsMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type UpdateLibraryParticipantsMutation = {
  __typename?: 'Mutation'
  updateLibraryParticipants: {
    __typename?: 'UpdateLibraryParticipantsResult'
    totalParticipants: number
    addedParticipants: number
    removedParticipants: number
  }
}

export type RemoveLibraryParticipantMutationVariables = Exact<{
  libraryId: Scalars['String']['input']
  participantId: Scalars['String']['input']
}>

export type RemoveLibraryParticipantMutation = { __typename?: 'Mutation'; removeLibraryParticipant: boolean }

export type ListEditForm_ListFragment = {
  __typename?: 'AiList'
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
}

export type EnrichmentAccordionItem_EnrichmentFragment = {
  __typename?: 'AiEnrichmentTask'
  id: string
  listId: string
  fileId: string
  fieldId: string
  status: EnrichmentStatus
  priority: number
  requestedAt: string
  startedAt?: string | null
  completedAt?: string | null
  metadata?: string | null
  error?: string | null
  processingData: {
    __typename?: 'AiEnrichmentTaskProcessingData'
    input?: {
      __typename?: 'AiEnrichmentTaskProcessingDataInput'
      fileId: string
      fileName: string
      libraryId: string
      libraryName: string
      aiModel: string
      aiGenerationPrompt: string
      dataType: ListFieldType
      libraryEmbeddingModel?: string | null
      contentQuery?: string | null
      useVectorStore: boolean
      contextFields: Array<{
        __typename?: 'EnrichmentTaskContextField'
        fieldId: string
        fieldName: string
        value?: string | null
        errorMessage?: string | null
      }>
    } | null
    output?: {
      __typename?: 'AiEnrichmentTaskProcessingDataOutput'
      aiInstance?: string | null
      enrichedValue?: string | null
      issues: Array<string>
      similarChunks?: Array<{
        __typename?: 'EnrichmentTaskSimilarChunk'
        id: string
        fileName: string
        fileId: string
        text: string
        distance: number
      }> | null
      messages: Array<{ __typename?: 'EnrichmentTaskMessage'; role: string; content: string }>
    } | null
  }
  field: { __typename?: 'AiListField'; id: string; name: string }
  file: {
    __typename?: 'AiLibraryFile'
    id: string
    name: string
    library: { __typename?: 'AiLibrary'; id: string; name: string }
  }
  list: { __typename?: 'AiList'; id: string; name: string }
}

export type FieldModal_ListFragment = {
  __typename?: 'AiList'
  id: string
  fields: Array<{
    __typename?: 'AiListField'
    id: string
    name: string
    type: ListFieldType
    sourceType: ListFieldSourceType
  }>
}

export type FieldModal_FieldFragment = {
  __typename?: 'AiListField'
  id: string
  name: string
  type: ListFieldType
  prompt?: string | null
  failureTerms?: string | null
  contentQuery?: string | null
  languageModel?: string | null
  useVectorStore?: boolean | null
  order: number
  context: Array<{ __typename?: 'AiListFieldContext'; contextFieldId: string }>
}

export type ListExport_FieldFragment = {
  __typename?: 'AiListField'
  id: string
  name: string
  type: ListFieldType
  order: number
  sourceType: ListFieldSourceType
  fileProperty?: string | null
}

export type ListExport_ListFragment = {
  __typename?: 'AiList'
  id: string
  name: string
  fields: Array<{
    __typename?: 'AiListField'
    id: string
    name: string
    type: ListFieldType
    order: number
    sourceType: ListFieldSourceType
    fileProperty?: string | null
  }>
}

export type ListFieldsTableFilters_AiListFieldFragment = {
  __typename?: 'AiListField'
  id: string
  name: string
  type: ListFieldType
}

export type ListFieldsTableMenu_AiListFragment = { __typename?: 'AiList'; id: string; name: string }

export type ListFieldsTableMenu_FieldFragment = {
  __typename?: 'AiListField'
  id: string
  name: string
  type: ListFieldType
  order: number
  listId: string
  processingItemsCount: number
  pendingItemsCount: number
  sourceType: ListFieldSourceType
  fileProperty?: string | null
  prompt?: string | null
  failureTerms?: string | null
  contentQuery?: string | null
  languageModel?: string | null
  useVectorStore?: boolean | null
  context: Array<{ __typename?: 'AiListFieldContext'; contextFieldId: string }>
}

export type ListFilesTable_FilesQueryResultFragment = {
  __typename?: 'ListItemsQueryResult'
  count: number
  take: number
  skip: number
  items: Array<{
    __typename?: 'ListItemQueryResult'
    origin: {
      __typename?: 'ListItemResult'
      id: string
      type: string
      name: string
      libraryId: string
      libraryName: string
    }
    values: Array<{
      __typename?: 'FieldValueResult'
      fieldId: string
      fieldName: string
      displayValue?: string | null
      enrichmentErrorMessage?: string | null
      queueStatus?: string | null
    }>
  }>
}

export type ListFieldsTable_ListFragment = {
  __typename?: 'AiList'
  id: string
  fields: Array<{
    __typename?: 'AiListField'
    id: string
    name: string
    type: ListFieldType
    sourceType: ListFieldSourceType
    listId: string
    processingItemsCount: number
    pendingItemsCount: number
    fileProperty?: string | null
    prompt?: string | null
    failureTerms?: string | null
    contentQuery?: string | null
    languageModel?: string | null
    useVectorStore?: boolean | null
    order: number
    context: Array<{ __typename?: 'AiListFieldContext'; contextFieldId: string }>
  }>
}

export type ListFieldsTable_FieldFragment = {
  __typename?: 'AiListField'
  listId: string
  processingItemsCount: number
  pendingItemsCount: number
  id: string
  sourceType: ListFieldSourceType
  fileProperty?: string | null
  name: string
  type: ListFieldType
  prompt?: string | null
  failureTerms?: string | null
  contentQuery?: string | null
  languageModel?: string | null
  useVectorStore?: boolean | null
  order: number
  context: Array<{ __typename?: 'AiListFieldContext'; contextFieldId: string }>
}

export type ListMenu_AiListFragment = {
  __typename?: 'AiList'
  id: string
  name: string
  ownerId: string
  owner: {
    __typename?: 'User'
    id: string
    name?: string | null
    username: string
    given_name?: string | null
    family_name?: string | null
    email: string
    avatarUrl?: string | null
    profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
  }
  participants: Array<{
    __typename?: 'AiListParticipant'
    id: string
    user: {
      __typename?: 'User'
      id: string
      name?: string | null
      username: string
      given_name?: string | null
      family_name?: string | null
      email: string
      avatarUrl?: string | null
      profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
    }
  }>
}

export type ListMenu_AiListsFragment = { __typename?: 'AiList'; id: string; name: string }

export type ListSourcesManager_ListFragment = {
  __typename?: 'AiList'
  id: string
  name: string
  sources: Array<{
    __typename?: 'AiListSource'
    id: string
    libraryId?: string | null
    library?: {
      __typename?: 'AiLibrary'
      id: string
      name: string
      owner: { __typename?: 'User'; name?: string | null }
    } | null
  }>
}

export type GetContentQueriesQueryVariables = Exact<{
  listId?: InputMaybe<Scalars['String']['input']>
  libraryId?: InputMaybe<Scalars['String']['input']>
}>

export type GetContentQueriesQuery = {
  __typename?: 'Query'
  aiContentQueries: Array<{
    __typename?: 'ContentQueryResult'
    fieldId: string
    fieldName: string
    listId: string
    listName: string
    contentQuery?: string | null
  }>
}

export type GetEnrichmentsQueryVariables = Exact<{
  listId?: InputMaybe<Scalars['String']['input']>
  fileId?: InputMaybe<Scalars['String']['input']>
  fieldId?: InputMaybe<Scalars['String']['input']>
  take: Scalars['Int']['input']
  skip: Scalars['Int']['input']
  status?: InputMaybe<EnrichmentStatus>
}>

export type GetEnrichmentsQuery = {
  __typename?: 'Query'
  aiListEnrichments: {
    __typename?: 'EnrichmentQueueResult'
    listId?: string | null
    fileId?: string | null
    fieldId?: string | null
    take?: number | null
    skip?: number | null
    status?: EnrichmentStatus | null
    totalCount: number
    statusCounts: Array<{ __typename?: 'EnrichmentStatusCount'; status: EnrichmentStatus; count: number }>
    enrichments: Array<{
      __typename?: 'AiEnrichmentTask'
      id: string
      listId: string
      fileId: string
      fieldId: string
      status: EnrichmentStatus
      priority: number
      requestedAt: string
      startedAt?: string | null
      completedAt?: string | null
      metadata?: string | null
      error?: string | null
      processingData: {
        __typename?: 'AiEnrichmentTaskProcessingData'
        input?: {
          __typename?: 'AiEnrichmentTaskProcessingDataInput'
          fileId: string
          fileName: string
          libraryId: string
          libraryName: string
          aiModel: string
          aiGenerationPrompt: string
          dataType: ListFieldType
          libraryEmbeddingModel?: string | null
          contentQuery?: string | null
          useVectorStore: boolean
          contextFields: Array<{
            __typename?: 'EnrichmentTaskContextField'
            fieldId: string
            fieldName: string
            value?: string | null
            errorMessage?: string | null
          }>
        } | null
        output?: {
          __typename?: 'AiEnrichmentTaskProcessingDataOutput'
          aiInstance?: string | null
          enrichedValue?: string | null
          issues: Array<string>
          similarChunks?: Array<{
            __typename?: 'EnrichmentTaskSimilarChunk'
            id: string
            fileName: string
            fileId: string
            text: string
            distance: number
          }> | null
          messages: Array<{ __typename?: 'EnrichmentTaskMessage'; role: string; content: string }>
        } | null
      }
      field: { __typename?: 'AiListField'; id: string; name: string }
      file: {
        __typename?: 'AiLibraryFile'
        id: string
        name: string
        library: { __typename?: 'AiLibrary'; id: string; name: string }
      }
      list: { __typename?: 'AiList'; id: string; name: string }
    }>
  }
}

export type GetListItemsQueryVariables = Exact<{
  listId: Scalars['String']['input']
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
  sorting?: InputMaybe<Array<AiListSortingInput> | AiListSortingInput>
  fieldIds: Array<Scalars['String']['input']> | Scalars['String']['input']
  filters: Array<AiListFilterInput> | AiListFilterInput
}>

export type GetListItemsQuery = {
  __typename?: 'Query'
  aiListItems: {
    __typename?: 'ListItemsQueryResult'
    count: number
    take: number
    skip: number
    items: Array<{
      __typename?: 'ListItemQueryResult'
      origin: {
        __typename?: 'ListItemResult'
        id: string
        type: string
        name: string
        libraryId: string
        libraryName: string
      }
      values: Array<{
        __typename?: 'FieldValueResult'
        fieldId: string
        fieldName: string
        displayValue?: string | null
        enrichmentErrorMessage?: string | null
        queueStatus?: string | null
      }>
    }>
  }
}

export type GetListQueryVariables = Exact<{
  listId: Scalars['String']['input']
}>

export type GetListQuery = {
  __typename?: 'Query'
  aiList: {
    __typename?: 'AiList'
    id: string
    ownerId: string
    createdAt: string
    updatedAt?: string | null
    name: string
    fields: Array<{
      __typename?: 'AiListField'
      id: string
      name: string
      type: ListFieldType
      sourceType: ListFieldSourceType
      listId: string
      processingItemsCount: number
      pendingItemsCount: number
      fileProperty?: string | null
      prompt?: string | null
      failureTerms?: string | null
      contentQuery?: string | null
      languageModel?: string | null
      useVectorStore?: boolean | null
      order: number
      context: Array<{ __typename?: 'AiListFieldContext'; contextFieldId: string }>
    }>
    statistics: Array<{
      __typename?: 'AiListFieldStatistics'
      fieldId: string
      fieldName: string
      itemCount: number
      cacheCount: number
      valuesCount: number
      completedTasksCount: number
      failedTasksCount: number
      pendingTasksCount: number
      processingTasksCount: number
    }>
    sources: Array<{
      __typename?: 'AiListSource'
      id: string
      libraryId?: string | null
      library?: {
        __typename?: 'AiLibrary'
        id: string
        name: string
        owner: { __typename?: 'User'; name?: string | null }
      } | null
    }>
    owner: {
      __typename?: 'User'
      id: string
      name?: string | null
      username: string
      given_name?: string | null
      family_name?: string | null
      email: string
      avatarUrl?: string | null
      profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
    }
    participants: Array<{
      __typename?: 'AiListParticipant'
      id: string
      user: {
        __typename?: 'User'
        id: string
        name?: string | null
        username: string
        given_name?: string | null
        family_name?: string | null
        email: string
        avatarUrl?: string | null
        profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
      }
    }>
  }
}

export type ListsBaseFragment = {
  __typename?: 'AiList'
  id: string
  ownerId: string
  createdAt: string
  updatedAt?: string | null
}

export type GetUserListsQueryVariables = Exact<{ [key: string]: never }>

export type GetUserListsQuery = {
  __typename?: 'Query'
  aiLists: Array<{
    __typename?: 'AiList'
    id: string
    ownerId: string
    createdAt: string
    updatedAt?: string | null
    name: string
  }>
}

export type AddListFieldMutationVariables = Exact<{
  listId: Scalars['String']['input']
  data: AiListFieldInput
}>

export type AddListFieldMutation = {
  __typename?: 'Mutation'
  addListField: {
    __typename?: 'AiListField'
    id: string
    name: string
    type: ListFieldType
    order: number
    sourceType: ListFieldSourceType
    fileProperty?: string | null
    prompt?: string | null
    contentQuery?: string | null
    languageModel?: string | null
  }
}

export type AddListSourceMutationVariables = Exact<{
  listId: Scalars['String']['input']
  data: AiListSourceInput
}>

export type AddListSourceMutation = {
  __typename?: 'Mutation'
  addListSource: {
    __typename?: 'AiListSource'
    id: string
    libraryId?: string | null
    library?: {
      __typename?: 'AiLibrary'
      id: string
      name: string
      owner: { __typename?: 'User'; name?: string | null }
    } | null
  }
}

export type ClearEnrichmentsMutationVariables = Exact<{
  listId: Scalars['String']['input']
  fieldId: Scalars['String']['input']
  fileId?: InputMaybe<Scalars['String']['input']>
}>

export type ClearEnrichmentsMutation = {
  __typename?: 'Mutation'
  clearListEnrichments: {
    __typename?: 'EnrichmentQueueTasksMutationResult'
    createdTasksCount?: number | null
    cleanedUpTasksCount?: number | null
    cleanedUpEnrichmentsCount?: number | null
  }
}

export type CreateListMutationVariables = Exact<{
  data: AiListInput
}>

export type CreateListMutation = { __typename?: 'Mutation'; createList: { __typename?: 'AiList'; id: string } }

export type DeleteListMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type DeleteListMutation = {
  __typename?: 'Mutation'
  deleteList: { __typename?: 'AiList'; id: string; name: string }
}

export type ListExportDataQueryVariables = Exact<{
  listId: Scalars['String']['input']
  skip: Scalars['Int']['input']
  take: Scalars['Int']['input']
  fieldIds: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type ListExportDataQuery = {
  __typename?: 'Query'
  aiList: {
    __typename?: 'AiList'
    id: string
    name: string
    fields: Array<{
      __typename?: 'AiListField'
      id: string
      name: string
      type: ListFieldType
      order: number
      sourceType: ListFieldSourceType
      fileProperty?: string | null
    }>
  }
  aiListItems: {
    __typename?: 'ListItemsQueryResult'
    count: number
    items: Array<{
      __typename?: 'ListItemQueryResult'
      origin: { __typename?: 'ListItemResult'; id: string; name: string; libraryId: string; libraryName: string }
      values: Array<{
        __typename?: 'FieldValueResult'
        fieldId: string
        fieldName: string
        displayValue?: string | null
      }>
    }>
  }
}

export type UpdateListParticipantsMutationVariables = Exact<{
  listId: Scalars['String']['input']
  userIds: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type UpdateListParticipantsMutation = {
  __typename?: 'Mutation'
  updateListParticipants: {
    __typename?: 'UpdateListParticipantsResult'
    addedParticipants: number
    removedParticipants: number
    totalParticipants: number
  }
}

export type RemoveListParticipantMutationVariables = Exact<{
  listId: Scalars['String']['input']
  participantId: Scalars['String']['input']
}>

export type RemoveListParticipantMutation = { __typename?: 'Mutation'; removeListParticipant: boolean }

export type RemoveFromEnrichmentQueueMutationVariables = Exact<{
  listId: Scalars['String']['input']
  fieldId: Scalars['String']['input']
  fileId: Scalars['String']['input']
}>

export type RemoveFromEnrichmentQueueMutation = {
  __typename?: 'Mutation'
  deletePendingEnrichmentTasks: {
    __typename?: 'EnrichmentQueueTasksMutationResult'
    createdTasksCount?: number | null
    cleanedUpTasksCount?: number | null
    cleanedUpEnrichmentsCount?: number | null
  }
}

export type RemoveListFieldMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type RemoveListFieldMutation = {
  __typename?: 'Mutation'
  removeListField: { __typename?: 'AiListField'; id: string }
}

export type RemoveListSourceMutationVariables = Exact<{
  id: Scalars['String']['input']
}>

export type RemoveListSourceMutation = {
  __typename?: 'Mutation'
  removeListSource: { __typename?: 'AiListSource'; id: string }
}

export type ReorderListFieldsMutationVariables = Exact<{
  fieldId: Scalars['String']['input']
  newPlace: Scalars['Int']['input']
}>

export type ReorderListFieldsMutation = {
  __typename?: 'Mutation'
  reorderListFields: Array<{ __typename?: 'AiListField'; id: string; name: string; order: number }>
}

export type CreateListEnrichmentTasksMutationVariables = Exact<{
  listId: Scalars['String']['input']
  fieldId: Scalars['String']['input']
  fileId?: InputMaybe<Scalars['String']['input']>
  onlyMissingValues?: InputMaybe<Scalars['Boolean']['input']>
  filters?: InputMaybe<Array<AiListFilterInput> | AiListFilterInput>
}>

export type CreateListEnrichmentTasksMutation = {
  __typename?: 'Mutation'
  createEnrichmentTasks: {
    __typename?: 'EnrichmentQueueTasksMutationResult'
    createdTasksCount?: number | null
    cleanedUpTasksCount?: number | null
    cleanedUpEnrichmentsCount?: number | null
  }
}

export type StartSingleEnrichmentMutationVariables = Exact<{
  listId: Scalars['String']['input']
  fieldId: Scalars['String']['input']
  fileId: Scalars['String']['input']
}>

export type StartSingleEnrichmentMutation = {
  __typename?: 'Mutation'
  createEnrichmentTasks: {
    __typename?: 'EnrichmentQueueTasksMutationResult'
    createdTasksCount?: number | null
    cleanedUpTasksCount?: number | null
    cleanedUpEnrichmentsCount?: number | null
  }
}

export type StopListEnrichmentMutationVariables = Exact<{
  listId: Scalars['String']['input']
  fieldId: Scalars['String']['input']
}>

export type StopListEnrichmentMutation = {
  __typename?: 'Mutation'
  deletePendingEnrichmentTasks: {
    __typename?: 'EnrichmentQueueTasksMutationResult'
    cleanedUpTasksCount?: number | null
    cleanedUpEnrichmentsCount?: number | null
    createdTasksCount?: number | null
  }
}

export type UpdateListFieldMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiListFieldInput
}>

export type UpdateListFieldMutation = {
  __typename?: 'Mutation'
  updateListField: {
    __typename?: 'AiListField'
    id: string
    name: string
    type: ListFieldType
    order: number
    sourceType: ListFieldSourceType
    fileProperty?: string | null
    prompt?: string | null
    useVectorStore?: boolean | null
    contentQuery?: string | null
    languageModel?: string | null
  }
}

export type UpdateListMutationVariables = Exact<{
  id: Scalars['String']['input']
  data: AiListInput
}>

export type UpdateListMutation = { __typename?: 'Mutation'; updateList?: { __typename?: 'AiList'; id: string } | null }

export type ListFieldSettings_FieldFragment = {
  __typename?: 'AiListField'
  id: string
  order: number
  listId: string
  processingItemsCount: number
  pendingItemsCount: number
  sourceType: ListFieldSourceType
  fileProperty?: string | null
  name: string
  type: ListFieldType
  prompt?: string | null
  failureTerms?: string | null
  contentQuery?: string | null
  languageModel?: string | null
  useVectorStore?: boolean | null
  context: Array<{ __typename?: 'AiListFieldContext'; contextFieldId: string }>
}

export type AiChatModelsQueryVariables = Exact<{ [key: string]: never }>

export type AiChatModelsQuery = { __typename?: 'Query'; aiChatModels: Array<string> }

export type AiEmbeddingModelsQueryVariables = Exact<{ [key: string]: never }>

export type AiEmbeddingModelsQuery = { __typename?: 'Query'; aiEmbeddingModels: Array<string> }

export type User_EntityParticipantsDialogFragment = {
  __typename?: 'User'
  id: string
  name?: string | null
  username: string
  given_name?: string | null
  family_name?: string | null
  email: string
  avatarUrl?: string | null
  profile?: { __typename?: 'UserProfile'; position?: string | null; business?: string | null } | null
}

export type Assistant_EntityParticipantsDialogFragment = {
  __typename?: 'AiAssistant'
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
  ownerId: string
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
  usedStorage?: any | null
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

export type ListStatistics_AiListFragment = {
  __typename?: 'AiList'
  id: string
  name: string
  statistics: Array<{
    __typename?: 'AiListFieldStatistics'
    fieldId: string
    fieldName: string
    itemCount: number
    cacheCount: number
    valuesCount: number
    completedTasksCount: number
    failedTasksCount: number
    pendingTasksCount: number
    processingTasksCount: number
  }>
}

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>

export type UserProfileQuery = {
  __typename?: 'Query'
  userProfile: {
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
    usedStorage?: any | null
    createdAt: string
    updatedAt?: string | null
    activationDate?: string | null
    expiresAt?: string | null
    business?: string | null
    position?: string | null
  }
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

export type UpdateUserAvatarMutationVariables = Exact<{
  avatarUrl?: InputMaybe<Scalars['String']['input']>
}>

export type UpdateUserAvatarMutation = {
  __typename?: 'Mutation'
  updateUserAvatar?: { __typename?: 'User'; id: string; avatarUrl?: string | null } | null
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

export type UserFragment = {
  __typename?: 'User'
  id: string
  username: string
  name?: string | null
  createdAt: string
  email: string
  avatarUrl?: string | null
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
    avatarUrl?: string | null
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
  usedStorage?: any | null
  createdAt: string
  updatedAt?: string | null
  confirmationDate?: string | null
  activationDate?: string | null
  expiresAt?: string | null
}

export type GetUserProfileQueryVariables = Exact<{ [key: string]: never }>

export type GetUserProfileQuery = {
  __typename?: 'Query'
  userProfile: {
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
    usedStorage?: any | null
    createdAt: string
    updatedAt?: string | null
    confirmationDate?: string | null
    activationDate?: string | null
    expiresAt?: string | null
  }
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
    avatarUrl?: string | null
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
      usedStorage?: any | null
      createdAt: string
      updatedAt?: string | null
      expiresAt?: string | null
    } | null
  } | null
}

export const QueueSystemStatus_ManagementPanelFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'QueueSystemStatus_ManagementPanel' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'QueueSystemStatus' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'allWorkersRunning' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalPendingTasks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalProcessingTasks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalFailedTasks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastUpdated' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'queues' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'queueType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pendingTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'completedTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastProcessedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QueueSystemStatus_ManagementPanelFragment, unknown>
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
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
            name: { kind: 'Name', value: 'users' },
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
            name: { kind: 'Name', value: 'users' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
            name: { kind: 'Name', value: 'users' },
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
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'HumanParticipant' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'user' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AssistantParticipant' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'assistant' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                      { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isBot' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'HumanParticipant' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'user' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } }],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AssistantParticipant' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'assistant' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'HumanParticipant' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'user' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AssistantParticipant' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'assistant' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                      { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isBot' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'HumanParticipant' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'user' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } }],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AssistantParticipant' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'assistant' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
export const CrawlerForm_CrawlerFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CrawlerForm_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'includePatterns' } },
          { kind: 'Field', name: { kind: 'Name', value: 'excludePatterns' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxFileSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'minFileSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'allowedMimeTypes' } },
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
} as unknown as DocumentNode<CrawlerForm_CrawlerFragment, unknown>
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
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RunCrawlerButton_CrawlerFragment, unknown>
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
          { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CrawlerTable_LibraryCrawlerFragment, unknown>
export const AiLibraryFile_FileStatusLabelsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_FileStatusLabels' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isLegacyFile' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulExtraction' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeMs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeMs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'supportedExtractionMethods' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isLegacyFile' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryFile_FileStatusLabelsFragment, unknown>
export const AiLibraryFileInfo_FilesFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFileInfo_Files' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sourceFiles' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryFileInfo_FilesFragment, unknown>
export const AiLibraryFile_InfoBoxFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_InfoBox' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'originModificationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'size' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'archivedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'taskCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'crawler' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulExtraction' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionStartedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingStartedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryFile_InfoBoxFragment, unknown>
export const AiLibraryFileInfo_CaptionCardFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFileInfo_CaptionCard' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFile_FileStatusLabels' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFileInfo_Files' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFile_InfoBox' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'originUri' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_FileStatusLabels' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isLegacyFile' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulExtraction' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeMs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeMs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'supportedExtractionMethods' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isLegacyFile' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFileInfo_Files' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sourceFiles' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_InfoBox' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'originModificationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'size' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'archivedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'taskCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'crawler' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulExtraction' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionStartedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingStartedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryFileInfo_CaptionCardFragment, unknown>
export const AiContentProcessingTask_ListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiContentProcessingTask_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiContentProcessingTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'chunksSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingModelName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionOptions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiContentProcessingTask_ListFragment, unknown>
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
          { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dropError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'originModificationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'archivedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'taskCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStatus' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunksSize' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryFile_TableItemFragment, unknown>
export const AiLibraryFile_MarkdownFileSelectorFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_MarkdownFileSelector' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'latestExtractionMarkdownFileNames' } },
          { kind: 'Field', name: { kind: 'Name', value: 'availableExtractionMarkdownFileNames' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryFile_MarkdownFileSelectorFragment, unknown>
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
export const LibraryDeleteDialog_LibraryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryDeleteDialog_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LibraryDeleteDialog_LibraryFragment, unknown>
export const AiLibraryForm_LibraryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryForm_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeoutMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingModelName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileConverterOptions' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryForm_LibraryFragment, unknown>
export const User_EntityParticipantsDialogFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'User_EntityParticipantsDialog' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<User_EntityParticipantsDialogFragment, unknown>
export const LibraryMenu_AiLibraryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryMenu_AiLibrary' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } },
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
      name: { kind: 'Name', value: 'User_EntityParticipantsDialog' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LibraryMenu_AiLibraryFragment, unknown>
export const LibraryMenu_AiLibrariesFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryMenu_AiLibraries' },
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
} as unknown as DocumentNode<LibraryMenu_AiLibrariesFragment, unknown>
export const AiContentProcessingTask_TimelineFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiContentProcessingTask_Timeline' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiContentProcessingTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingModelName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'extractionSubTasks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionMethod' } },
                { kind: 'Field', name: { kind: 'Name', value: 'markdownFileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'finishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiContentProcessingTask_TimelineFragment, unknown>
export const AiContentProcessingTask_AccordionItemFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiContentProcessingTask_AccordionItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiContentProcessingTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiContentProcessingTask_Timeline' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'file' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'library' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'fileConverterOptions' } }],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timeoutMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionOptions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'chunksSize' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'extractionSubTasks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionMethod' } },
                { kind: 'Field', name: { kind: 'Name', value: 'markdownFileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'finishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedAt' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiContentProcessingTask_Timeline' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiContentProcessingTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingModelName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'extractionSubTasks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionMethod' } },
                { kind: 'Field', name: { kind: 'Name', value: 'markdownFileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'finishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiContentProcessingTask_AccordionItemFragment, unknown>
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
                      { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'message' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updateType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filePath' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filterType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filterValue' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AiLibraryUpdate_TableItemFragment, unknown>
export const ListEditForm_ListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListEditForm_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListEditForm_ListFragment, unknown>
export const EnrichmentAccordionItem_EnrichmentFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'EnrichmentAccordionItem_Enrichment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiEnrichmentTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
          { kind: 'Field', name: { kind: 'Name', value: 'requestedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'completedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'processingData' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'input' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'aiModel' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'aiGenerationPrompt' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'contextFields' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'dataType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryEmbeddingModel' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'output' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'similarChunks' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'distance' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'messages' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'aiInstance' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'enrichedValue' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'issues' } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'error' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'field' },
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
            name: { kind: 'Name', value: 'file' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
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
            kind: 'Field',
            name: { kind: 'Name', value: 'list' },
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
} as unknown as DocumentNode<EnrichmentAccordionItem_EnrichmentFragment, unknown>
export const ListExport_FieldFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListExport_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListExport_FieldFragment, unknown>
export const ListExport_ListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListExport_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListExport_Field' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListExport_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListExport_ListFragment, unknown>
export const ListFieldsTableFilters_AiListFieldFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTableFilters_AiListField' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListFieldsTableFilters_AiListFieldFragment, unknown>
export const ListFieldsTableMenu_AiListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTableMenu_AiList' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListFieldsTableMenu_AiListFragment, unknown>
export const FieldModal_FieldFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'failureTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
          { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'context' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'contextFieldId' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FieldModal_FieldFragment, unknown>
export const ListFieldsTable_FieldFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTable_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pendingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'FieldModal_Field' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'failureTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
          { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'context' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'contextFieldId' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListFieldsTable_FieldFragment, unknown>
export const ListFieldSettings_FieldFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldSettings_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTable_Field' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'failureTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
          { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'context' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'contextFieldId' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTable_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pendingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'FieldModal_Field' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListFieldSettings_FieldFragment, unknown>
export const ListFieldsTableMenu_FieldFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTableMenu_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldSettings_Field' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'failureTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
          { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'context' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'contextFieldId' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTable_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pendingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'FieldModal_Field' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldSettings_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTable_Field' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListFieldsTableMenu_FieldFragment, unknown>
export const ListFilesTable_FilesQueryResultFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFilesTable_FilesQueryResult' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ListItemsQueryResult' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'count' } },
          { kind: 'Field', name: { kind: 'Name', value: 'take' } },
          { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'origin' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryName' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'values' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'displayValue' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'enrichmentErrorMessage' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'queueStatus' } },
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
} as unknown as DocumentNode<ListFilesTable_FilesQueryResultFragment, unknown>
export const FieldModal_ListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FieldModal_ListFragment, unknown>
export const ListFieldsTable_ListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTable_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTable_Field' } }],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'FieldModal_List' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'failureTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
          { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'context' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'contextFieldId' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTable_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pendingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'FieldModal_Field' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListFieldsTable_ListFragment, unknown>
export const ListMenu_AiListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListMenu_AiList' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } },
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
      name: { kind: 'Name', value: 'User_EntityParticipantsDialog' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListMenu_AiListFragment, unknown>
export const ListMenu_AiListsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListMenu_AiLists' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListMenu_AiListsFragment, unknown>
export const ListSourcesManager_ListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListSourcesManager_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sources' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'library' },
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
                          selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
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
} as unknown as DocumentNode<ListSourcesManager_ListFragment, unknown>
export const ListsBaseFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListsBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
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
} as unknown as DocumentNode<ListsBaseFragment, unknown>
export const Assistant_EntityParticipantsDialogFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'Assistant_EntityParticipantsDialog' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiAssistant' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Assistant_EntityParticipantsDialogFragment, unknown>
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
export const ListStatistics_AiListFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListStatistics_AiList' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'statistics' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'itemCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cacheCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'valuesCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'completedTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pendingTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingTasksCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListStatistics_AiListFragment, unknown>
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
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
export const GetAiServiceStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAiServiceStatus' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiServiceStatus' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'instances' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'version' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'runningModels' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'activeRequests' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'availableModels' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'capabilities' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'family' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'parameterSize' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'totalVram' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'usedVram' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'modelQueues' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'modelName' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'queueLength' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'maxConcurrency' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'estimatedRequestSize' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalInstances' } },
                { kind: 'Field', name: { kind: 'Name', value: 'availableInstances' } },
                { kind: 'Field', name: { kind: 'Name', value: 'healthyInstances' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalMemory' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalUsedMemory' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalMaxConcurrency' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalQueueLength' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAiServiceStatusQuery, GetAiServiceStatusQueryVariables>
export const GetQueueSystemStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetQueueSystemStatus' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'queueSystemStatus' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'QueueSystemStatus_ManagementPanel' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'QueueSystemStatus_ManagementPanel' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'QueueSystemStatus' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'allWorkersRunning' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalPendingTasks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalProcessingTasks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalFailedTasks' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastUpdated' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'queues' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'queueType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pendingTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'completedTasks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastProcessedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetQueueSystemStatusQuery, GetQueueSystemStatusQueryVariables>
export const StartQueueWorkerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'StartQueueWorker' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'QueueType' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'startQueueWorker' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'queueType' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StartQueueWorkerMutation, StartQueueWorkerMutationVariables>
export const StopQueueWorkerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'StopQueueWorker' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'QueueType' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stopQueueWorker' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'queueType' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StopQueueWorkerMutation, StopQueueWorkerMutationVariables>
export const RetryFailedTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RetryFailedTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'QueueType' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'retryFailedTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'queueType' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'affectedCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RetryFailedTasksMutation, RetryFailedTasksMutationVariables>
export const ClearFailedTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ClearFailedTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'QueueType' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'clearFailedTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'queueType' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'affectedCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClearFailedTasksMutation, ClearFailedTasksMutationVariables>
export const ClearTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ClearTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'QueueType' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'clearPendingTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'queueType' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'queueType' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'affectedCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClearTasksMutation, ClearTasksMutationVariables>
export const CancelContentProcessingTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CancelContentProcessingTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cancelContentProcessingTasks' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'affectedCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CancelContentProcessingTasksMutation, CancelContentProcessingTasksMutationVariables>
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
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
            name: { kind: 'Name', value: 'users' },
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
            name: { kind: 'Name', value: 'users' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'HumanParticipant' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'user' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AssistantParticipant' } },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'assistant' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
                      { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isBot' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'assistantId' } },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'HumanParticipant' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'user' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [{ kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } }],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AssistantParticipant' } },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'assistant' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'iconUrl' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
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
export const ValidateSharePointConnectionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'validateSharePointConnection' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'uri' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sharepointAuth' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'validateSharePointConnection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'uri' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'uri' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sharepointAuth' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sharepointAuth' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'errorType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ValidateSharePointConnectionMutation, ValidateSharePointConnectionMutationVariables>
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'credentials' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawlerCredentialsInput' } },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'credentials' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'credentials' } },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'updateTypeFilter' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'stoppedByUser' } },
                { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'runByUserId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatesCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'filteredUpdatesCount' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'updateTypeFilter' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'updateTypeFilter' } },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'updateStats' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'updateType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                    ],
                  },
                },
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
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'updateTypeFilter' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'updateTypeFilter' } },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'updateType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'filePath' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fileSize' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'filterType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'filterValue' } },
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
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CrawlerForm_Crawler' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
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
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CrawlerForm_Crawler' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawler' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDepth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxPages' } },
          { kind: 'Field', name: { kind: 'Name', value: 'includePatterns' } },
          { kind: 'Field', name: { kind: 'Name', value: 'excludePatterns' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxFileSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'minFileSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'allowedMimeTypes' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isRunning' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'credentials' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryCrawlerCredentialsInput' } },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'credentials' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'credentials' } },
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
export const DeleteLibraryFilesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteLibraryFiles' },
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
            name: { kind: 'Name', value: 'deleteLibraryFiles' },
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
} as unknown as DocumentNode<DeleteLibraryFilesMutation, DeleteLibraryFilesMutationVariables>
export const DeleteFileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteFile' },
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
            name: { kind: 'Name', value: 'deleteFile' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteFileMutation, DeleteFileMutationVariables>
export const DeleteFilesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteFiles' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileIds' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteFiles' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileIds' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteFilesMutation, DeleteFilesMutationVariables>
export const CreateEmbeddingTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createEmbeddingTasks' },
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
            name: { kind: 'Name', value: 'createEmbeddingOnlyProcessingTask' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'file' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateEmbeddingTasksMutation, CreateEmbeddingTasksMutationVariables>
export const CreateExtractionTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createExtractionTasks' },
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
            name: { kind: 'Name', value: 'createContentProcessingTask' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'file' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateExtractionTasksMutation, CreateExtractionTasksMutationVariables>
export const DropOutdatedMarkdownFilesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'dropOutdatedMarkdownFiles' },
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
            name: { kind: 'Name', value: 'dropOutdatedMarkdowns' },
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
} as unknown as DocumentNode<DropOutdatedMarkdownFilesMutation, DropOutdatedMarkdownFilesMutationVariables>
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
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFileInfo_CaptionCard' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFile_MarkdownFileSelector' } },
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'originUri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'docPath' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mimeType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'archivedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'originModificationDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'latestExtractionMarkdownFileNames' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'lastUpdate' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'updateType' } },
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
      name: { kind: 'Name', value: 'AiLibraryFile_FileStatusLabels' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isLegacyFile' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulExtraction' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeMs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeMs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'supportedExtractionMethods' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isLegacyFile' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFileInfo_Files' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sourceFiles' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_InfoBox' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'originModificationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'size' } },
          { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'archivedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'taskCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'crawler' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulExtraction' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionStartedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingStartedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFileInfo_CaptionCard' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFile_FileStatusLabels' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFileInfo_Files' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryFile_InfoBox' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'originUri' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryFile_MarkdownFileSelector' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibraryFile' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'latestExtractionMarkdownFileNames' } },
          { kind: 'Field', name: { kind: 'Name', value: 'availableExtractionMarkdownFileNames' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetFileInfoQuery, GetFileInfoQueryVariables>
export const GetSimilarFileChunksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getSimilarFileChunks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'term' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'hits' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiSimilarFileChunks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'term' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'term' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'hits' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'hits' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'originUri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                { kind: 'Field', name: { kind: 'Name', value: 'section' } },
                { kind: 'Field', name: { kind: 'Name', value: 'headingPath' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunkIndex' } },
                { kind: 'Field', name: { kind: 'Name', value: 'subChunkIndex' } },
                { kind: 'Field', name: { kind: 'Name', value: 'distance' } },
                { kind: 'Field', name: { kind: 'Name', value: 'points' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSimilarFileChunksQuery, GetSimilarFileChunksQueryVariables>
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'showArchived' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
          defaultValue: { kind: 'BooleanValue', value: false },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'showArchived' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'showArchived' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'showArchived' } },
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                { kind: 'Field', name: { kind: 'Name', value: 'archivedCount' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'uploadedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dropError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'originModificationDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'archivedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'taskCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStatus' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lastSuccessfulEmbedding' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingFinishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chunksSize' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EmbeddingsTableQuery, EmbeddingsTableQueryVariables>
export const GetMarkdownDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getMarkdown' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'markdownFileName' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
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
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'markdown' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'markdownFileName' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'markdownFileName' } },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'content' } },
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
} as unknown as DocumentNode<GetMarkdownQuery, GetMarkdownQueryVariables>
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
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'owner' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'participants' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'user' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryBase' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryForm_Library' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'LibraryDeleteDialog_Library' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'User_EntityParticipantsDialog' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
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
      name: { kind: 'Name', value: 'AiLibraryForm_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeoutMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingModelName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileConverterOptions' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LibraryDeleteDialog_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
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
            name: { kind: 'Name', value: 'createContentProcessingTask' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
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
} as unknown as DocumentNode<ProcessFileMutation, ProcessFileMutationVariables>
export const CreateLibraryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createLibrary' },
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
            name: { kind: 'Name', value: 'createLibrary' },
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
} as unknown as DocumentNode<CreateLibraryMutation, CreateLibraryMutationVariables>
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
export const DeleteLibraryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteLibrary' },
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
            name: { kind: 'Name', value: 'deleteLibrary' },
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
} as unknown as DocumentNode<DeleteLibraryMutation, DeleteLibraryMutationVariables>
export const ChangeLibraryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'changeLibrary' },
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
            name: { kind: 'Name', value: 'updateLibrary' },
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiLibraryForm_Library' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiLibraryForm_Library' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiLibrary' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeoutMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingModelName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileConverterOptions' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ChangeLibraryMutation, ChangeLibraryMutationVariables>
export const GetContentProcessingTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetContentProcessingTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'status' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ProcessingStatus' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiContentProcessingTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'libraryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'status' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tasks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'AiContentProcessingTask_AccordionItem' },
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
      name: { kind: 'Name', value: 'AiContentProcessingTask_Timeline' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiContentProcessingTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStartedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFinishedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingFailedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingTimeout' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingModelName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'extractionSubTasks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionMethod' } },
                { kind: 'Field', name: { kind: 'Name', value: 'markdownFileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'finishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedAt' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AiContentProcessingTask_AccordionItem' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiContentProcessingTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AiContentProcessingTask_Timeline' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'file' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'library' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'fileConverterOptions' } }],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timeoutMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionOptions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'extractionStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'embeddingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingTimeMs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'chunksCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'chunksSize' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'extractionSubTasks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'extractionMethod' } },
                { kind: 'Field', name: { kind: 'Name', value: 'markdownFileName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'finishedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetContentProcessingTasksQuery, GetContentProcessingTasksQueryVariables>
export const CancelProcessingTaskDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'cancelProcessingTask' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'taskId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
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
            name: { kind: 'Name', value: 'cancelProcessingTask' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'taskId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'taskId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
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
} as unknown as DocumentNode<CancelProcessingTaskMutation, CancelProcessingTaskMutationVariables>
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
                      { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'uriType' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'message' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updateType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filePath' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filterType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'filterValue' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LibraryUpdatesListQuery, LibraryUpdatesListQueryVariables>
export const UpdateLibraryParticipantsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateLibraryParticipants' },
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
            name: { kind: 'Name', value: 'updateLibraryParticipants' },
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
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalParticipants' } },
                { kind: 'Field', name: { kind: 'Name', value: 'addedParticipants' } },
                { kind: 'Field', name: { kind: 'Name', value: 'removedParticipants' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateLibraryParticipantsMutation, UpdateLibraryParticipantsMutationVariables>
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'participantId' } },
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
                name: { kind: 'Name', value: 'participantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'participantId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveLibraryParticipantMutation, RemoveLibraryParticipantMutationVariables>
export const GetContentQueriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getContentQueries' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'libraryId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiContentQueries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'listName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetContentQueriesQuery, GetContentQueriesQueryVariables>
export const GetEnrichmentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getEnrichments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'status' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'EnrichmentStatus' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiListEnrichments' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'status' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'take' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'statusCounts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'enrichments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'EnrichmentAccordionItem_Enrichment' } },
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
      name: { kind: 'Name', value: 'EnrichmentAccordionItem_Enrichment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiEnrichmentTask' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
          { kind: 'Field', name: { kind: 'Name', value: 'requestedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'startedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'completedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'processingData' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'input' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'aiModel' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'aiGenerationPrompt' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'contextFields' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'errorMessage' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'dataType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'libraryEmbeddingModel' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'output' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'similarChunks' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fileName' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fileId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'distance' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'messages' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'aiInstance' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'enrichedValue' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'issues' } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'error' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'field' },
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
            name: { kind: 'Name', value: 'file' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
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
            kind: 'Field',
            name: { kind: 'Name', value: 'list' },
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
} as unknown as DocumentNode<GetEnrichmentsQuery, GetEnrichmentsQueryVariables>
export const GetListItemsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getListItems' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sorting' } },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListSortingInput' } },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldIds' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'filters' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListFilterInput' } },
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
            name: { kind: 'Name', value: 'aiListItems' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldIds' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'filters' } },
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sorting' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sorting' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                { kind: 'Field', name: { kind: 'Name', value: 'take' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'origin' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'libraryName' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'displayValue' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'enrichmentErrorMessage' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'queueStatus' } },
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
} as unknown as DocumentNode<GetListItemsQuery, GetListItemsQueryVariables>
export const GetListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getList' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiList' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListsBase' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListStatistics_AiList' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListEditForm_List' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListSourcesManager_List' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTable_List' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTableMenu_AiList' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListMenu_AiList' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'fields' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTableFilters_AiListField' } },
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldSettings_Field' } },
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
      name: { kind: 'Name', value: 'FieldModal_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'failureTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
          { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'context' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'contextFieldId' } }],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTable_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'listId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'processingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pendingItemsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'FieldModal_Field' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FieldModal_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'User_EntityParticipantsDialog' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'given_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'family_name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'profile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'business' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListsBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
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
      name: { kind: 'Name', value: 'ListStatistics_AiList' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'statistics' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'itemCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cacheCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'valuesCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'completedTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'failedTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pendingTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'processingTasksCount' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListEditForm_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListSourcesManager_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sources' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'library' },
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
                          selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
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
      name: { kind: 'Name', value: 'ListFieldsTable_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTable_Field' } }],
            },
          },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'FieldModal_List' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldsTableMenu_AiList' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
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
      name: { kind: 'Name', value: 'ListMenu_AiList' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'ownerId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'owner' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'User_EntityParticipantsDialog' } },
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
      name: { kind: 'Name', value: 'ListFieldsTableFilters_AiListField' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListFieldSettings_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListFieldsTable_Field' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetListQuery, GetListQueryVariables>
export const GetUserListsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getUserLists' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiLists' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListsBase' } },
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListMenu_AiLists' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListsBase' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
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
      name: { kind: 'Name', value: 'ListMenu_AiLists' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserListsQuery, GetUserListsQueryVariables>
export const AddListFieldDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addListField' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListFieldInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addListField' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
                { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
                { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddListFieldMutation, AddListFieldMutationVariables>
export const AddListSourceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'addListSource' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListSourceInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addListSource' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'library' },
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
                          selections: [{ kind: 'Field', name: { kind: 'Name', value: 'name' } }],
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
} as unknown as DocumentNode<AddListSourceMutation, AddListSourceMutationVariables>
export const ClearEnrichmentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ClearEnrichments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'clearListEnrichments' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'createdTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpEnrichmentsCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ClearEnrichmentsMutation, ClearEnrichmentsMutationVariables>
export const CreateListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createList' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createList' },
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
} as unknown as DocumentNode<CreateListMutation, CreateListMutationVariables>
export const DeleteListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteList' },
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
            name: { kind: 'Name', value: 'deleteList' },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteListMutation, DeleteListMutationVariables>
export const ListExportDataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ListExportData' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldIds' } },
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
            name: { kind: 'Name', value: 'aiList' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListExport_List' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'aiListItems' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldIds' } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'origin' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'libraryId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'libraryName' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldId' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'fieldName' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'displayValue' } },
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
      name: { kind: 'Name', value: 'ListExport_Field' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListField' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'order' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ListExport_List' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AiList' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'fields' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'ListExport_Field' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ListExportDataQuery, ListExportDataQueryVariables>
export const UpdateListParticipantsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateListParticipants' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
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
            name: { kind: 'Name', value: 'updateListParticipants' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userIds' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'addedParticipants' } },
                { kind: 'Field', name: { kind: 'Name', value: 'removedParticipants' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalParticipants' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateListParticipantsMutation, UpdateListParticipantsMutationVariables>
export const RemoveListParticipantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeListParticipant' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
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
            name: { kind: 'Name', value: 'removeListParticipant' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'participantId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'participantId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveListParticipantMutation, RemoveListParticipantMutationVariables>
export const RemoveFromEnrichmentQueueDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeFromEnrichmentQueue' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
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
            name: { kind: 'Name', value: 'deletePendingEnrichmentTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'createdTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpEnrichmentsCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveFromEnrichmentQueueMutation, RemoveFromEnrichmentQueueMutationVariables>
export const RemoveListFieldDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeListField' },
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
            name: { kind: 'Name', value: 'removeListField' },
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
} as unknown as DocumentNode<RemoveListFieldMutation, RemoveListFieldMutationVariables>
export const RemoveListSourceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'removeListSource' },
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
            name: { kind: 'Name', value: 'removeListSource' },
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
} as unknown as DocumentNode<RemoveListSourceMutation, RemoveListSourceMutationVariables>
export const ReorderListFieldsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'reorderListFields' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'newPlace' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'reorderListFields' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'newPlace' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'newPlace' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReorderListFieldsMutation, ReorderListFieldsMutationVariables>
export const CreateListEnrichmentTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateListEnrichmentTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'onlyMissingValues' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'filters' } },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListFilterInput' } },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createEnrichmentTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'onlyMissingValues' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'onlyMissingValues' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'filters' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'createdTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpEnrichmentsCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateListEnrichmentTasksMutation, CreateListEnrichmentTasksMutationVariables>
export const StartSingleEnrichmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'startSingleEnrichment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
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
            name: { kind: 'Name', value: 'createEnrichmentTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fileId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fileId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'onlyMissingValues' },
                value: { kind: 'BooleanValue', value: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'createdTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpEnrichmentsCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StartSingleEnrichmentMutation, StartSingleEnrichmentMutationVariables>
export const StopListEnrichmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'StopListEnrichment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePendingEnrichmentTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'listId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'listId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fieldId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fieldId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpTasksCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cleanedUpEnrichmentsCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdTasksCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StopListEnrichmentMutation, StopListEnrichmentMutationVariables>
export const UpdateListFieldDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateListField' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListFieldInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateListField' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fileProperty' } },
                { kind: 'Field', name: { kind: 'Name', value: 'prompt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'useVectorStore' } },
                { kind: 'Field', name: { kind: 'Name', value: 'contentQuery' } },
                { kind: 'Field', name: { kind: 'Name', value: 'languageModel' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateListFieldMutation, UpdateListFieldMutationVariables>
export const UpdateListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateList' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'AiListInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateList' },
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
} as unknown as DocumentNode<UpdateListMutation, UpdateListMutationVariables>
export const AiChatModelsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiChatModels' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'aiChatModels' } }],
      },
    },
  ],
} as unknown as DocumentNode<AiChatModelsQuery, AiChatModelsQueryVariables>
export const AiEmbeddingModelsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'aiEmbeddingModels' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'aiEmbeddingModels' } }],
      },
    },
  ],
} as unknown as DocumentNode<AiEmbeddingModelsQuery, AiEmbeddingModelsQueryVariables>
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
export const UpdateUserAvatarDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'updateUserAvatar' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'avatarUrl' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUserAvatar' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'avatarUrl' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'avatarUrl' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserAvatarMutation, UpdateUserAvatarMutationVariables>
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
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'avatarUrl' } },
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
