import { CONFIG_KEYS } from './common'
import { getConfigMasked } from './get-config-masked'
import { getConfigValue } from './get-config-value'

export function getConfigEntries(noMask?: boolean) {
  return CONFIG_KEYS.map((key) => ({ key, value: noMask ? getConfigValue(key) : getConfigMasked(key) }))
}
