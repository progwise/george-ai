import { z } from 'zod'

import {
  ActionType,
  AiAssistantInput,
  AiAutomationInput,
  AiBaseCaseInputType,
  AiConnectorInput,
  AiConversationCreateInput,
  AiConversationMessageInput,
  AiLibraryCrawlerCredentialsInput,
  AiLibraryCrawlerCronJobInput,
  AiLibraryCrawlerInput,
  AiListFieldContextInput,
  AiListFieldInput,
  AiListFilterInput,
  AiListFilterType,
  AiListInput,
  AiListSortingDirection,
  AiListSortingInput,
  AiListSourceInput,
  AutomationItemStatus,
  BatchStatus,
  ConnectorConfigInput,
  ConversationInvitationInput,
  ConversationSortOrder,
  CrawlerUriType,
  DateTimePeriod,
  EmbeddingStatus,
  EnrichmentStatus,
  EventProcessingStatus,
  ExtractionMethod,
  FileChunksSelector,
  LibraryFilesSortField,
  LibraryInput,
  LibrarySortField,
  ListFieldContextType,
  ListFieldFileProperty,
  ListFieldSourceType,
  ListFieldType,
  ModelCallType,
  ModelProvider,
  ModelProviderInput,
  PrepareUploadInput,
  ProcessFileInput,
  ProcessFilesInput,
  ProviderHealthStatus,
  QueueType,
  SortOrder,
  TriggerType,
  UpdateAiLanguageModelInput,
  UserProfileInput,
  WorkerType,
  WorkspaceRole,
  WorkspaceSortField,
} from './graphql'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>
}>

type definedNonNullAny = {}

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v))

export const ActionTypeSchema = z.nativeEnum(ActionType)

export const AiListFilterTypeSchema = z.nativeEnum(AiListFilterType)

export const AiListSortingDirectionSchema = z.nativeEnum(AiListSortingDirection)

export const AutomationItemStatusSchema = z.nativeEnum(AutomationItemStatus)

export const BatchStatusSchema = z.nativeEnum(BatchStatus)

export const ConversationSortOrderSchema = z.nativeEnum(ConversationSortOrder)

export const CrawlerUriTypeSchema = z.nativeEnum(CrawlerUriType)

export const EmbeddingStatusSchema = z.nativeEnum(EmbeddingStatus)

export const EnrichmentStatusSchema = z.nativeEnum(EnrichmentStatus)

export const EventProcessingStatusSchema = z.nativeEnum(EventProcessingStatus)

export const ExtractionMethodSchema = z.nativeEnum(ExtractionMethod)

export const LibraryFilesSortFieldSchema = z.nativeEnum(LibraryFilesSortField)

export const LibrarySortFieldSchema = z.nativeEnum(LibrarySortField)

export const ListFieldContextTypeSchema = z.nativeEnum(ListFieldContextType)

export const ListFieldFilePropertySchema = z.nativeEnum(ListFieldFileProperty)

export const ListFieldSourceTypeSchema = z.nativeEnum(ListFieldSourceType)

export const ListFieldTypeSchema = z.nativeEnum(ListFieldType)

export const ModelCallTypeSchema = z.nativeEnum(ModelCallType)

export const ModelProviderSchema = z.nativeEnum(ModelProvider)

export const ProviderHealthStatusSchema = z.nativeEnum(ProviderHealthStatus)

export const QueueTypeSchema = z.nativeEnum(QueueType)

export const SortOrderSchema = z.nativeEnum(SortOrder)

export const TriggerTypeSchema = z.nativeEnum(TriggerType)

export const WorkerTypeSchema = z.nativeEnum(WorkerType)

export const WorkspaceRoleSchema = z.nativeEnum(WorkspaceRole)

export const WorkspaceSortFieldSchema = z.nativeEnum(WorkspaceSortField)

export function AiAssistantInputSchema(): z.ZodObject<Properties<AiAssistantInput>> {
  return z.object({
    description: z.string().nullish(),
    icon: z.string().nullish(),
    languageModelId: z.string().nullish(),
    name: z.string(),
    url: z.string().nullish(),
  })
}

export function AiAutomationInputSchema(): z.ZodObject<Properties<AiAutomationInput>> {
  return z.object({
    actionConfig: z.string().nullish(),
    connectorAction: z.string().nullish(),
    connectorId: z.string(),
    executeOnEnrichment: z.boolean().nullish(),
    filter: z.string().nullish(),
    listId: z.string(),
    name: z.string(),
    schedule: z.string().nullish(),
  })
}

export function AiBaseCaseInputTypeSchema(): z.ZodObject<Properties<AiBaseCaseInputType>> {
  return z.object({
    condition: z.string().nullish(),
    id: z.string().nullish(),
    instruction: z.string().nullish(),
    sequence: z.number().nullish(),
  })
}

export function AiConnectorInputSchema(): z.ZodObject<Properties<AiConnectorInput>> {
  return z.object({
    baseUrl: z.string(),
    config: z.lazy(() => ConnectorConfigInputSchema()),
    connectorType: z.string(),
    name: z.string().nullish(),
  })
}

export function AiConversationCreateInputSchema(): z.ZodObject<Properties<AiConversationCreateInput>> {
  return z.object({
    assistantIds: z.array(z.string()),
    userIds: z.array(z.string()),
  })
}

export function AiConversationMessageInputSchema(): z.ZodObject<Properties<AiConversationMessageInput>> {
  return z.object({
    content: z.string(),
    conversationId: z.string(),
    recipientAssistantIds: z.array(z.string()),
  })
}

export function AiLibraryCrawlerCredentialsInputSchema(): z.ZodObject<Properties<AiLibraryCrawlerCredentialsInput>> {
  return z.object({
    boxCustomerId: z.string().nullish(),
    boxToken: z.string().nullish(),
    password: z.string().nullish(),
    sharepointAuth: z.string().nullish(),
    username: z.string().nullish(),
  })
}

export function AiLibraryCrawlerCronJobInputSchema(): z.ZodObject<Properties<AiLibraryCrawlerCronJobInput>> {
  return z.object({
    active: z.boolean(),
    friday: z.boolean(),
    hour: z.number(),
    minute: z.number(),
    monday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
    thursday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
  })
}

export function AiLibraryCrawlerInputSchema(): z.ZodObject<Properties<AiLibraryCrawlerInput>> {
  return z.object({
    allowedMimeTypes: z.array(z.string()).nullish(),
    crawlerConfig: z.string().nullish(),
    cronJob: z.lazy(() => AiLibraryCrawlerCronJobInputSchema().nullish()),
    excludePatterns: z.array(z.string()).nullish(),
    includePatterns: z.array(z.string()).nullish(),
    maxDepth: z.number(),
    maxFileSize: z.number().nullish(),
    maxPages: z.number(),
    minFileSize: z.number().nullish(),
    uri: z.string(),
    uriType: CrawlerUriTypeSchema,
  })
}

export function AiListFieldContextInputSchema(): z.ZodObject<Properties<AiListFieldContextInput>> {
  return z.object({
    contextFieldId: z.string().nullish(),
    contextQuery: z.string().nullish(),
    contextType: ListFieldContextTypeSchema,
    maxContentTokens: z.number().nullish(),
  })
}

export function AiListFieldInputSchema(): z.ZodObject<Properties<AiListFieldInput>> {
  return z.object({
    contextSources: z.array(z.lazy(() => AiListFieldContextInputSchema())).nullish(),
    failureTerms: z.string().nullish(),
    fileProperty: z.string().nullish(),
    languageModelId: z.string().nullish(),
    name: z.string(),
    order: z.number().nullish(),
    prompt: z.string().nullish(),
    sourceType: ListFieldSourceTypeSchema,
    type: ListFieldTypeSchema,
  })
}

export function AiListFilterInputSchema(): z.ZodObject<Properties<AiListFilterInput>> {
  return z.object({
    fieldId: z.string(),
    filterType: AiListFilterTypeSchema,
    value: z.string(),
  })
}

export function AiListInputSchema(): z.ZodObject<Properties<AiListInput>> {
  return z.object({
    name: z.string(),
  })
}

export function AiListSortingInputSchema(): z.ZodObject<Properties<AiListSortingInput>> {
  return z.object({
    direction: AiListSortingDirectionSchema,
    fieldId: z.string(),
  })
}

export function AiListSourceInputSchema(): z.ZodObject<Properties<AiListSourceInput>> {
  return z.object({
    libraryId: z.string(),
  })
}

export function ConnectorConfigInputSchema(): z.ZodObject<Properties<ConnectorConfigInput>> {
  return z.object({
    apiKey: z.string().nullish(),
    clientId: z.string().nullish(),
    clientSecret: z.string().nullish(),
    token: z.string().nullish(),
  })
}

export function ConversationInvitationInputSchema(): z.ZodObject<Properties<ConversationInvitationInput>> {
  return z.object({
    allowDifferentEmailAddress: z.boolean(),
    allowMultipleParticipants: z.boolean(),
    email: z.string(),
  })
}

export function DateTimePeriodSchema(): z.ZodObject<Properties<DateTimePeriod>> {
  return z.object({
    earliest: z.string().nullish(),
    latest: z.string().nullish(),
  })
}

export function FileChunksSelectorSchema(): z.ZodObject<Properties<FileChunksSelector>> {
  return z.object({
    chunk: z.number().nullish(),
    contentGlobPattern: z.string().nullish(),
    creationAuthorGlobPattern: z.string().nullish(),
    extractionMethod: ExtractionMethodSchema.nullish(),
    fileCreatedAt: DateTimePeriodSchema().nullish(),
    fileHash: z.string().nullish(),
    fileId: z.string().nullish(),
    fileMimeTypeGlobPattern: z.string().nullish(),
    filePathGlobPattern: z.string().nullish(),
    fileUpdatedAt: DateTimePeriodSchema().nullish(),
    fileUploadedAt: DateTimePeriodSchema().nullish(),
    filenameGlobPattern: z.string().nullish(),
    fragment: z.number().nullish(),
    libraryId: z.string().nullish(),
    modelName: z.string().nullish(),
    updateAuthorGlobPattern: z.string().nullish(),
  })
}

export function LibraryInputSchema(): z.ZodObject<Properties<LibraryInput>> {
  return z.object({
    autoProcessCrawledFiles: z.boolean().nullish(),
    description: z.string().nullish(),
    embeddingModelId: z.string().nullish(),
    embeddingTimeoutMs: z.number().nullish(),
    fileConverterOptions: z.string().nullish(),
    name: z.string(),
    ocrModelId: z.string().nullish(),
    url: z.string().nullish(),
  })
}

export function ModelProviderInputSchema(): z.ZodObject<Properties<ModelProviderInput>> {
  return z.object({
    apiKey: z.string().nullish(),
    baseUrl: z.string().nullish(),
    enabled: z.boolean().nullish(),
    name: z.string(),
    provider: z.string(),
    vramGb: z.number().nullish(),
  })
}

export function PrepareUploadInputSchema(): z.ZodObject<Properties<PrepareUploadInput>> {
  return z.object({
    libraryId: z.string(),
    mimeType: z.string(),
    name: z.string(),
    originModificationDate: z.string(),
    originUri: z.string(),
    size: z.number(),
  })
}

export function ProcessFileInputSchema(): z.ZodObject<Properties<ProcessFileInput>> {
  return z.object({
    actionType: ActionTypeSchema,
    fileId: z.string(),
    fragment: z.number().nullish(),
    libraryId: z.string(),
  })
}

export function ProcessFilesInputSchema(): z.ZodObject<Properties<ProcessFilesInput>> {
  return z.object({
    actionType: ActionTypeSchema,
    fileIds: z.array(z.string()),
    libraryId: z.string(),
  })
}

export function UpdateAiLanguageModelInputSchema(): z.ZodObject<Properties<UpdateAiLanguageModelInput>> {
  return z.object({
    adminNotes: z.string().nullish(),
    enabled: z.boolean(),
  })
}

export function UserProfileInputSchema(): z.ZodObject<Properties<UserProfileInput>> {
  return z.object({
    business: z.string().nullish(),
    email: z.string(),
    firstName: z.string().nullish(),
    freeMessages: z.number().nullish(),
    freeStorage: z.number().nullish(),
    lastName: z.string().nullish(),
    position: z.string().nullish(),
  })
}
