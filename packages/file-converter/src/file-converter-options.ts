import z from 'zod'

import { SUPPORTED_MIME_TYPES, SupportedMimeType } from './constants'

export const EXTRACTION_METHOD_NAMES = [
  'csv-extraction',
  'docx-extraction',
  'eml-extraction',
  'excel-extraction',
  'html-extraction',
  'pdf-extraction',
  'text-extraction',
] as const

export type ExtractionMethod = (typeof EXTRACTION_METHOD_NAMES)[number]

export const ExtractionMethods: Record<
  ExtractionMethod,
  {
    name: string
    description: string
    supportedMimeTypes: Array<SupportedMimeType>
  }
> = {
  'text-extraction': {
    name: 'Text Extraction',
    description: 'Extract plain text content',
    supportedMimeTypes: ['text/plain', 'text/markdown', 'text/x-markdown', 'application/pdf'],
  },
  'pdf-extraction': {
    name: 'PDF Extraction',
    description: 'Extract text content from PDF files and preserve layout and structure',
    supportedMimeTypes: ['application/pdf'],
  },
  'docx-extraction': {
    name: 'DOCX Extraction',
    description: 'Extract content from Word documents',
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  'excel-extraction': {
    name: 'Excel Extraction',
    description: 'Extract content from Excel files',
    supportedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
  },
  'csv-extraction': {
    name: 'CSV Extraction',
    description: 'Extract content from CSV files',
    supportedMimeTypes: ['text/csv', 'application/csv'],
  },
  'html-extraction': {
    name: 'HTML Extraction',
    description: 'Extract content from HTML files',
    supportedMimeTypes: ['text/html', 'application/xhtml+xml'],
  },
  'eml-extraction': {
    name: 'Email Extraction',
    description: 'Extract content from email files (.eml)',
    supportedMimeTypes: ['message/rfc822'],
  },
} as const

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

export const FileConverterOptionsSchema = z.object({
  extractionMethod: z.enum(EXTRACTION_METHOD_NAMES),
  options: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
})

export type FileConverterOptions = z.infer<typeof FileConverterOptionsSchema>
