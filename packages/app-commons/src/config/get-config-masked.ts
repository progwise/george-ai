import { ConfigKey } from './common'
import { getConfigValue } from './get-config-value'
import { isConfigured } from './is-configured'

export function getConfigMasked(key: ConfigKey) {
  if (!isConfigured(key)) {
    return null
  }
  switch (key) {
    case 'DATABASE_URL':
      return getConfigValue('DATABASE_URL').replace(/(:\/\/)(.*)(@)/, '$1****:****$3')
    case 'OLLAMA_INSTANCES':
      return getConfigValue('OLLAMA_INSTANCES').map((instance) => ({
        ...instance,
        apiKey: instance.apiKey ? instance.apiKey.replace(/^(....).*(....)$/, '$1****************$2') : '',
      }))
    case 'OPENAI_API_KEY':
      return getConfigValue('OPENAI_API_KEY')!.replace(/^(....).*(....)$/, '$1****************$2')
    case 'TEST_DB_PASSWORD':
      return '*'.repeat(getConfigValue('TEST_DB_PASSWORD').length)
    default:
      return getConfigValue(key)
  }
}
