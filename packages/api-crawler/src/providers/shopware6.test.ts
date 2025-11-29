import { describe, expect, it } from 'vitest'

import { shopware6Provider } from './shopware6'

describe('shopware6Provider', () => {
  describe('extractTitle', () => {
    it('should extract translated name', () => {
      const item = { translated: { name: 'Test Product' } }
      expect(shopware6Provider.extractTitle(item)).toBe('Test Product')
    })

    it('should fallback to name field', () => {
      const item = { name: 'Fallback Name' }
      expect(shopware6Provider.extractTitle(item)).toBe('Fallback Name')
    })

    it('should return undefined when no name found', () => {
      const item = { id: '123' }
      expect(shopware6Provider.extractTitle(item)).toBeUndefined()
    })
  })

  describe('buildOriginUri', () => {
    it('should build correct origin URI', () => {
      const item = { id: 'abc-123' }
      expect(shopware6Provider.buildOriginUri('https://shop.example.com', item)).toBe(
        'https://shop.example.com/api/product/abc-123',
      )
    })

    it('should handle trailing slash in baseUrl', () => {
      const item = { id: 'abc-123' }
      expect(shopware6Provider.buildOriginUri('https://shop.example.com/', item)).toBe(
        'https://shop.example.com/api/product/abc-123',
      )
    })

    it('should return undefined when no id', () => {
      const item = { name: 'Product' }
      expect(shopware6Provider.buildOriginUri('https://shop.example.com', item)).toBeUndefined()
    })
  })

  describe('generateMarkdown', () => {
    it('should generate markdown with title', () => {
      const item = { translated: { name: 'Test Product' } }
      const markdown = shopware6Provider.generateMarkdown(item)
      expect(markdown).toContain('# Test Product')
    })

    it('should include product number', () => {
      const item = { translated: { name: 'Test' }, productNumber: 'SKU-123' }
      const markdown = shopware6Provider.generateMarkdown(item)
      expect(markdown).toContain('**Product Number:** SKU-123')
    })

    it('should include EAN', () => {
      const item = { translated: { name: 'Test' }, ean: '1234567890123' }
      const markdown = shopware6Provider.generateMarkdown(item)
      expect(markdown).toContain('**EAN:** 1234567890123')
    })
  })
})
