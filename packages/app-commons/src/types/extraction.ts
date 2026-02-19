import { logger } from '../common'

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

export const getExtractionMethod = (value: string): ExtractionMethod | undefined => {
  if (EXTRACTION_METHODS.includes(value as ExtractionMethod)) {
    return value as ExtractionMethod
  }
  logger.error(`Invalid extraction method: ${value}`)
  throw new Error(`Invalid extraction method: ${value}`)
}
