import { z } from 'zod'

import {
  AiAssistantInput,
  AiBaseCaseInputType,
  AiConversationCreateInput,
  AiConversationMessageInput,
  AiLibraryCrawlerCronJobInput,
  AiLibraryFileInput,
  AiLibraryInput,
  RetrievalFlow,
  UserInput,
  UserProfileInput,
} from './graphql'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>
}>

type definedNonNullAny = {}

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v))

export const RetrievalFlowSchema = z.nativeEnum(RetrievalFlow)

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
    ownerId: z.string(),
    recipientAssistantIds: z.array(z.string()),
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
    icon: z.string().nullish(),
    name: z.string(),
    url: z.string().nullish(),
  })
}

export function UserInputSchema(): z.ZodObject<Properties<UserInput>> {
  return z.object({
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
