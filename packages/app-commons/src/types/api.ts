export const API_AUTH_TYPES = ['none', 'apiKey', 'oauth2', 'basic', 'bearer'] as const
export type ApiAuthType = (typeof API_AUTH_TYPES)[number]

export const API_PROVIDER_TYPES = ['shopware6', 'shopware5', 'weclapp', 'jtl', 'custom'] as const
export type ApiProviderType = (typeof API_PROVIDER_TYPES)[number]
