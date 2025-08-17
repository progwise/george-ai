// Helper function to convert comma-separated strings to arrays
export const parseCommaList = (value: string | undefined): string[] | undefined => {
  if (!value || !value.trim()) return undefined
  return value
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

// Helper functions to parse existing filter data
export const parseJsonArray = (jsonString: string | null | undefined) => {
  if (!jsonString) return []
  try {
    return JSON.parse(jsonString) || []
  } catch {
    return []
  }
}

export const jsonArrayToString = (jsonString: string | null | undefined) => {
  const stringArray = parseJsonArray(jsonString)
  return stringArray.join(', ')
}

export const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb.toString()
}
