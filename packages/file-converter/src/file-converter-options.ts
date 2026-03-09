import z from 'zod'

import { EXTRACTION_METHODS, ExtractionMethod } from '@george-ai/app-schema'

import { SUPPORTED_MIME_TYPES, SupportedMimeType } from './constants'

export const ExtractionMethods: Record<
  ExtractionMethod,
  {
    name: string
    description: string
    supportedMimeTypes: Array<SupportedMimeType>
  }
> = {
  textExtraction: {
    name: 'Text Extraction',
    description: 'Extract plain text content',
    supportedMimeTypes: [
      'text/plain',
      'text/markdown',
      'text/html',
      'text/csv',
      'text/x-markdown',
      'application/csv',
      'application/json',
      'application/jsonl',
    ],
  },
  pdfExtraction: {
    name: 'PDF Extraction',
    description: 'Extract text content from PDF files and preserve layout and structure',
    supportedMimeTypes: ['application/pdf'],
  },
  docxExtraction: {
    name: 'DOCX Extraction',
    description: 'Extract content from Word documents',
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  excelExtraction: {
    name: 'Excel Extraction',
    description: 'Extract content from Excel files',
    supportedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
  },
  csvExtraction: {
    name: 'CSV Extraction',
    description: 'Extract content from CSV files',
    supportedMimeTypes: ['text/csv', 'application/csv'],
  },
  htmlExtraction: {
    name: 'HTML Extraction',
    description: 'Extract content from HTML files',
    supportedMimeTypes: ['text/html', 'application/xhtml+xml'],
  },
  emlExtraction: {
    name: 'Email Extraction',
    description: 'Extract content from email files (.eml)',
    supportedMimeTypes: ['message/rfc822'],
  },
  legacyExtraction: {
    name: 'Legacy Extraction',
    description: 'Not used for new extractions',
    supportedMimeTypes: [],
  },
  imageExtraction: {
    name: 'Image Extraction',
    description: 'Extract text content from image files using OCR',
    supportedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/tiff'],
  },
} as const

/**
 * Get all extraction methods available for a specific MIME type
 */
export const getAvailableMethodsForMimeType = (
  mimeType: string,
): Array<{
  extractionMethod: ExtractionMethod
  name: string
  description: string
}> => {
  // Check if the MIME type is supported
  if (!SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType)) {
    return [] // Return empty array for unsupported MIME types
  }

  return Object.entries(ExtractionMethods)
    .filter(([, config]) => config.supportedMimeTypes.includes(mimeType as SupportedMimeType))
    .map(([name, config]) => ({
      extractionMethod: name as ExtractionMethod,
      name: config.name,
      description: config.description,
    }))
}

/**
 * Check if an extraction method supports a specific MIME type
 */
export const isMethodAvailableForMimeType = (
  extractionMethod: ExtractionMethod,
  mimeType: string | null | undefined,
): boolean => {
  if (!mimeType) {
    return false // No MIME type provided
  }
  const typedMimeType = SUPPORTED_MIME_TYPES.find((mt) => mt.toLowerCase() === mimeType.toLowerCase())
  if (typedMimeType === undefined) {
    return false // MIME type not supported at all
  }
  const methodConfig = ExtractionMethods[extractionMethod]
  return methodConfig.supportedMimeTypes.includes(typedMimeType)
}

export const FileConverterOptionsSchema = z.object({
  extractionMethod: z.enum(EXTRACTION_METHODS),
  options: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
})

export type FileConverterOptions = z.infer<typeof FileConverterOptionsSchema>
