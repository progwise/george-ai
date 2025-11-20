/**
 * Field mapping utilities
 * Map API response fields to George AI document format
 */
import type { CrawlItem, FieldMapping } from '../types'
import { extractJsonPath } from './json-path'

/**
 * Convert any value to string safely
 */
function toString(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(toString).join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Map API response fields to George AI document format
 */
export function mapFields(item: unknown, fieldMapping: FieldMapping): CrawlItem {
  const title = fieldMapping.title ? toString(extractJsonPath(item, fieldMapping.title)) : ''

  const content = fieldMapping.content ? toString(extractJsonPath(item, fieldMapping.content)) : ''

  const metadata: Record<string, unknown> = {}

  if (fieldMapping.metadata) {
    for (const [key, path] of Object.entries(fieldMapping.metadata)) {
      const value = extractJsonPath(item, path)
      if (value !== undefined && value !== null) {
        metadata[key] = value
      }
    }
  }

  return {
    title,
    content,
    metadata,
  }
}

/**
 * Map multiple items
 */
export function mapFieldsMulti(items: unknown[], fieldMapping: FieldMapping): CrawlItem[] {
  return items.map((item) => mapFields(item, fieldMapping))
}
