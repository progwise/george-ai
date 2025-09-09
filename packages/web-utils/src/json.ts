export const safeJsonParse = (
  str?: string | null,
): { success: true; data: object } | { success: false; error: Error } => {
  if (!str) {
    return { success: true, data: {} }
  }
  try {
    return { success: true, data: JSON.parse(str) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error('Invalid JSON') }
  }
}

export const mergeObjectToJsonString = (originalJson?: string | null, newData?: object | null): string | null => {
  if (!newData) {
    return originalJson ?? null
  }
  const parsed = safeJsonParse(originalJson)
  if (!parsed.success) {
    console.warn('Failed to parse JSON, overwriting with new data:', parsed.error)
    console.warn('Original JSON:', originalJson)
    console.warn('New Data:', newData)
    return originalJson ?? null
  }
  return JSON.stringify({ ...parsed.data, ...newData })
}
