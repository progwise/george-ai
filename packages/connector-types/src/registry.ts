import { decryptConfigFields, encryptConfigFields } from './encryption'
import type { ConnectorType, ConnectorTypeFactory } from './types'

/**
 * Registry of all connector types
 */
const connectorTypes: Map<string, ConnectorType> = new Map()

/**
 * Register a connector type
 */
export function registerConnectorType(connectorType: ConnectorType): void {
  if (connectorTypes.has(connectorType.id)) {
    console.warn(`Connector type ${connectorType.id} is already registered, overwriting...`)
  }
  connectorTypes.set(connectorType.id, connectorType)
}

/**
 * Get the connector type factory
 */
export function getConnectorTypeFactory(): ConnectorTypeFactory {
  return {
    getAvailableTypes(): ConnectorType[] {
      return Array.from(connectorTypes.values())
    },

    getType(id: string): ConnectorType | undefined {
      return connectorTypes.get(id)
    },

    getTypeIds(): string[] {
      return Array.from(connectorTypes.keys())
    },

    prepareConfigForStorage(
      connectorTypeId: string,
      config: Record<string, unknown>,
      existingConfig?: Record<string, unknown>,
    ): Record<string, unknown> {
      const connectorType = connectorTypes.get(connectorTypeId)
      if (!connectorType) {
        throw new Error(`Unknown connector type: ${connectorTypeId}`)
      }

      // Merge: for sensitive fields not provided, use existing encrypted values
      const mergedConfig = { ...config }
      if (existingConfig) {
        for (const field of connectorType.sensitiveFields) {
          // If field is empty/undefined in new config, preserve existing encrypted value
          if (!config[field] && existingConfig[field]) {
            mergedConfig[field] = existingConfig[field]
          }
        }
      }

      // Validate merged config against schema
      const validated = connectorType.credentialsSchema.parse(mergedConfig)

      // Encrypt sensitive fields (only encrypts non-encrypted values)
      return encryptConfigFields(validated as Record<string, unknown>, connectorType.sensitiveFields)
    },

    prepareConfigForUse(connectorTypeId: string, storedConfig: Record<string, unknown>): Record<string, string> {
      const connectorType = connectorTypes.get(connectorTypeId)
      if (!connectorType) {
        throw new Error(`Unknown connector type: ${connectorTypeId}`)
      }

      // Decrypt sensitive fields
      const decrypted = decryptConfigFields(storedConfig, connectorType.sensitiveFields)

      // Return as Record<string, string> for credentials
      return Object.fromEntries(Object.entries(decrypted).map(([key, value]) => [key, String(value ?? '')]))
    },

    async testConnection(
      connectorTypeId: string,
      baseUrl: string,
      storedConfig: Record<string, unknown>,
    ): Promise<{ success: boolean; message?: string; error?: string }> {
      const connectorType = connectorTypes.get(connectorTypeId)
      if (!connectorType) {
        return { success: false, error: `Unknown connector type: ${connectorTypeId}` }
      }

      // Decrypt config and test connection
      const decrypted = decryptConfigFields(storedConfig, connectorType.sensitiveFields)
      const credentials = Object.fromEntries(
        Object.entries(decrypted).map(([key, value]) => [key, String(value ?? '')]),
      )

      return connectorType.testConnection({ baseUrl, credentials })
    },

    validateActionConfig(
      connectorTypeId: string,
      actionId: string,
      actionConfig: Record<string, unknown>,
    ): Record<string, unknown> {
      const connectorType = connectorTypes.get(connectorTypeId)
      if (!connectorType) {
        throw new Error(`Unknown connector type: ${connectorTypeId}`)
      }

      const action = connectorType.actions.find((a) => a.id === actionId)
      if (!action) {
        throw new Error(`Unknown action ${actionId} for connector type ${connectorTypeId}`)
      }

      // Validate against action's config schema
      return action.configSchema.parse(actionConfig) as Record<string, unknown>
    },

    getConfigForDisplay(connectorTypeId: string, storedConfig: Record<string, unknown>): Record<string, unknown> {
      const connectorType = connectorTypes.get(connectorTypeId)
      if (!connectorType) {
        return {}
      }

      // Return config with sensitive fields removed
      const result = { ...storedConfig }
      for (const field of connectorType.sensitiveFields) {
        delete result[field]
      }
      return result
    },
  }
}

/**
 * Check if a connector type is registered
 */
export function isConnectorTypeRegistered(id: string): boolean {
  return connectorTypes.has(id)
}

/**
 * Get action by connector type and action ID
 */
export function getConnectorAction(connectorTypeId: string, actionId: string) {
  const connectorType = connectorTypes.get(connectorTypeId)
  if (!connectorType) {
    return undefined
  }
  return connectorType.actions.find((action) => action.id === actionId)
}
