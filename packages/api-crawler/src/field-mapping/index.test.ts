/**
 * Field mapping tests
 */
import { describe, expect, it } from 'vitest'

import type { FieldMapping } from '../types'
import { mapFields, mapFieldsMulti } from './index'

describe('mapFields', () => {
  it('should map simple string fields', () => {
    const item = {
      name: 'Test Product',
      description: 'Product description',
      price: 99.99,
    }

    const mapping: FieldMapping = {
      title: 'name',
      content: 'description',
      metadata: {
        price: 'price',
      },
    }

    const result = mapFields(item, mapping)

    expect(result.title).toBe('Test Product')
    expect(result.content).toBe('Product description')
    expect(result.metadata.price).toBe(99.99)
  })

  it('should handle nested fields with dot notation', () => {
    const item = {
      product: {
        name: 'Nested Product',
        details: {
          description: 'Nested description',
        },
      },
    }

    const mapping: FieldMapping = {
      title: 'product.name',
      content: 'product.details.description',
    }

    const result = mapFields(item, mapping)

    expect(result.title).toBe('Nested Product')
    expect(result.content).toBe('Nested description')
  })

  it('should handle missing fields gracefully', () => {
    const item = {
      name: 'Product',
    }

    const mapping: FieldMapping = {
      title: 'name',
      content: 'nonexistent',
      metadata: {
        price: 'missing.field',
      },
    }

    const result = mapFields(item, mapping)

    expect(result.title).toBe('Product')
    expect(result.content).toBe('')
    expect(result.metadata.price).toBeUndefined()
  })

  it('should convert numbers to strings', () => {
    const item = {
      id: 12345,
      name: 'Product',
    }

    const mapping: FieldMapping = {
      title: 'id',
      content: 'name',
    }

    const result = mapFields(item, mapping)

    expect(result.title).toBe('12345')
    expect(result.content).toBe('Product')
  })

  it('should convert booleans to strings', () => {
    const item = {
      active: true,
      name: 'Product',
    }

    const mapping: FieldMapping = {
      title: 'active',
      content: 'name',
    }

    const result = mapFields(item, mapping)

    expect(result.title).toBe('true')
    expect(result.content).toBe('Product')
  })

  it('should convert arrays to comma-separated strings', () => {
    const item = {
      tags: ['electronics', 'gadgets', 'new'],
      name: 'Product',
    }

    const mapping: FieldMapping = {
      title: 'name',
      content: 'tags',
    }

    const result = mapFields(item, mapping)

    expect(result.content).toBe('electronics, gadgets, new')
  })

  it('should handle null and undefined values', () => {
    const item = {
      name: 'Product',
      description: null,
      category: undefined,
    }

    const mapping: FieldMapping = {
      title: 'name',
      content: 'description',
      metadata: {
        category: 'category',
      },
    }

    const result = mapFields(item, mapping)

    expect(result.title).toBe('Product')
    expect(result.content).toBe('')
    expect(result.metadata.category).toBeUndefined()
  })

  it('should handle empty field mapping', () => {
    const item = {
      name: 'Product',
      description: 'Description',
    }

    const mapping: FieldMapping = {}

    const result = mapFields(item, mapping)

    expect(result.title).toBe('')
    expect(result.content).toBe('')
    expect(result.metadata).toEqual({})
  })
})

describe('mapFieldsMulti', () => {
  it('should map multiple items', () => {
    const items = [
      { name: 'Product 1', price: 10 },
      { name: 'Product 2', price: 20 },
      { name: 'Product 3', price: 30 },
    ]

    const mapping: FieldMapping = {
      title: 'name',
      metadata: {
        price: 'price',
      },
    }

    const results = mapFieldsMulti(items, mapping)

    expect(results).toHaveLength(3)
    expect(results[0].title).toBe('Product 1')
    expect(results[1].title).toBe('Product 2')
    expect(results[2].title).toBe('Product 3')
    expect(results[0].metadata.price).toBe(10)
    expect(results[1].metadata.price).toBe(20)
    expect(results[2].metadata.price).toBe(30)
  })

  it('should handle empty array', () => {
    const items: unknown[] = []
    const mapping: FieldMapping = {
      title: 'name',
    }

    const results = mapFieldsMulti(items, mapping)

    expect(results).toHaveLength(0)
  })
})
