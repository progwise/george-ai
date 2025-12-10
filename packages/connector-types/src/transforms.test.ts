import { describe, expect, it } from 'vitest'

import { substituteFieldValues, transformValue } from './transforms'

describe('transformValue', () => {
  it('returns raw value unchanged', () => {
    expect(transformValue('hello', 'raw')).toBe('hello')
    expect(transformValue(123, 'raw')).toBe(123)
  })

  it('converts markdown to HTML', () => {
    const result = transformValue('**bold**', 'markdownToHtml')
    expect(result).toContain('<strong>bold</strong>')
  })

  it('converts to number', () => {
    expect(transformValue('42', 'number')).toBe(42)
    expect(transformValue('3.14', 'number')).toBe(3.14)
    expect(transformValue('not a number', 'number')).toBeNull()
  })

  it('converts to boolean', () => {
    expect(transformValue('true', 'boolean')).toBe(true)
    expect(transformValue('false', 'boolean')).toBe(false)
    expect(transformValue('yes', 'boolean')).toBe(true)
    expect(transformValue('1', 'boolean')).toBe(true)
    expect(transformValue(true, 'boolean')).toBe(true)
  })

  it('handles null and undefined', () => {
    expect(transformValue(null, 'raw')).toBeNull()
    expect(transformValue(undefined, 'number')).toBeUndefined()
  })
})

describe('substituteFieldValues', () => {
  it('replaces placeholders with values', () => {
    const template = 'Hello {{name}}, your order {{orderId}} is ready'
    const values = { name: 'John', orderId: '12345' }
    expect(substituteFieldValues(template, values)).toBe('Hello John, your order 12345 is ready')
  })

  it('keeps placeholder if value not found', () => {
    const template = 'Hello {{name}}'
    expect(substituteFieldValues(template, {})).toBe('Hello {{name}}')
  })

  it('handles null values by keeping placeholder', () => {
    const template = 'Value: {{field}}'
    expect(substituteFieldValues(template, { field: null })).toBe('Value: {{field}}')
  })
})
