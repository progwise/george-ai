import { z } from 'zod'
import {
  AiAssistantInput,
  AiAssistantType,
  AiKnowledgeSourceFileInput,
  AiKnowledgeSourceInput,
  AiKnowledgeSourceType,
  RetrievalFlow,
  UserInput,
} from './graphql'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>
}>

type definedNonNullAny = {}

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v))

export const AiAssistantTypeSchema = z.nativeEnum(AiAssistantType)

export const AiKnowledgeSourceTypeSchema = z.nativeEnum(AiKnowledgeSourceType)

export const RetrievalFlowSchema = z.nativeEnum(RetrievalFlow)

export function AiAssistantInputSchema(): z.ZodObject<
  Properties<AiAssistantInput>
> {
  return z.object({
    aiAssistantType: AiAssistantTypeSchema,
    description: z.string().nullish(),
    icon: z.string().nullish(),
    name: z.string(),
    url: z.string().nullish(),
  })
}

export function AiKnowledgeSourceFileInputSchema(): z.ZodObject<
  Properties<AiKnowledgeSourceFileInput>
> {
  return z.object({
    aiKnowledgeSourceId: z.string(),
    content: z.string(),
    mimeType: z.string(),
    name: z.string(),
    url: z.string(),
  })
}

export function AiKnowledgeSourceInputSchema(): z.ZodObject<
  Properties<AiKnowledgeSourceInput>
> {
  return z.object({
    aiKnowledgeSourceType: AiKnowledgeSourceTypeSchema,
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
