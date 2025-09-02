import { describe, expect, it } from 'vitest'

import {
  parseFileConverterOptions,
  serializeFileConverterOptions,
  validateFileConverterOptionsString,
} from './file-converter-options'

describe('fileConverterOptions validation', () => {
  describe('validateFileConverterOptionsString', () => {
    it('should return null for null input', () => {
      expect(validateFileConverterOptionsString(null)).toBe(null)
    })

    it('should return null for undefined input', () => {
      expect(validateFileConverterOptionsString(undefined)).toBe(null)
    })

    it('should return null for empty string', () => {
      expect(validateFileConverterOptionsString('')).toBe(null)
    })

    it('should return null for whitespace-only string', () => {
      expect(validateFileConverterOptionsString('   ')).toBe(null)
    })

    it('should validate and normalize a valid options string', () => {
      const input = 'enableTextExtraction,enableImageProcessing,ocrModel=gpt-4,ocrTimeout=180'
      const result = validateFileConverterOptionsString(input)
      expect(result).toBe('enableTextExtraction,enableImageProcessing,ocrModel=gpt-4,ocrTimeout=180')
    })

    it('should handle options with default values', () => {
      const input = 'enableTextExtraction'
      const result = validateFileConverterOptionsString(input)
      expect(result).toBe('enableTextExtraction')
    })

    it('should return null when all values are defaults', () => {
      const input = 'ocrModel=qwen2.5vl:latest,ocrTimeout=120'
      const result = validateFileConverterOptionsString(input)
      expect(result).toBe(null)
    })
  })

  describe('parseFileConverterOptions', () => {
    it('should parse null to default values', () => {
      const result = parseFileConverterOptions(null)
      expect(result).toEqual({
        enableTextExtraction: false,
        enableImageProcessing: false,
        ocrPrompt:
          'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
        ocrModel: 'qwen2.5vl:latest',
        ocrTimeout: 120,
        ocrLoopDetectionThreshold: 5,
      })
    })

    it('should parse boolean flags correctly', () => {
      const result = parseFileConverterOptions('enableTextExtraction,enableImageProcessing')
      expect(result.enableTextExtraction).toBe(true)
      expect(result.enableImageProcessing).toBe(true)
    })

    it('should parse key-value pairs correctly', () => {
      const result = parseFileConverterOptions('ocrModel=gpt-4,ocrTimeout=300')
      expect(result.ocrModel).toBe('gpt-4')
      expect(result.ocrTimeout).toBe(300)
    })

    it('should handle mixed flags and key-value pairs', () => {
      const result = parseFileConverterOptions('enableTextExtraction,ocrModel=claude-3,ocrTimeout=240')
      expect(result.enableTextExtraction).toBe(true)
      expect(result.enableImageProcessing).toBe(false)
      expect(result.ocrModel).toBe('claude-3')
      expect(result.ocrTimeout).toBe(240)
    })

    it('should handle ocrPrompt with equals signs in the value', () => {
      const prompt = 'Extract content where x=5 and y=10'
      const result = parseFileConverterOptions(`ocrPrompt=${prompt}`)
      expect(result.ocrPrompt).toBe(prompt)
    })
  })

  describe('serializeFileConverterOptions', () => {
    it('should return empty string for all default values', () => {
      const options = {
        enableTextExtraction: false,
        enableImageProcessing: false,
        ocrPrompt:
          'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
        ocrModel: 'qwen2.5vl:latest',
        ocrTimeout: 120,
        ocrLoopDetectionThreshold: 5,
      }
      const result = serializeFileConverterOptions(options)
      expect(result).toBe('')
    })

    it('should serialize boolean flags', () => {
      const options = {
        enableTextExtraction: true,
        enableImageProcessing: true,
        ocrPrompt:
          'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
        ocrModel: 'qwen2.5vl:latest',
        ocrTimeout: 120,
        ocrLoopDetectionThreshold: 5,
      }
      const result = serializeFileConverterOptions(options)
      expect(result).toBe('enableTextExtraction,enableImageProcessing')
    })

    it('should only include non-default values', () => {
      const options = {
        enableTextExtraction: true,
        enableImageProcessing: false,
        ocrPrompt: 'Custom prompt',
        ocrModel: 'gpt-4',
        ocrTimeout: 180,
        ocrLoopDetectionThreshold: 10,
      }
      const result = serializeFileConverterOptions(options)
      expect(result).toBe(
        'enableTextExtraction,ocrPrompt=Custom prompt,ocrModel=gpt-4,ocrTimeout=180,ocrLoopDetectionThreshold=10',
      )
    })
  })

  describe('round-trip conversion', () => {
    it('should maintain data through parse and serialize', () => {
      const original = 'enableTextExtraction,enableImageProcessing,ocrModel=claude-3,ocrTimeout=300'
      const parsed = parseFileConverterOptions(original)
      const serialized = serializeFileConverterOptions(parsed)
      const reparsed = parseFileConverterOptions(serialized)

      expect(reparsed).toEqual(parsed)
    })
  })
})
