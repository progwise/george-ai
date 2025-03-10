import { z } from 'zod'

import {
  AiAssistantInput,
  AiAssistantType,
  AiConversationCreateInput,
  AiConversationMessageInput,
  AiLibraryFileInput,
  AiLibraryInput,
  AiLibraryType,
  AiLibraryUsageInput,
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

export const AiAssistantTypeSchema = z.nativeEnum(AiAssistantType)

export const AiLibraryTypeSchema = z.nativeEnum(AiLibraryType)

export const RetrievalFlowSchema = z.nativeEnum(RetrievalFlow)

export function AiAssistantInputSchema(): z.ZodObject<Properties<AiAssistantInput>> {
  return z.object({
    assistantType: AiAssistantTypeSchema,
    description: z.string().nullish(),
    icon: z.string().nullish(),
    name: z.string(),
    url: z.string().nullish(),
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
    libraryType: AiLibraryTypeSchema,
    name: z.string(),
    url: z.string().nullish(),
  })
}

export function AiLibraryUsageInputSchema(): z.ZodObject<Properties<AiLibraryUsageInput>> {
  return z.object({
    assistantId: z.string(),
    libraryId: z.string(),
    use: z.boolean(),
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
    lastName: z.string().nullish(),
    position: z.string().nullish(),
  })
}
