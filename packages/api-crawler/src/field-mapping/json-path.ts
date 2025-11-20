/**
 * JSONPath extraction utilities
 */
import { JSONPath } from 'jsonpath-plus'

/**
 * Extract value from object using JSONPath
 * Returns the first match or undefined
 */
export function extractJsonPath(data: unknown, path: string): unknown {
  if (!path || path === '') {
    return data
  }

  // Simple property access (optimization for common case)
  if (!path.includes('.') && !path.includes('[')) {
    return (data as Record<string, unknown>)?.[path]
  }

  try {
    // Ensure path starts with $ for JSONPath
    const jsonPath = path.startsWith('$') ? path : `$.${path}`

    const result = JSONPath({
      path: jsonPath,
      json: data as any,
      wrap: false,
    })

    return result
  } catch (error) {
    console.error(`Error extracting JSONPath ${path}:`, error)
    return undefined
  }
}

/**
 * Extract multiple values using JSONPath
 * Returns array of matches
 */
export function extractJsonPathMulti(data: unknown, path: string): unknown[] {
  if (!path || path === '') {
    return [data]
  }

  try {
    const jsonPath = path.startsWith('$') ? path : `$.${path}`

    const result = JSONPath({
      path: jsonPath,
      json: data as any,
      wrap: true,
    })

    return Array.isArray(result) ? result : [result]
  } catch (error) {
    console.error(`Error extracting JSONPath ${path}:`, error)
    return []
  }
}

/**
 * Check if a JSONPath exists in data
 */
export function hasJsonPath(data: unknown, path: string): boolean {
  const value = extractJsonPath(data, path)
  return value !== undefined && value !== null
}
