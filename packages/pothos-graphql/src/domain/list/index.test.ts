import { describe, expect, it } from 'vitest'

import { AiListItemCache } from '../../../prisma/generated/client'
import { LIST_FIELD_TYPES, ListItemWithRelations, getFieldValue } from './index'

describe('LIST_FIELD_TYPES', () => {
  it('should include markdown type', () => {
    expect(LIST_FIELD_TYPES).toContain('markdown')
  })

  it('should have all expected types', () => {
    expect(LIST_FIELD_TYPES).toEqual(['string', 'text', 'markdown', 'number', 'date', 'datetime', 'boolean'])
  })
})

describe('getFieldValue', () => {
  // Helper to create mock item object
  const createMockItem = (cacheOverrides?: Partial<AiListItemCache>): ListItemWithRelations => {
    const baseMockItem: ListItemWithRelations = {
      id: 'item1',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      listId: 'list1',
      sourceId: 'source1',
      sourceFileId: 'file1',
      extractionIndex: null,
      metadata: null,
      sourceFile: {
        id: 'file1',
        name: 'test-document.pdf',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-17'),
        libraryId: 'library1',
        originUri: 'https://example.com/doc.pdf',
        originModificationDate: new Date('2024-01-15'),
        uploadedAt: new Date('2024-01-15'),
        dropError: null,
        archivedAt: null,
        size: 1024,
        mimeType: 'application/pdf',
        crawledByCrawlerId: 'crawler1',
        docPath: '/mock/path/to/doc.pdf',
        originFileHash: 'mockhash123',
        library: { name: 'Test Library' },
        crawledByCrawler: { uri: 'https://crawler.example.com/source' },
        contentExtractionTasks: [{ processingFinishedAt: new Date('2024-01-16') }],
      },
      cache: [
        {
          id: 'cache1',
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-18'),
          itemId: 'item1',
          fieldId: 'field1',
          valueString: 'test string value',
          valueNumber: null,
          valueBoolean: null,
          valueDate: null,
          enrichmentErrorMessage: null,
          failedEnrichmentValue: null,
          ...cacheOverrides,
        },
      ],
    }
    return baseMockItem
  }

  // Helper to create mock field object
  const createMockField = (overrides?: {
    id?: string
    name?: string
    sourceType?: 'file_property' | 'llm_computed'
    fileProperty?: string | null
    type?: string
  }) => ({
    id: 'field1',
    name: 'Test Field',
    sourceType: 'llm_computed' as const,
    fileProperty: null,
    type: 'string',
    ...overrides,
  })

  describe('markdown type', () => {
    it('should return markdown value from cache', () => {
      const item = createMockItem({
        valueString: '# Heading\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2',
      })
      const field = createMockField({ type: 'markdown' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('# Heading\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2')
      expect(result.errorMessage).toBeNull()
      expect(result.failedEnrichmentValue).toBeNull()
    })

    it('should return null value when cache has no value', () => {
      const item = createMockItem({ valueString: null })
      const field = createMockField({ type: 'markdown' })

      const result = getFieldValue(item, field)

      expect(result.value).toBeNull()
      expect(result.errorMessage).toBeNull()
    })

    it('should return error message for markdown field', () => {
      const item = createMockItem({
        valueString: null,
        enrichmentErrorMessage: 'AI model failed to generate markdown',
      })
      const field = createMockField({ type: 'markdown' })

      const result = getFieldValue(item, field)

      expect(result.value).toBeNull()
      expect(result.errorMessage).toBe('AI model failed to generate markdown')
    })

    it('should return failedEnrichmentValue for markdown field with failure term', () => {
      const item = createMockItem({
        valueString: null,
        failedEnrichmentValue: 'N/A',
      })
      const field = createMockField({ type: 'markdown' })

      const result = getFieldValue(item, field)

      expect(result.value).toBeNull()
      expect(result.failedEnrichmentValue).toBe('N/A')
    })

    it('should handle complex markdown content', () => {
      const complexMarkdown = `# Document Summary

## Overview
This document describes the **product specifications**.

## Features
- Feature 1
- Feature 2
- Feature 3

### Code Example
\`\`\`javascript
const example = 'code';
\`\`\`

## Table
| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |

> Blockquote text

[Link](https://example.com)`

      const item = createMockItem({ valueString: complexMarkdown })
      const field = createMockField({ type: 'markdown' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe(complexMarkdown)
    })
  })

  describe('text type (same behavior as markdown)', () => {
    it('should return text value from cache', () => {
      const item = createMockItem({ valueString: 'plain text value' })
      const field = createMockField({ type: 'text' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('plain text value')
    })
  })

  describe('string type (same behavior as markdown)', () => {
    it('should return string value from cache', () => {
      const item = createMockItem({ valueString: 'short string' })
      const field = createMockField({ type: 'string' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('short string')
    })
  })

  describe('number type', () => {
    it('should return number value as string', () => {
      const item = createMockItem({ valueNumber: 42.5 })
      const field = createMockField({ type: 'number' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('42.5')
    })

    it('should return null for null number value', () => {
      const item = createMockItem({ valueNumber: null })
      const field = createMockField({ type: 'number' })

      const result = getFieldValue(item, field)

      expect(result.value).toBeNull()
    })
  })

  describe('boolean type', () => {
    it('should return Yes for true boolean', () => {
      const item = createMockItem({ valueBoolean: true })
      const field = createMockField({ type: 'boolean' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('Yes')
    })

    it('should return No for false boolean', () => {
      const item = createMockItem({ valueBoolean: false })
      const field = createMockField({ type: 'boolean' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('No')
    })

    it('should return null for null boolean', () => {
      const item = createMockItem({ valueBoolean: null })
      const field = createMockField({ type: 'boolean' })

      const result = getFieldValue(item, field)

      expect(result.value).toBeNull()
    })
  })

  describe('date and datetime types', () => {
    it('should return date value as ISO string', () => {
      const item = createMockItem({ valueDate: new Date('2024-06-15T10:30:00Z') })
      const field = createMockField({ type: 'date' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('2024-06-15T10:30:00.000Z')
    })

    it('should return datetime value as ISO string', () => {
      const item = createMockItem({ valueDate: new Date('2024-06-15T10:30:00Z') })
      const field = createMockField({ type: 'datetime' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('2024-06-15T10:30:00.000Z')
    })
  })

  describe('file_property source type', () => {
    it('should return file name', () => {
      const item = createMockItem()
      const field = createMockField({ sourceType: 'file_property', fileProperty: 'name' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('test-document.pdf')
      expect(result.errorMessage).toBeNull()
      expect(result.failedEnrichmentValue).toBeNull()
    })

    it('should return library name for source property', () => {
      const item = createMockItem()
      const field = createMockField({ sourceType: 'file_property', fileProperty: 'source' })

      const result = getFieldValue(item, field)

      expect(result.value).toBe('Test Library')
    })
  })

  describe('edge cases', () => {
    it('should return error message for unknown field type', () => {
      const item = createMockItem()
      const field = createMockField({ type: 'unknown_type' })

      const result = getFieldValue(item, field)

      expect(result.value).toBeNull()
      expect(result.errorMessage).toBe('unknown field type')
    })

    it('should return dash when no cache exists', () => {
      const item = {
        ...createMockItem(),
        cache: [],
      }
      const field = createMockField()

      const result = getFieldValue(item, field)

      expect(result.value).toBe('-')
      expect(result.errorMessage).toBeNull()
    })
  })
})
