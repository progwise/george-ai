/**
 * Field mapping utilities
 * Auto-extract basic info from raw API data
 */
import { createLogger } from '@george-ai/web-utils'

import type { CrawlItem } from '../types'

const logger = createLogger('Field Mapping')

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
 * Auto-extract title from raw data by trying common field names
 */
function extractTitle(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return 'Item'
  }

  const obj = item as Record<string, unknown>

  // Try common title field names
  const titleFields = ['name', 'title', 'label', 'displayName', 'subject', 'heading']

  for (const field of titleFields) {
    if (field in obj && obj[field]) {
      const value = toString(obj[field])
      if (value) {
        return value
      }
    }
  }

  // Fallback to id field if available
  if ('id' in obj && obj['id']) {
    return `Item ${toString(obj['id'])}`
  }

  // Last resort: use first string field
  for (const value of Object.values(obj)) {
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return 'Item'
}

/**
 * Map API response item to George AI document format
 * Auto-extracts title and converts entire object to JSON for content
 */
export function mapFields(item: unknown): CrawlItem {
  logger.debug('Auto-mapping item')
  logger.debug('Item keys:', item && typeof item === 'object' ? Object.keys(item) : typeof item)

  const title = extractTitle(item)
  logger.debug('Extracted title:', title)

  // Simple string representation of the entire object
  const content = toString(item)
  logger.debug('Generated content length:', content.length)

  return {
    title,
    content,
    raw: item,
  }
}

/**
 * Map multiple items
 */
export function mapFieldsMulti(items: unknown[]): CrawlItem[] {
  // Log the full structure of the first item to help discover available fields
  if (items.length > 0 && items[0] && typeof items[0] === 'object') {
    logger.info('=== FIRST ITEM FULL STRUCTURE (for field discovery) ===')
    logger.info(JSON.stringify(items[0], null, 2))
    logger.info('=== END FIRST ITEM ===')
  }

  return items.map((item) => mapFields(item))
}
