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
 * Generic action config value (key-value pair for simple fields)
 */
export const actionConfigValueSchema = z.object({
  key: z.string(),
  value: z.string().nullable(),
})

export type ActionConfigValue = z.infer<typeof actionConfigValueSchema>

/**
 * Generic action field mapping (for GraphQL output)
 */
export const actionFieldMappingSchema = z.object({
  sourceFieldId: z.string(),
  targetField: z.string(),
  transform: z.string(),
})

export type ActionFieldMapping = z.infer<typeof actionFieldMappingSchema>

/**
 * Generic connector action config structure (for GraphQL output)
 */
export const connectorActionConfigSchema = z.object({
  values: z.array(actionConfigValueSchema),
  fieldMappings: z.array(actionFieldMappingSchema),
})

export type ConnectorActionConfig = z.infer<typeof connectorActionConfigSchema>

/**
 * Schema that parses raw action config JSON into the generic structure
 */
export const rawActionConfigSchema = z.record(z.unknown()).transform((config): ConnectorActionConfig => {
  const fieldMappingsRaw = config.fieldMappings
  const fieldMappings = z.array(actionFieldMappingSchema).catch([]).parse(fieldMappingsRaw)

  const values = Object.entries(config)
    .filter(([key]) => key !== 'fieldMappings')
    .map(([key, value]) => ({
      key,
      value: value == null ? null : String(value),
    }))

  return { values, fieldMappings }
})

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
