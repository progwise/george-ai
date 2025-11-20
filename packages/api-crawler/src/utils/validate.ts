/**
 * Configuration validation using Zod
 */
import { z } from 'zod'

import type { ApiCrawlerConfig } from '../types'

/**
 * Zod schema for API crawler configuration
 */
export const apiCrawlerConfigSchema = z.object({
  baseUrl: z.string().url('Base URL must be a valid URL'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),

  authType: z.enum(['none', 'apiKey', 'oauth2', 'basic', 'bearer']),
  authConfig: z.object({
    apiKey: z.string().optional(),
    apiKeyHeader: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    tokenUrl: z.string().url().optional(),
    scope: z.string().optional(),
    accessToken: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    token: z.string().optional(),
  }),

  headers: z.record(z.string()).optional(),
  queryParams: z.record(z.string()).optional(),

  paginationType: z.enum(['offset', 'page', 'cursor', 'none']),
  paginationConfig: z.object({
    limitParam: z.string().optional(),
    offsetParam: z.string().optional(),
    defaultLimit: z.number().positive().optional(),
    pageParam: z.string().optional(),
    pageSizeParam: z.string().optional(),
    defaultPageSize: z.number().positive().optional(),
    cursorParam: z.string().optional(),
    nextCursorPath: z.string().optional(),
  }),

  dataPath: z.string().min(1, 'Data path is required'),
  hasMorePath: z.string().optional(),
  totalCountPath: z.string().optional(),

  fieldMapping: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    metadata: z.record(z.string()).optional(),
  }),

  requestDelay: z.number().nonnegative().optional(),
  maxConcurrency: z.number().positive().optional(),
  retryCount: z.number().nonnegative().optional(),
  retryDelay: z.number().nonnegative().optional(),
})

/**
 * Validate API crawler configuration
 */
export function validateConfig(config: unknown): ApiCrawlerConfig {
  return apiCrawlerConfigSchema.parse(config) as ApiCrawlerConfig
}

/**
 * Validate config and return errors without throwing
 */
export function validateConfigSafe(config: unknown): { success: boolean; errors?: string[]; data?: ApiCrawlerConfig } {
  const result = apiCrawlerConfigSchema.safeParse(config)

  if (result.success) {
    return { success: true, data: result.data as ApiCrawlerConfig }
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
  }
}
