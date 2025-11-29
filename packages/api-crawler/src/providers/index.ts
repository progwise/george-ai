/**
 * API Providers
 * Platform-specific implementations for crawling different APIs
 */
export type { ApiProvider, CustomProviderConfig, RawApiItem } from './types'
export { shopware6Provider } from './shopware6'
export { shopware5Provider } from './shopware5'
export { weclappProvider } from './weclapp'
export { jtlProvider } from './jtl'
export { createCustomProvider } from './custom'

import type { ApiProvider, CustomProviderConfig } from './types'
import { createCustomProvider } from './custom'
import { jtlProvider } from './jtl'
import { shopware5Provider } from './shopware5'
import { shopware6Provider } from './shopware6'
import { weclappProvider } from './weclapp'

/**
 * Supported provider types
 */
export type ProviderType = 'shopware6' | 'shopware5' | 'weclapp' | 'jtl' | 'custom'

/**
 * Get a provider by type
 */
export function getProvider(
  type: ProviderType,
  baseUrl: string,
  endpoint: string,
  customConfig?: CustomProviderConfig,
): ApiProvider {
  switch (type) {
    case 'shopware6':
      return shopware6Provider

    case 'shopware5':
      return shopware5Provider

    case 'weclapp':
      return weclappProvider

    case 'jtl':
      return jtlProvider

    case 'custom':
      return createCustomProvider(baseUrl, endpoint, customConfig)

    default:
      throw new Error(`Unknown provider type: ${type}`)
  }
}
