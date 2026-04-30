import { getAvailableMethodsForMimeType, isMethodAvailableForMimeType } from './file-converter-options'

describe('fileConverterOptions', () => {
  it('get available extraction methods for a MIME type', () => {
    const methods = getAvailableMethodsForMimeType('application/pdf')

    const methodNames = methods.map((m) => m.extractionMethod)
    expect(methodNames).toContain('pdfExtraction')
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
    const isAvailable = isMethodAvailableForMimeType('textExtraction', 'application/pdf')
    expect(isAvailable).toBe(false)
  })
  it('is pdfExtraction available for application/pdf', () => {
    const isAvailable = isMethodAvailableForMimeType('pdfExtraction', 'application/pdf')
    expect(isAvailable).toBe(true)
  })
  it('is docxExtraction available for application/pdf', () => {
    const isAvailable = isMethodAvailableForMimeType('docxExtraction', 'application/pdf')
    expect(isAvailable).toBe(false)
  })
  it('is textExtraction available for null MIME type', () => {
    const isAvailable = isMethodAvailableForMimeType('textExtraction', null)
    expect(isAvailable).toBe(false)
  })
})
