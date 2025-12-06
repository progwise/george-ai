import type { z } from 'zod'

/**
 * Authentication type for connector
 */
export type AuthType = 'oauth2' | 'api_key' | 'bearer_token' | 'basic_auth'

/**
 * Status of an action execution
 */
export type ActionExecutionStatus = 'success' | 'warning' | 'failed' | 'skipped'

/**
 * Result of executing a connector action
 */
export interface ActionExecutionResult {
  status: ActionExecutionStatus
  message?: string
  data?: Record<string, unknown>
  error?: string
}

/**
 * Input for action execution
 */
export interface ActionInput {
  /** The item being processed (list item data) */
  item: {
    id: string
    name: string
    /** Enrichment field values keyed by field ID */
    fieldValues: Record<string, unknown>
  }
  /** Action-specific configuration (mappings, transforms, etc.) */
  actionConfig: Record<string, unknown>
}

/**
 * Configuration for a connector instance
 */
export interface ConnectorConfig {
  baseUrl: string
  credentials: Record<string, string>
}

/**
 * Definition of a connector action (e.g., writeProductDescription)
 */
export interface ConnectorAction {
  /** Unique identifier for the action */
  id: string
  /** Display name */
  name: string
  /** Description of what the action does */
  description: string
  /** Zod schema for action configuration */
  configSchema: z.ZodSchema
  /** Default configuration for newly created automations (will need user configuration before running) */
  defaultConfig: Record<string, unknown>
  /** Execute the action */
  execute: (connectorConfig: ConnectorConfig, input: ActionInput) => Promise<ActionExecutionResult>
  /** Get a preview of what will be written (without executing) */
  preview?: (connectorConfig: ConnectorConfig, input: ActionInput) => Promise<Record<string, unknown>>
}

/**
 * Definition of a connector type (e.g., Shopware 6)
 */
export interface ConnectorType {
  /** Unique identifier for the connector type */
  id: string
  /** Display name */
  name: string
  /** Description of the connector */
  description: string
  /** Icon identifier or URL */
  icon: string
  /** Authentication type */
  authType: AuthType
  /** Zod schema for connector credentials configuration */
  credentialsSchema: z.ZodSchema
  /** Fields that contain sensitive data and should be encrypted */
  sensitiveFields: string[]
  /** Available actions for this connector type */
  actions: ConnectorAction[]
  /** Test the connection with the given config */
  testConnection: (config: ConnectorConfig) => Promise<{
    success: boolean
    message?: string
    error?: string
  }>
  /** Get available options from the external system (e.g., languages, channels) */
  getOptions?: (config: ConnectorConfig) => Promise<{
    languages?: Array<{ id: string; name: string; code: string }>
    channels?: Array<{ id: string; name: string }>
  }>
}

/**
 * Factory for getting connector types
 */
export interface ConnectorTypeFactory {
  /** Get all available connector types */
  getAvailableTypes(): ConnectorType[]
  /** Get a specific connector type by ID */
  getType(id: string): ConnectorType | undefined
  /** Get IDs of all registered connector types */
  getTypeIds(): string[]
  /** Validate config and encrypt sensitive fields for database storage.
   * If existingConfig is provided, preserves encrypted values for sensitive fields not in config.
   */
  prepareConfigForStorage(
    connectorTypeId: string,
    config: Record<string, unknown>,
    existingConfig?: Record<string, unknown>,
  ): Record<string, unknown>
  /** Decrypt sensitive fields for use in API calls */
  prepareConfigForUse(connectorTypeId: string, storedConfig: Record<string, unknown>): Record<string, string>
  /** Test connection to external system (handles decryption internally) */
  testConnection(
    connectorTypeId: string,
    baseUrl: string,
    storedConfig: Record<string, unknown>,
  ): Promise<{ success: boolean; message?: string; error?: string }>
  /** Validate action config for a specific connector action. Returns default config if actionConfig is empty/null */
  validateActionConfig(
    connectorTypeId: string,
    actionId: string,
    actionConfig: Record<string, unknown> | null | undefined,
  ): Record<string, unknown>
  /** Get default action config for a specific connector action */
  getDefaultActionConfig(connectorTypeId: string, actionId: string): Record<string, unknown>
  /** Get the first available action ID for a connector type */
  getDefaultActionId(connectorTypeId: string): string | undefined
  /** Get config for display (sensitive fields removed) */
  getConfigForDisplay(connectorTypeId: string, storedConfig: Record<string, unknown>): Record<string, unknown>
}
