export const CONNECTOR_API_AUTH_TYPES = ['none', 'apiKey', 'oauth2', 'basic', 'bearer'] as const
export type ConnectorApiAuthType = (typeof CONNECTOR_API_AUTH_TYPES)[number]

export const CONNECTOR_API_PROVIDER_TYPES = ['shopware6', 'shopware5', 'weclapp', 'jtl', 'custom'] as const
export type ConnectorApiProviderType = (typeof CONNECTOR_API_PROVIDER_TYPES)[number]
