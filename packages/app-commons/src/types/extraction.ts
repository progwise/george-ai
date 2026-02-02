export const EXTRACTION_METHODS = [
  'csvExtraction',
  'docxExtraction',
  'emlExtraction',
  'excelExtraction',
  'htmlExtraction',
  'pdfExtraction',
  'textExtraction',
  'legacyExtraction',
] as const
export type ExtractionMethod = (typeof EXTRACTION_METHODS)[number]

export const getExtractionMethod = (value: string): ExtractionMethod => {
  if (EXTRACTION_METHODS.includes(value as ExtractionMethod)) {
    return value as ExtractionMethod
  }
  throw new Error(`Invalid ExtractionMethod: ${value}`)
}
