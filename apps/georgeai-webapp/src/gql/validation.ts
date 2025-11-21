import { z } from 'zod'

import {
  AiAssistantInput,
  AiBaseCaseInputType,
  AiConversationCreateInput,
  AiConversationMessageInput,
  AiLibraryCrawlerCredentialsInput,
  AiLibraryCrawlerCronJobInput,
  AiLibraryCrawlerInput,
  AiLibraryFileInput,
  AiLibraryFileSortOrder,
  AiLibraryInput,
  AiListFieldInput,
  AiListFilterInput,
  AiListFilterType,
  AiListInput,
  AiListSortingDirection,
  AiListSortingInput,
  AiListSourceInput,
  AiServiceProviderInput,
  ConversationInvitationInput,
  ConversationSortOrder,
  CrawlerUriType,
  EmbeddingStatus,
  EnrichmentStatus,
  ExtractionStatus,
  LibrarySortOrder,
  ListFieldFileProperty,
  ListFieldSourceType,
  ListFieldType,
  ProcessingStatus,
  QueueType,
  TestProviderConnectionInput,
  UpdateAiLanguageModelInput,
  UserInput,
  UserProfileInput,
} from './graphql'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>
}>

type definedNonNullAny = {}

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v))

export const AiLibraryFileSortOrderSchema = z.nativeEnum(AiLibraryFileSortOrder)

export const AiListFilterTypeSchema = z.nativeEnum(AiListFilterType)

export const AiListSortingDirectionSchema = z.nativeEnum(AiListSortingDirection)

export const ConversationSortOrderSchema = z.nativeEnum(ConversationSortOrder)

export const CrawlerUriTypeSchema = z.nativeEnum(CrawlerUriType)

export const EmbeddingStatusSchema = z.nativeEnum(EmbeddingStatus)

export const EnrichmentStatusSchema = z.nativeEnum(EnrichmentStatus)

export const ExtractionStatusSchema = z.nativeEnum(ExtractionStatus)

export const LibrarySortOrderSchema = z.nativeEnum(LibrarySortOrder)

export const ListFieldFilePropertySchema = z.nativeEnum(ListFieldFileProperty)

export const ListFieldSourceTypeSchema = z.nativeEnum(ListFieldSourceType)

export const ListFieldTypeSchema = z.nativeEnum(ListFieldType)

export const ProcessingStatusSchema = z.nativeEnum(ProcessingStatus)

export const QueueTypeSchema = z.nativeEnum(QueueType)

export function AiAssistantInputSchema(): z.ZodObject<Properties<AiAssistantInput>> {
  return z.object({
    description: z.string().nullish(),
    icon: z.string().nullish(),
    languageModelId: z.string().nullish(),
    name: z.string(),
    url: z.string().nullish(),
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

export function AiLibraryFileInputSchema(): z.ZodObject<Properties<AiLibraryFileInput>> {
  return z.object({
    libraryId: z.string(),
    mimeType: z.string(),
    name: z.string(),
    originModificationDate: z.string(),
    originUri: z.string(),
    size: z.number(),
  })
}

export function AiLibraryInputSchema(): z.ZodObject<Properties<AiLibraryInput>> {
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

export function AiListFieldInputSchema(): z.ZodObject<Properties<AiListFieldInput>> {
  return z.object({
    contentQuery: z.string().nullish(),
    context: z.array(z.string()).nullish(),
    failureTerms: z.string().nullish(),
    fileProperty: z.string().nullish(),
    languageModelId: z.string().nullish(),
    name: z.string(),
    order: z.number().nullish(),
    prompt: z.string().nullish(),
    sourceType: ListFieldSourceTypeSchema,
    type: ListFieldTypeSchema,
    useVectorStore: z.boolean().nullish(),
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

export function AiServiceProviderInputSchema(): z.ZodObject<Properties<AiServiceProviderInput>> {
  return z.object({
    apiKey: z.string().nullish(),
    baseUrl: z.string().nullish(),
    enabled: z.boolean().nullish(),
    name: z.string(),
    provider: z.string(),
    vramGb: z.number().nullish(),
  })
}

export function ConversationInvitationInputSchema(): z.ZodObject<Properties<ConversationInvitationInput>> {
  return z.object({
    allowDifferentEmailAddress: z.boolean(),
    allowMultipleParticipants: z.boolean(),
    email: z.string(),
  })
}

export function TestProviderConnectionInputSchema(): z.ZodObject<Properties<TestProviderConnectionInput>> {
  return z.object({
    apiKey: z.string().nullish(),
    baseUrl: z.string().nullish(),
    provider: z.string(),
    providerId: z.string().nullish(),
  })
}

export function UpdateAiLanguageModelInputSchema(): z.ZodObject<Properties<UpdateAiLanguageModelInput>> {
  return z.object({
    adminNotes: z.string().nullish(),
    enabled: z.boolean(),
  })
}

export function UserInputSchema(): z.ZodObject<Properties<UserInput>> {
  return z.object({
    avatarUrl: z.string().nullish(),
    email: z.string(),
    family_name: z.string().nullish(),
    given_name: z.string().nullish(),
    name: z.string(),
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
