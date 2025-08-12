/**
 * Tests for file filtering utilities
 */

import { applyFileFilters, parseFilterConfig, FileFilterConfig, FileInfo } from './file-filter'

describe('File Filter Tests', () => {
  const sampleFile: FileInfo = {
    fileName: 'test-document.pdf',
    filePath: '/documents/archive/test-document.pdf',
    fileSize: 1024 * 1024, // 1MB
    modificationDate: new Date('2024-01-01'),
  }

  describe('Include Patterns', () => {
    it('should include files matching include patterns', () => {
      const config: FileFilterConfig = {
        includePatterns: ['\\.pdf$', '\\.docx?$'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(true)
    })

    it('should exclude files not matching include patterns', () => {
      const config: FileFilterConfig = {
        includePatterns: ['\\.txt$', '\\.csv$'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(false)
      expect(result.filterType).toBe('include_pattern')
    })
  })

  describe('Exclude Patterns', () => {
    it('should exclude files matching exclude patterns', () => {
      const config: FileFilterConfig = {
        excludePatterns: ['archive', '_old'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(false)
      expect(result.filterType).toBe('exclude_pattern')
      expect(result.reason).toContain('archive')
    })

    it('should include files not matching exclude patterns', () => {
      const config: FileFilterConfig = {
        excludePatterns: ['backup', 'temp'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(true)
    })
  })

  describe('File Size Filters', () => {
    it('should exclude files larger than maxFileSize', () => {
      const config: FileFilterConfig = {
        maxFileSize: 512 * 1024, // 512KB
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(false)
      expect(result.filterType).toBe('file_size')
      expect(result.reason).toContain('exceeds maximum limit')
    })

    it('should exclude files smaller than minFileSize', () => {
      const config: FileFilterConfig = {
        minFileSize: 2 * 1024 * 1024, // 2MB
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(false)
      expect(result.filterType).toBe('file_size')
      expect(result.reason).toContain('below minimum limit')
    })

    it('should allow files within size range', () => {
      const config: FileFilterConfig = {
        minFileSize: 512 * 1024, // 512KB
        maxFileSize: 2 * 1024 * 1024, // 2MB
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(true)
    })
  })

  describe('MIME Type Filters', () => {
    it('should exclude files with disallowed MIME types', () => {
      const config: FileFilterConfig = {
        allowedMimeTypes: ['text/plain', 'text/csv'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(false)
      expect(result.filterType).toBe('mime_type')
      expect(result.reason).toContain('application/pdf')
    })

    it('should allow files with allowed MIME types', () => {
      const config: FileFilterConfig = {
        allowedMimeTypes: ['application/pdf', 'text/plain'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(true)
    })
  })

  describe('Combined Filters', () => {
    it('should apply include patterns before exclude patterns', () => {
      const config: FileFilterConfig = {
        includePatterns: ['\\.pdf$'],
        excludePatterns: ['archive'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(false)
      expect(result.filterType).toBe('exclude_pattern')
    })

    it('should pass all filters to be allowed', () => {
      const config: FileFilterConfig = {
        includePatterns: ['\\.pdf$'],
        excludePatterns: ['backup'],
        minFileSize: 512 * 1024,
        maxFileSize: 2 * 1024 * 1024,
        allowedMimeTypes: ['application/pdf'],
      }

      const result = applyFileFilters(sampleFile, config)
      expect(result.allowed).toBe(true)
    })
  })

  describe('parseFilterConfig', () => {
    it('should parse JSON configuration correctly', () => {
      const rawConfig = {
        includePatterns: '["\\\\.(pdf|docx?)$"]',
        excludePatterns: '["archive", "_old"]',
        maxFileSize: 5242880, // 5MB
        minFileSize: 1024, // 1KB
        allowedMimeTypes: '["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]',
      }

      const result = parseFilterConfig(rawConfig)

      expect(result.includePatterns).toEqual(['\\.(?:pdf|docx?)$'])
      expect(result.excludePatterns).toEqual(['archive', '_old'])
      expect(result.maxFileSize).toBe(5242880)
      expect(result.minFileSize).toBe(1024)
      expect(result.allowedMimeTypes).toEqual([
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ])
    })

    it('should handle invalid JSON gracefully', () => {
      const rawConfig = {
        includePatterns: 'invalid json',
        excludePatterns: null,
        maxFileSize: null,
        minFileSize: null,
        allowedMimeTypes: null,
      }

      const result = parseFilterConfig(rawConfig)

      expect(result.includePatterns).toBeUndefined()
      expect(result.excludePatterns).toBeUndefined()
      expect(result.maxFileSize).toBeUndefined()
      expect(result.minFileSize).toBeUndefined()
      expect(result.allowedMimeTypes).toBeUndefined()
    })
  })
})