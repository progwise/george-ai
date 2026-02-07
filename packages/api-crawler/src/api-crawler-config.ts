import z from 'zod'

import { API_AUTH_TYPES, API_PROVIDER_TYPES } from '@george-ai/app-commons'

export const ApiAuthConfigSchema = z.object({
  apiKey: z.string().optional(),
  apiKeyHeader: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  tokenUrl: z.string().optional(),
  scope: z.string().optional(),
  accessToken: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
})
export type ApiAuthConfig = z.infer<typeof ApiAuthConfigSchema>

export const ApiCustomProviderConfigSchema = z.object({
  identifierField: z.string().optional(),
  titleField: z.string().optional(),
})
export type ApiCustomProviderConfig = z.infer<typeof ApiCustomProviderConfigSchema>

export const ApiCrawlerConfigSchema = z.object({
  provider: z.enum(API_PROVIDER_TYPES).optional().default('custom'),
  providerConfig: ApiCustomProviderConfigSchema.optional(),
  baseUrl: z.string(),
  endpoint: z.string(),
  authType: z.enum(API_AUTH_TYPES).optional().default('none'),
  authConfig: ApiAuthConfigSchema,
  headers: z.record(z.string()).optional(),
  queryParams: z.record(z.string()).optional(),
  associationsConfig: z
    .object({
      associations: z.array(z.string()).optional(),
    })
    .optional(),
  requestDelay: z.number().optional(),
  maxConcurrency: z.number().optional(),
  retryCount: z.number().optional(),
  retryDelay: z.number().optional(),
})

export type ApiCrawlerConfig = z.infer<typeof ApiCrawlerConfigSchema>
