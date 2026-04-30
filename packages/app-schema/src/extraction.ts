import z from 'zod'

export const EXTRACTION_METHODS = [
  'csvExtraction',
  'docxExtraction',
  'emlExtraction',
  'excelExtraction',
  'htmlExtraction',
  'imageExtraction',
  'pdfExtraction',
  'textExtraction',
  'legacyExtraction',
] as const
export type ExtractionMethod = (typeof EXTRACTION_METHODS)[number]
export const ExtractionMethodSchema = z.enum(EXTRACTION_METHODS)
