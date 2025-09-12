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
      // Should include all values including defaults that weren't specified
      const encodedPrompt = encodeURIComponent(
        'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
      )
      expect(result).toBe(
        `enableTextExtraction,enableImageProcessing,ocrPrompt=${encodedPrompt},ocrModel=gpt-4,ocrTimeout=180,ocrImageScale=1.5,ocrMaxConsecutiveRepeats=5,ocrLoopDetectionThreshold=5`,
      )
    })

    it('should handle options with default values', () => {
      const input = 'enableTextExtraction'
      const result = validateFileConverterOptionsString(input)
      // Should include all default values
      const encodedPrompt = encodeURIComponent(
        'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
      )
      expect(result).toBe(
        `enableTextExtraction,ocrPrompt=${encodedPrompt},ocrModel=qwen2.5vl:latest,ocrTimeout=120,ocrImageScale=1.5,ocrMaxConsecutiveRepeats=5,ocrLoopDetectionThreshold=5`,
      )
    })

    it('should return serialized string even when all values are defaults', () => {
      const input = 'ocrModel=qwen2.5vl:latest,ocrTimeout=120'
      const result = validateFileConverterOptionsString(input)
      // Should include all values even if they're defaults
      const encodedPrompt = encodeURIComponent(
        'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
      )
      expect(result).toBe(
        `ocrPrompt=${encodedPrompt},ocrModel=qwen2.5vl:latest,ocrTimeout=120,ocrImageScale=1.5,ocrMaxConsecutiveRepeats=5,ocrLoopDetectionThreshold=5`,
      )
    })
  })

  describe('parseFileConverterOptions', () => {
    it('should parse null to default values', () => {
      const result = parseFileConverterOptions(null)
      expect(result).toEqual({
        ocrImageScale: 1.5,
        enableTextExtraction: false,
        enableImageProcessing: false,
        ocrPrompt:
          'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
        ocrModel: 'qwen2.5vl:latest',
        ocrTimeout: 120,
        ocrLoopDetectionThreshold: 5,
        ocrMaxConsecutiveRepeats: 5,
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

    it('should handle ocrPrompt with encoded commas', () => {
      const prompt = 'Extract: item1, item2, item3'
      const encodedPrompt = encodeURIComponent(prompt)
      const result = parseFileConverterOptions(`ocrPrompt=${encodedPrompt}`)
      expect(result.ocrPrompt).toBe(prompt)
    })

    it('should handle ocrPrompt with encoded special characters', () => {
      const prompt = 'Use format: list, separated, values & symbols (100%)'
      const encodedPrompt = encodeURIComponent(prompt)
      const result = parseFileConverterOptions(`enableImageProcessing,ocrPrompt=${encodedPrompt},ocrModel=gpt-4`)
      expect(result.ocrPrompt).toBe(prompt)
      expect(result.enableImageProcessing).toBe(true)
      expect(result.ocrModel).toBe('gpt-4')
    })
  })

  describe('serializeFileConverterOptions', () => {
    it('should include all values even if they are defaults', () => {
      const options = {
        enableTextExtraction: false,
        enableImageProcessing: false,
        ocrPrompt:
          'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
        ocrModel: 'qwen2.5vl:latest',
        ocrTimeout: 120,
        ocrLoopDetectionThreshold: 5,
        ocrImageScale: 2.1,
        ocrMaxConsecutiveRepeats: 3,
      }
      const result = serializeFileConverterOptions(options)
      // Should include all values for consistency
      const encodedPrompt = encodeURIComponent(
        'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
      )
      expect(result).toBe(
        `ocrPrompt=${encodedPrompt},ocrModel=qwen2.5vl:latest,ocrTimeout=120,ocrImageScale=2.1,ocrMaxConsecutiveRepeats=3,ocrLoopDetectionThreshold=5`,
      )
    })

    it('should serialize boolean flags and all other values', () => {
      const options = {
        enableTextExtraction: true,
        enableImageProcessing: true,
        ocrPrompt:
          'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
        ocrModel: 'qwen2.5vl:latest',
        ocrTimeout: 120,
        ocrLoopDetectionThreshold: 5,
        ocrImageScale: 4.7,
        ocrMaxConsecutiveRepeats: 7,
      }
      const result = serializeFileConverterOptions(options)
      const encodedPrompt = encodeURIComponent(
        'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
      )
      expect(result).toBe(
        `enableTextExtraction,enableImageProcessing,ocrPrompt=${encodedPrompt},ocrModel=qwen2.5vl:latest,ocrTimeout=120,ocrImageScale=4.7,ocrMaxConsecutiveRepeats=7,ocrLoopDetectionThreshold=5`,
      )
    })

    it('should only include non-default values', () => {
      const options = {
        enableTextExtraction: true,
        enableImageProcessing: false,
        ocrPrompt: 'Custom prompt',
        ocrModel: 'gpt-4',
        ocrTimeout: 180,
        ocrLoopDetectionThreshold: 10,
        ocrImageScale: 1.8,
        ocrMaxConsecutiveRepeats: 10,
      }
      const result = serializeFileConverterOptions(options)
      expect(result).toBe(
        'enableTextExtraction,ocrPrompt=Custom%20prompt,ocrModel=gpt-4,ocrTimeout=180,ocrImageScale=1.8,ocrMaxConsecutiveRepeats=10,ocrLoopDetectionThreshold=10',
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

    it('should maintain data with special characters through parse and serialize', () => {
      const promptWithSpecialChars = 'Extract: item1, item2, item3 & more (100%)'
      const encoded = encodeURIComponent(promptWithSpecialChars)
      const original = `enableImageProcessing,ocrPrompt=${encoded},ocrModel=gpt-4`

      const parsed = parseFileConverterOptions(original)
      const serialized = serializeFileConverterOptions(parsed)
      const reparsed = parseFileConverterOptions(serialized)

      expect(reparsed).toEqual(parsed)
      expect(reparsed.ocrPrompt).toBe(promptWithSpecialChars)
    })

    it('should handle validateFileConverterOptionsString round-trip with encoding', () => {
      const promptWithCommas = 'Format: list, separated, values'
      const encoded = encodeURIComponent(promptWithCommas)
      const input = `enableImageProcessing,ocrPrompt=${encoded},ocrModel=gpt-4`

      const validated = validateFileConverterOptionsString(input)
      expect(validated).not.toBeNull()

      const parsed = parseFileConverterOptions(validated!)
      expect(parsed.ocrPrompt).toBe(promptWithCommas)
      expect(parsed.enableImageProcessing).toBe(true)
      expect(parsed.ocrModel).toBe('gpt-4')
    })
  })
})
