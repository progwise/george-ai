/**
 * Field mapping tests
 */
import { describe, expect, it } from 'vitest'

import { mapFields, mapFieldsMulti } from './index'

describe('mapFields', () => {
  it('should auto-extract title from "name" field', () => {
    const item = {
      name: 'Test Product',
      description: 'Product description',
      price: 99.99,
    }

    const result = mapFields(item)

    expect(result.title).toBe('Test Product')
    expect(result.content).toBe(JSON.stringify(item))
    expect(result.raw).toBe(item)
  })

  it('should auto-extract title from "title" field', () => {
    const item = {
      title: 'Product Title',
      description: 'Description',
    }

    const result = mapFields(item)

    expect(result.title).toBe('Product Title')
    expect(result.raw).toBe(item)
  })

  it('should fallback to "id" field if no common title fields exist', () => {
    const item = {
      id: 12345,
      description: 'Product description',
    }

    const result = mapFields(item)

    expect(result.title).toBe('Item 12345')
  })

  it('should fallback to first string field if no common fields exist', () => {
    const item = {
      someRandomField: 'Random Value',
      anotherField: 42,
    }

    const result = mapFields(item)

    expect(result.title).toBe('Random Value')
  })

  it('should use "Item" as fallback title for non-object items', () => {
    const result = mapFields('string value')

    expect(result.title).toBe('Item')
  })

  it('should use "Item" as fallback title for empty object', () => {
    const item = {}

    const result = mapFields(item)

    expect(result.title).toBe('Item')
  })

  it('should preserve raw data', () => {
    const item = {
      name: 'Product',
      nested: {
        field: 'value',
      },
      array: [1, 2, 3],
    }

    const result = mapFields(item)

    expect(result.raw).toBe(item)
    expect(result.raw).toEqual({
      name: 'Product',
      nested: { field: 'value' },
      array: [1, 2, 3],
    })
  })

  it('should convert entire object to JSON string for content', () => {
    const item = {
      name: 'Product',
      price: 99.99,
      active: true,
    }

    const result = mapFields(item)

    expect(result.content).toBe(JSON.stringify(item))
  })

  it('should handle arrays in content', () => {
    const item = {
      name: 'Product',
      tags: ['tag1', 'tag2'],
    }

    const result = mapFields(item)

    expect(result.content).toBe(JSON.stringify(item))
    expect(result.content).toContain('"tags":["tag1","tag2"]')
  })

  it('should handle null values', () => {
    const item = {
      name: 'Product',
      description: null,
    }

    const result = mapFields(item)

    expect(result.title).toBe('Product')
    expect(result.content).toBe(JSON.stringify(item))
  })
})

describe('mapFieldsMulti', () => {
  it('should map multiple items', () => {
    const items = [
      { name: 'Product 1', price: 10 },
      { name: 'Product 2', price: 20 },
      { name: 'Product 3', price: 30 },
    ]

    const results = mapFieldsMulti(items)

    expect(results).toHaveLength(3)
    expect(results[0].title).toBe('Product 1')
    expect(results[1].title).toBe('Product 2')
    expect(results[2].title).toBe('Product 3')
    expect(results[0].raw).toBe(items[0])
    expect(results[1].raw).toBe(items[1])
    expect(results[2].raw).toBe(items[2])
  })

  it('should handle empty array', () => {
    const items: unknown[] = []

    const results = mapFieldsMulti(items)

    expect(results).toHaveLength(0)
  })

  it('should auto-extract titles from different field names', () => {
    const items = [
      { name: 'Item with name' },
      { title: 'Item with title' },
      { label: 'Item with label' },
      { id: 123 },
      { someField: 'Fallback string' },
    ]

    const results = mapFieldsMulti(items)

    expect(results[0].title).toBe('Item with name')
    expect(results[1].title).toBe('Item with title')
    expect(results[2].title).toBe('Item with label')
    expect(results[3].title).toBe('Item 123')
    expect(results[4].title).toBe('Fallback string')
  })
})
