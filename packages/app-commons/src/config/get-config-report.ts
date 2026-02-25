import { getConfigEntries } from './get-config-entries'

export function getConfigReport() {
  const maskedEntries = getConfigEntries()
  return maskedEntries.map((entry) => `\t${entry.key.padEnd(35, '.')}: ${entry.value}`).join('\n')
}
