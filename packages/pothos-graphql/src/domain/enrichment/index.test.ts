import { describe, expect, it } from 'vitest'

import { EnrichmentMetadataSchema, substituteTemplate } from './index'

describe('substituteTemplate', () => {
  describe('Basic Functionality', () => {
    it('should substitute single field placeholder', () => {
      const result = substituteTemplate('Search for {{productName}}', [
        { fieldName: 'productName', value: 'iPhone 15' },
      ])
      expect(result).toBe('Search for iPhone 15')
    })

    it('should substitute multiple field placeholders', () => {
      const result = substituteTemplate('{{productName}} by {{manufacturer}}', [
        { fieldName: 'productName', value: 'iPhone 15' },
        { fieldName: 'manufacturer', value: 'Apple' },
      ])
      expect(result).toBe('iPhone 15 by Apple')
    })

    it('should substitute same field multiple times', () => {
      const result = substituteTemplate('{{name}} and {{name}} again', [{ fieldName: 'name', value: 'Product' }])
      expect(result).toBe('Product and Product again')
    })

    it('should handle template with no placeholders', () => {
      const result = substituteTemplate('Search for products', [{ fieldName: 'productName', value: 'iPhone' }])
      expect(result).toBe('Search for products')
    })

    it('should handle empty template', () => {
      const result = substituteTemplate('', [])
      expect(result).toBe('')
    })
  })

  describe('Case Sensitivity', () => {
    it('should be case-insensitive for field names', () => {
      const result = substituteTemplate('{{ProductName}} {{MANUFACTURER}}', [
        { fieldName: 'productname', value: 'iPhone' },
        { fieldName: 'manufacturer', value: 'Apple' },
      ])
      expect(result).toBe('iPhone Apple')
    })

    it('should match field names with mixed case', () => {
      const result = substituteTemplate('{{productName}}', [{ fieldName: 'ProductName', value: 'Test' }])
      expect(result).toBe('Test')
    })

    it('should preserve template case when no match', () => {
      // When field is missing, template should remain unchanged in the null return path
      const result = substituteTemplate('{{ProductName}}', [{ fieldName: 'other', value: 'Test' }])
      expect(result).toBeNull()
    })
  })

  describe('Whitespace Handling', () => {
    it('should trim whitespace in placeholder field names', () => {
      const result = substituteTemplate('{{ productName }}', [{ fieldName: 'productName', value: 'iPhone' }])
      expect(result).toBe('iPhone')
    })

    it('should handle extra whitespace in placeholders', () => {
      const result = substituteTemplate('{{  productName  }}', [{ fieldName: 'productName', value: 'iPhone' }])
      expect(result).toBe('iPhone')
    })

    it('should preserve whitespace outside placeholders', () => {
      const result = substituteTemplate('  {{name}}  ', [{ fieldName: 'name', value: 'Product' }])
      expect(result).toBe('  Product  ')
    })
  })

  describe('Null and Missing Values', () => {
    it('should return null if field value is null', () => {
      const result = substituteTemplate('Search for {{productName}}', [{ fieldName: 'productName', value: null }])
      expect(result).toBeNull()
    })

    it('should return null if required field is missing', () => {
      const result = substituteTemplate('Search for {{productName}}', [{ fieldName: 'manufacturer', value: 'Apple' }])
      expect(result).toBeNull()
    })

    it('should return null if any required field is null', () => {
      const result = substituteTemplate('{{name}} by {{manufacturer}}', [
        { fieldName: 'name', value: 'Product' },
        { fieldName: 'manufacturer', value: null },
      ])
      expect(result).toBeNull()
    })

    it('should handle empty field values (not null)', () => {
      const result = substituteTemplate('Search for {{productName}}', [{ fieldName: 'productName', value: '' }])
      expect(result).toBe('Search for ')
    })
  })

  describe('Special Characters', () => {
    it('should handle special characters in field values', () => {
      const result = substituteTemplate('{{description}}', [
        { fieldName: 'description', value: 'Product with "quotes" & <tags>' },
      ])
      expect(result).toBe('Product with "quotes" & <tags>')
    })

    it('should handle newlines in field values', () => {
      const result = substituteTemplate('{{description}}', [
        { fieldName: 'description', value: 'Line 1\nLine 2\nLine 3' },
      ])
      expect(result).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should handle URLs in field values', () => {
      const result = substituteTemplate('{{url}}', [
        { fieldName: 'url', value: 'https://example.com/path?query=value&other=test' },
      ])
      expect(result).toBe('https://example.com/path?query=value&other=test')
    })

    it('should handle unicode characters in field values', () => {
      const result = substituteTemplate('{{text}}', [{ fieldName: 'text', value: '日本語 emoji 🎉 测试' }])
      expect(result).toBe('日本語 emoji 🎉 测试')
    })

    it('should handle braces in field values', () => {
      const result = substituteTemplate('{{code}}', [{ fieldName: 'code', value: 'function() { return {x: 1} }' }])
      expect(result).toBe('function() { return {x: 1} }')
    })
  })

  describe('Complex Templates', () => {
    it('should handle complex query template', () => {
      const result = substituteTemplate(
        'Find documents about {{productName}} manufactured by {{manufacturer}} with specifications for {{category}}',
        [
          { fieldName: 'productName', value: 'iPhone 15 Pro' },
          { fieldName: 'manufacturer', value: 'Apple Inc.' },
          { fieldName: 'category', value: 'smartphones' },
        ],
      )
      expect(result).toBe(
        'Find documents about iPhone 15 Pro manufactured by Apple Inc. with specifications for smartphones',
      )
    })

    it('should handle URL template', () => {
      const result = substituteTemplate('https://api.example.com/products/{{productId}}/details?format={{format}}', [
        { fieldName: 'productId', value: '12345' },
        { fieldName: 'format', value: 'json' },
      ])
      expect(result).toBe('https://api.example.com/products/12345/details?format=json')
    })

    it('should handle template with field at start and end', () => {
      const result = substituteTemplate('{{prefix}} some text {{suffix}}', [
        { fieldName: 'prefix', value: 'START' },
        { fieldName: 'suffix', value: 'END' },
      ])
      expect(result).toBe('START some text END')
    })

    it('should handle adjacent placeholders', () => {
      const result = substituteTemplate('{{first}}{{second}}', [
        { fieldName: 'first', value: 'Hello' },
        { fieldName: 'second', value: 'World' },
      ])
      expect(result).toBe('HelloWorld')
    })
  })

  describe('Edge Cases', () => {
    it('should handle placeholder without closing brace', () => {
      // Malformed placeholder - should not match
      const result = substituteTemplate('{{productName text', [{ fieldName: 'productName', value: 'iPhone' }])
      expect(result).toBe('{{productName text')
    })

    it('should handle placeholder without opening brace', () => {
      // Malformed placeholder - should not match
      const result = substituteTemplate('productName}} text', [{ fieldName: 'productName', value: 'iPhone' }])
      expect(result).toBe('productName}} text')
    })

    it('should handle nested braces', () => {
      // Triple braces - regex matches {{...}} so captures "{productName"
      // This field doesn't exist, so returns null
      const result = substituteTemplate('{{{productName}}}', [{ fieldName: 'productName', value: 'iPhone' }])
      expect(result).toBeNull()
    })

    it('should ignore empty placeholder', () => {
      // Empty placeholder {{}} - regex doesn't match empty content between braces
      // This is acceptable behavior - empty placeholders are ignored
      const result = substituteTemplate('Test {{}}', [{ fieldName: 'name', value: 'Product' }])
      expect(result).toBe('Test {{}}')
    })

    it('should handle very long field values', () => {
      const longValue = 'x'.repeat(10000)
      const result = substituteTemplate('{{description}}', [{ fieldName: 'description', value: longValue }])
      expect(result).toBe(longValue)
    })

    it('should handle many placeholders', () => {
      const fields = Array.from({ length: 20 }, (_, i) => ({
        fieldName: `field${i}`,
        value: `value${i}`,
      }))
      const template = fields.map((_, i) => `{{field${i}}}`).join(' ')
      const expected = fields.map((f) => f.value).join(' ')

      const result = substituteTemplate(template, fields)
      expect(result).toBe(expected)
    })

    it('should handle numeric field values', () => {
      const result = substituteTemplate('Product {{id}}', [{ fieldName: 'id', value: '12345' }])
      expect(result).toBe('Product 12345')
    })

    it('should handle boolean-like field values', () => {
      const result = substituteTemplate('Available: {{available}}', [{ fieldName: 'available', value: 'true' }])
      expect(result).toBe('Available: true')
    })
  })

  describe('Real-World Use Cases', () => {
    it('should handle vector search query template', () => {
      const result = substituteTemplate('Technical specifications for {{productName}} {{modelNumber}}', [
        { fieldName: 'productName', value: 'MacBook Pro' },
        { fieldName: 'modelNumber', value: 'M3 Max' },
      ])
      expect(result).toBe('Technical specifications for MacBook Pro M3 Max')
    })

    it('should handle web API URL template', () => {
      const result = substituteTemplate('https://weidinger.at/produkte/{{productId}}', [
        { fieldName: 'productId', value: '3285' },
      ])
      expect(result).toBe('https://weidinger.at/produkte/3285')
    })

    it('should handle web search URL with query params', () => {
      const result = substituteTemplate('https://google.com/search?q={{productName}}+{{category}}', [
        { fieldName: 'productName', value: 'iPhone 15' },
        { fieldName: 'category', value: 'smartphone' },
      ])
      expect(result).toBe('https://google.com/search?q=iPhone 15+smartphone')
    })

    it('should fail gracefully when required field is missing', () => {
      const result = substituteTemplate('Find information about {{productName}} from {{manufacturer}}', [
        { fieldName: 'productName', value: 'iPhone' },
        { fieldName: 'category', value: 'phone' }, // Wrong field
      ])
      expect(result).toBeNull()
    })
  })
})

describe('EnrichmentMetadataSchema', () => {
  describe('Input Validation', () => {
    it('should validate minimal enrichment metadata', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize this document',
          dataType: 'text',
          contextFields: [],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
    })

    it('should validate field reference context', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize this document',
          dataType: 'text',
          contextFields: [{ fieldId: 'field2', fieldName: 'Title', value: 'Test Title', errorMessage: null }],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.input?.contextFields).toHaveLength(1)
        expect(result.data.input?.contextFields[0].value).toBe('Test Title')
      }
    })

    it('should validate vector search context with all parameters', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize',
          dataType: 'text',
          contextFields: [],
          contextVectorSearches: [
            {
              queryTemplate: '{{title}} specifications',
              maxChunks: 10,
              maxDistance: 0.3,
              maxContentTokens: 2000,
            },
          ],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.input?.contextVectorSearches).toHaveLength(1)
        expect(result.data.input?.contextVectorSearches?.[0].maxChunks).toBe(10)
        expect(result.data.input?.contextVectorSearches?.[0].maxDistance).toBe(0.3)
      }
    })

    it('should validate web fetch context', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize',
          dataType: 'text',
          contextFields: [],
          contextWebFetches: [
            {
              urlTemplate: 'https://example.com/{{productId}}',
              maxContentTokens: 1500,
            },
          ],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.input?.contextWebFetches).toHaveLength(1)
        expect(result.data.input?.contextWebFetches?.[0].urlTemplate).toBe('https://example.com/{{productId}}')
      }
    })

    it('should validate metadata with all context types', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize',
          dataType: 'text',
          contextFields: [{ fieldId: 'field2', fieldName: 'Title', value: 'Test', errorMessage: null }],
          contextVectorSearches: [{ queryTemplate: '{{title}}', maxChunks: 5, maxDistance: 0.5 }],
          contextWebFetches: [{ urlTemplate: 'https://example.com/{{id}}', maxContentTokens: 1000 }],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
    })
  })

  describe('Output Validation', () => {
    it('should validate enrichment output with similar chunks', () => {
      const metadata = {
        output: {
          similarChunks: [
            {
              id: 'chunk1',
              fileName: 'test.pdf',
              fileId: 'file1',
              text: 'Chunk content',
              distance: 0.25,
            },
          ],
          messages: [{ role: 'user', content: 'Test message' }],
          issues: [],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.output?.similarChunks).toHaveLength(1)
        expect(result.data.output?.similarChunks?.[0].distance).toBe(0.25)
      }
    })

    it('should validate enrichment output with issues', () => {
      const metadata = {
        output: {
          messages: [],
          issues: ['vectorSearchSkipped: template substitution failed', 'webFetchFailed: HTTP 404'],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.output?.issues).toHaveLength(2)
      }
    })

    it('should validate output with enriched value and AI instance', () => {
      const metadata = {
        output: {
          messages: [],
          issues: [],
          enrichedValue: 'The summary text',
          aiInstance: 'http://ollama:11434',
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.output?.enrichedValue).toBe('The summary text')
        expect(result.data.output?.aiInstance).toBe('http://ollama:11434')
      }
    })
  })

  describe('Optional Fields', () => {
    it('should accept undefined for optional vector search parameters', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize',
          dataType: 'text',
          contextFields: [],
          contextVectorSearches: [
            {
              queryTemplate: '{{title}}',
              // maxChunks, maxDistance, maxContentTokens are optional
            },
          ],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
    })

    it('should accept undefined for optional input fields', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize',
          dataType: 'text',
          contextFields: [],
          // contextVectorSearches and contextWebFetches are optional
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
    })

    it('should accept null and undefined for context field values', () => {
      const metadata = {
        input: {
          fileId: 'file1',
          fileName: 'test.pdf',
          fieldId: 'field1',
          fieldName: 'Summary',
          libraryId: 'lib1',
          libraryName: 'Test Library',
          aiModelId: 'model1',
          aiModelName: 'llama3.2',
          aiGenerationPrompt: 'Summarize',
          dataType: 'text',
          contextFields: [
            { fieldId: 'field2', fieldName: 'Title', value: null, errorMessage: null },
            { fieldId: 'field3', fieldName: 'Description', value: 'Test', errorMessage: 'Enrichment failed' },
          ],
        },
      }

      const result = EnrichmentMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
    })
  })
})
