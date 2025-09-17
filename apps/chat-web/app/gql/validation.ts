import { z } from 'zod'

import {
  AiAssistantInput,
  AiBaseCaseInputType,
  AiConversationCreateInput,
  AiConversationMessageInput,
  AiLibraryCrawlerCredentialsInput,
  AiLibraryCrawlerCronJobInput,
  AiLibraryCrawlerInput,
  AiLibraryCrawlerUriType,
  AiLibraryFileInput,
  AiLibraryInput,
  AiListFieldInput,
  AiListFilterInput,
  AiListFilterType,
  AiListInput,
  AiListSourceInput,
  ConversationInvitationInput,
  EmbeddingStatus,
  EnrichmentStatus,
  ExtractionStatus,
  ListFieldSourceType,
  ListFieldType,
  ProcessingStatus,
  QueueType,
  UserInput,
  UserProfileInput,
} from './graphql'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>
}>

type definedNonNullAny = {}

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v))

export const AiLibraryCrawlerUriTypeSchema = z.nativeEnum(AiLibraryCrawlerUriType)

export const AiListFilterTypeSchema = z.nativeEnum(AiListFilterType)

export const EmbeddingStatusSchema = z.nativeEnum(EmbeddingStatus)

export const EnrichmentStatusSchema = z.nativeEnum(EnrichmentStatus)

export const ExtractionStatusSchema = z.nativeEnum(ExtractionStatus)

export const ListFieldSourceTypeSchema = z.nativeEnum(ListFieldSourceType)

export const ListFieldTypeSchema = z.nativeEnum(ListFieldType)

export const ProcessingStatusSchema = z.nativeEnum(ProcessingStatus)

export const QueueTypeSchema = z.nativeEnum(QueueType)

export function AiAssistantInputSchema(): z.ZodObject<Properties<AiAssistantInput>> {
  return z.object({
    description: z.string().nullish(),
    icon: z.string().nullish(),
    languageModel: z.string().nullish(),
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
    cronJob: z.lazy(() => AiLibraryCrawlerCronJobInputSchema().nullish()),
    excludePatterns: z.array(z.string()).nullish(),
    includePatterns: z.array(z.string()).nullish(),
    maxDepth: z.number(),
    maxFileSize: z.number().nullish(),
    maxPages: z.number(),
    minFileSize: z.number().nullish(),
    uri: z.string(),
    uriType: AiLibraryCrawlerUriTypeSchema,
  })
}

export function AiLibraryFileInputSchema(): z.ZodObject<Properties<AiLibraryFileInput>> {
  return z.object({
    libraryId: z.string(),
    mimeType: z.string(),
    name: z.string(),
    originUri: z.string(),
  })
}

export function AiLibraryInputSchema(): z.ZodObject<Properties<AiLibraryInput>> {
  return z.object({
    description: z.string().nullish(),
    embeddingModelName: z.string().nullish(),
    embeddingTimeoutMs: z.number().nullish(),
    fileConverterOptions: z.string().nullish(),
    icon: z.string().nullish(),
    name: z.string(),
    url: z.string().nullish(),
  })
}

export function AiListFieldInputSchema(): z.ZodObject<Properties<AiListFieldInput>> {
  return z.object({
    contentQuery: z.string().nullish(),
    context: z.array(z.string()).nullish(),
    fileProperty: z.string().nullish(),
    languageModel: z.string().nullish(),
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

export function AiListSourceInputSchema(): z.ZodObject<Properties<AiListSourceInput>> {
  return z.object({
    libraryId: z.string(),
  })
}

export function ConversationInvitationInputSchema(): z.ZodObject<Properties<ConversationInvitationInput>> {
  return z.object({
    allowDifferentEmailAddress: z.boolean(),
    allowMultipleParticipants: z.boolean(),
    email: z.string(),
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
