import { getAvailableMethodsForMimeType, isMethodAvailableForMimeType } from './file-converter-options'

describe('fileConverterOptions', () => {
  it('get available extraction methods for a MIME type', () => {
    const methods = getAvailableMethodsForMimeType('application/pdf')

    const methodNames = methods.map((m) => m.extractionMethod)
    expect(methodNames).toContain('pdf-extraction')
    expect(methodNames).toContain('text-extraction')
  })
  it('returns empty array for unsupported MIME type', () => {
    const methods = getAvailableMethodsForMimeType('application/unknown')
    expect(methods).toEqual([])
  })
  it('returns empty array for null MIME type', () => {
    const methods = getAvailableMethodsForMimeType(null as unknown as string)
    expect(methods).toEqual([])
  })
  it('is text extraction available for application/pdf', () => {
    const isAvailable = isMethodAvailableForMimeType('text-extraction', 'application/pdf')
    expect(isAvailable).toBe(true)
  })
  it('is pdf-extraction available for application/pdf', () => {
    const isAvailable = isMethodAvailableForMimeType('pdf-extraction', 'application/pdf')
    expect(isAvailable).toBe(true)
  })
  it('is docx-extraction available for application/pdf', () => {
    const isAvailable = isMethodAvailableForMimeType('docx-extraction', 'application/pdf')
    expect(isAvailable).toBe(false)
  })
  it('is text-extraction available for null MIME type', () => {
    const isAvailable = isMethodAvailableForMimeType('text-extraction', null)
    expect(isAvailable).toBe(false)
  })
})
