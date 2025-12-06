import { z } from 'zod'

/**
 * Schema for OAuth2 credentials
 */
export const oauth2CredentialsSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
})

/**
 * Schema for API key credentials
 */
export const apiKeyCredentialsSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
})

/**
 * Schema for Bearer token credentials
 */
export const bearerTokenCredentialsSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

/**
 * Schema for Basic auth credentials
 */
export const basicAuthCredentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Transform type for field mappings
 */
export const transformTypeSchema = z.enum(['raw', 'markdownToHtml', 'number', 'boolean'])

export type TransformType = z.infer<typeof transformTypeSchema>

/**
 * Schema for a single field mapping in action config
 */
export const fieldMappingSchema = z.object({
  /** The target field in the external system */
  targetField: z.string().min(1),
  /** Transform to apply */
  transform: transformTypeSchema.default('raw'),
  /** Transform settings (e.g., markdown-it options) */
  transformSettings: z.string().optional(),
  /** Language code for multi-language support */
  language: z.string().optional(),
})

export type FieldMapping = z.infer<typeof fieldMappingSchema>

/**
 * Schema for action configuration with field mappings
 */
export const actionMappingsConfigSchema = z.object({
  /** Field ID that matches items in the external system (e.g., product number) */
  matchField: z.string().min(1, 'Match field is required'),
  /** Field mappings keyed by source field ID */
  mappings: z.record(z.string(), fieldMappingSchema),
})

export type ActionMappingsConfig = z.infer<typeof actionMappingsConfigSchema>

/**
 * Validate connector credentials based on auth type
 */
export function validateCredentials(
  authType: 'oauth2' | 'api_key' | 'bearer_token' | 'basic_auth',
  credentials: unknown,
) {
  switch (authType) {
    case 'oauth2':
      return oauth2CredentialsSchema.safeParse(credentials)
    case 'api_key':
      return apiKeyCredentialsSchema.safeParse(credentials)
    case 'bearer_token':
      return bearerTokenCredentialsSchema.safeParse(credentials)
    case 'basic_auth':
      return basicAuthCredentialsSchema.safeParse(credentials)
    default:
      return { success: false, error: { message: `Unknown auth type: ${authType}` } }
  }
}
