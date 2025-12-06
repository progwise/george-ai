/**
 * Shopware 6 Connector Type
 *
 * Enables writing enrichment data back to Shopware 6 e-commerce platform
 */
import { z } from 'zod'

import { registerConnectorType } from '../registry'
import type { ConnectorConfig, ConnectorType } from '../types'
import { oauth2CredentialsSchema } from '../validation'
import { writeProductDescriptionAction } from './actions'
import { createApiClient, getLanguages, getSalesChannels, testConnection } from './api'

/**
 * Shopware 6 connector type definition
 */
export const shopware6ConnectorType: ConnectorType = {
  id: 'shopware6',
  name: 'Shopware 6',
  description: 'Connect to Shopware 6 e-commerce platform to update product descriptions and metadata',
  icon: 'shopware',
  authType: 'oauth2',
  credentialsSchema: oauth2CredentialsSchema,
  sensitiveFields: ['clientSecret'],

  actions: [writeProductDescriptionAction],

  async testConnection(config: ConnectorConfig) {
    return testConnection(config.baseUrl, {
      clientId: config.credentials.clientId,
      clientSecret: config.credentials.clientSecret,
    })
  },

  async getOptions(config: ConnectorConfig) {
    const client = await createApiClient(config.baseUrl, {
      clientId: config.credentials.clientId,
      clientSecret: config.credentials.clientSecret,
    })

    const [languages, channels] = await Promise.all([getLanguages(client), getSalesChannels(client)])

    return {
      languages: languages.map((lang) => ({
        id: lang.id,
        name: lang.name,
        code: lang.localeCode,
      })),
      channels: channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
      })),
    }
  },
}

// Zod schema for credentials (same as oauth2CredentialsSchema but with more descriptive messages)
export const shopware6CredentialsSchema = z.object({
  clientId: z.string().min(1, 'Shopware Integration Client ID is required'),
  clientSecret: z.string().min(1, 'Shopware Integration Client Secret is required'),
})

/**
 * Register the Shopware 6 connector type
 */
export function registerShopware6Connector(): void {
  registerConnectorType(shopware6ConnectorType)
}

// Auto-register when imported
registerShopware6Connector()

// Re-export for external use
export * from './api'
export * from './auth'
