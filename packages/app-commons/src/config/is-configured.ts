import { ConfigKey } from './common'
import { getConfigValue } from './get-config-value'

export function isConfigured(key: ConfigKey): boolean {
  try {
    const value = getConfigValue(key)
    if (!value) {
      return false
    }
    return true
  } catch {
    return false
  }
}
