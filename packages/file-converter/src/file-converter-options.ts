import { z } from 'zod'

// Known option names - used for parsing and validation
export const KNOWN_OPTIONS = [
  'enableTextExtraction',
  'enableImageProcessing',
  'ocrPrompt',
  'ocrModel',
  'ocrTimeout',
  'ocrLoopDetectionThreshold',
] as const

export type FileConverterSettingName = (typeof KNOWN_OPTIONS)[number]

// Default values for options
export const DEFAULT_VALUES: Record<string, string> = {
  ocrPrompt:
    'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
  ocrModel: 'qwen2.5vl:latest',
  ocrTimeout: '120',
  ocrLoopDetectionThreshold: '5',
}

/**
 * Schema for file converter options that are stored as a comma-separated string
 * in the database but need to be parsed into a structured format.
 *
 * Format in DB: "enableTextExtraction,enableImageProcessing,ocrPrompt=...,ocrModel=...,ocrTimeout=120"
 */
export const FileConverterOptionsSchema = z.object({
  enableTextExtraction: z.boolean().default(false),
  enableImageProcessing: z.boolean().default(false),
  ocrPrompt: z.string().default(DEFAULT_VALUES.ocrPrompt),
  ocrModel: z.string().default(DEFAULT_VALUES.ocrModel),
  ocrTimeout: z.number().default(parseInt(DEFAULT_VALUES.ocrTimeout, 10)),
  ocrLoopDetectionThreshold: z.number().default(parseInt(DEFAULT_VALUES.ocrLoopDetectionThreshold, 10)),
})

export type FileConverterOptions = z.infer<typeof FileConverterOptionsSchema>

export const getFileConverterOptionsList = (fileConverterOptions?: string): FileConverterSettingName[] => {
  if (!fileConverterOptions || fileConverterOptions.length < 1) return []

  // Split the options by comma and filter out empty strings
  return fileConverterOptions.split(',').filter((option) => option.trim() !== '') as FileConverterSettingName[]
}

export const getFileConverterOptionValue = (
  fileConverterOptions: string | undefined,
  optionName: string,
): string | undefined => {
  if (!fileConverterOptions) return undefined

  // Parse key=value pairs from the options string
  const pairs = fileConverterOptions.split(',').map((pair) => pair.trim())

  for (const pair of pairs) {
    const [key, value] = pair.split('=', 2)
    if (key?.trim() === optionName && value !== undefined) {
      return value.trim()
    }
  }

  return undefined
}

export const getFileConverterOptionValueWithDefault = (
  fileConverterOptions: string | undefined,
  optionName: string,
): string | undefined => {
  // First try to get the value from the options string
  const value = getFileConverterOptionValue(fileConverterOptions, optionName)
  if (value !== undefined) {
    return value
  }

  // Fall back to default value from DEFAULT_VALUES
  return DEFAULT_VALUES[optionName]
}

/**
 * Parse the comma-separated string from the database into a structured object
 */
export const parseFileConverterOptions = (optionsString: string | null | undefined): FileConverterOptions => {
  if (!optionsString) {
    return FileConverterOptionsSchema.parse({})
  }

  const options: Record<string, unknown> = {}
  const pairs = optionsString.split(',').map((pair) => pair.trim())

  for (const pair of pairs) {
    // Handle boolean flags (no '=' sign)
    if (!pair.includes('=')) {
      if (pair === 'enableTextExtraction' || pair === 'enableImageProcessing') {
        options[pair] = true
      }
      continue
    }

    // Handle key=value pairs
    const [key, ...valueParts] = pair.split('=')
    const value = valueParts.join('=').trim() // Join back in case value contains '='

    if (key === 'ocrTimeout' || key === 'ocrLoopDetectionThreshold') {
      // Parse as number
      const parsed = parseInt(value, 10)
      if (!isNaN(parsed)) {
        options[key] = parsed
      }
    } else if (key === 'ocrPrompt' || key === 'ocrModel') {
      // Keep as string, but only if not empty
      if (value) {
        options[key] = decodeURIComponent(value)
      }
    }
  }

  return FileConverterOptionsSchema.parse(options)
}

/**
 * Convert structured options back to comma-separated string for database storage
 * Only includes non-default values to keep the string minimal
 */
export const serializeFileConverterOptions = (options: FileConverterOptions): string => {
  const parts: string[] = []

  if (options.enableTextExtraction) {
    parts.push('enableTextExtraction')
  }

  if (options.enableImageProcessing) {
    parts.push('enableImageProcessing')
  }

  if (options.ocrPrompt) {
    parts.push(`ocrPrompt=${encodeURIComponent(options.ocrPrompt)}`)
  }

  if (options.ocrModel) {
    parts.push(`ocrModel=${options.ocrModel}`)
  }

  if (options.ocrTimeout !== undefined) {
    parts.push(`ocrTimeout=${options.ocrTimeout}`)
  }

  if (options.ocrLoopDetectionThreshold !== undefined) {
    parts.push(`ocrLoopDetectionThreshold=${options.ocrLoopDetectionThreshold}`)
  }

  // Return empty string if no options are set (will be stored as null in DB)
  return parts.length > 0 ? parts.join(',') : ''
}

/**
 * Validate incoming fileConverterOptions string from GraphQL input
 * Returns the validated and normalized string, or null if empty/invalid
 */
export const validateFileConverterOptionsString = (optionsString: string | null | undefined): string | null => {
  // Return null for null, undefined, or empty string
  if (!optionsString || optionsString.trim() === '') {
    return null
  }

  try {
    // Parse to validate structure
    const parsed = parseFileConverterOptions(optionsString)
    // Serialize back to ensure consistent format
    const serialized = serializeFileConverterOptions(parsed)
    // Return null if the serialized string is empty (all defaults)
    return serialized || null
  } catch (error) {
    throw new Error(`Invalid fileConverterOptions format: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const AVAILABLE_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-excel', // XLS
  'text/csv',
  'application/csv',
  'text/html',
  'application/xhtml+xml',
] as const

export type MimeType = (typeof AVAILABLE_MIME_TYPES)[number]

/**
 * Available extraction methods with their requirements and supported MIME types
 */

export const AVAILABLE_EXTRACTION_METHOD_NAMES = [
  'text-extraction',
  'pdf-image-llm',
  'docx-extraction',
  'excel-extraction',
  'csv-extraction',
  'html-extraction',
  'embedding-only',
] as const

export type ExtractionMethodId = (typeof AVAILABLE_EXTRACTION_METHOD_NAMES)[number]

export const EXTRACTION_METHODS: Record<
  ExtractionMethodId,
  {
    name: string
    description: string
    supportedMimeTypes: Array<MimeType>
    requiresOptions: Array<FileConverterSettingName>
  }
> = {
  'text-extraction': {
    name: 'Text Extraction',
    description: 'Extract plain text content',
    supportedMimeTypes: ['text/plain', 'text/markdown', 'text/x-markdown', 'application/pdf'],
    requiresOptions: [],
  },
  'pdf-image-llm': {
    name: 'PDF Image OCR',
    description: 'Extract content from PDF images using LLM',
    supportedMimeTypes: ['application/pdf'],
    requiresOptions: ['ocrModel', 'ocrPrompt'],
  },
  'docx-extraction': {
    name: 'DOCX Extraction',
    description: 'Extract content from Word documents',
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    requiresOptions: [],
  },
  'excel-extraction': {
    name: 'Excel Extraction',
    description: 'Extract content from Excel files',
    supportedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    requiresOptions: [],
  },
  'csv-extraction': {
    name: 'CSV Extraction',
    description: 'Extract content from CSV files',
    supportedMimeTypes: ['text/csv', 'application/csv'],
    requiresOptions: [],
  },
  'html-extraction': {
    name: 'HTML Extraction',
    description: 'Extract content from HTML files',
    supportedMimeTypes: ['text/html', 'application/xhtml+xml'],
    requiresOptions: [],
  },
  'embedding-only': {
    name: 'Embedding Only',
    description: 'Skip extraction, only create embeddings from existing markdown',
    supportedMimeTypes: [], // Special method, not tied to MIME types
    requiresOptions: [],
  },
} as const

/**
 * Check if extraction method is valid
 */
export const isValidExtractionMethod = (method: string): method is ExtractionMethodId => {
  const result = method in EXTRACTION_METHODS
  console.log(`isValidExtractionMethod(${method}) = ${result}`)
  return result
}

/**
 * Validate if file converter options are sufficient for a specific extraction method
 */
export const validateOptionsForExtractionMethod = (
  optionsString: string | null | undefined,
  extractionMethod: ExtractionMethodId,
): { success: true; options: FileConverterOptions } | { success: false; error: string } => {
  try {
    const options = parseFileConverterOptions(optionsString)
    const methodConfig = EXTRACTION_METHODS[extractionMethod]

    // Check if required options are present and valid
    for (const requiredOption of methodConfig.requiresOptions) {
      if (requiredOption === 'ocrModel' && (!options.ocrModel || options.ocrModel.trim() === '')) {
        return { success: false, error: `OCR model is required for ${extractionMethod}` }
      }
      if (requiredOption === 'ocrPrompt' && (!options.ocrPrompt || options.ocrPrompt.trim() === '')) {
        return { success: false, error: `OCR prompt is required for ${extractionMethod}` }
      }
    }

    return { success: true, options }
  } catch (error) {
    return {
      success: false,
      error: `Invalid options format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Check if an extraction method supports a specific MIME type
 */
export const isMethodAvailableForMimeType = (
  method: ExtractionMethodId,
  mimeType: string | null | undefined,
): boolean => {
  if (!mimeType) {
    return false // No MIME type provided
  }
  const typedMimeType = AVAILABLE_MIME_TYPES.find((mt) => mt.toLowerCase() === mimeType.toLowerCase())
  console.log(`isMethodAvailableForMimeType(${method}, ${mimeType}) = ${typedMimeType !== undefined}`)
  if (typedMimeType === undefined) {
    return false // MIME type not supported at all
  }
  const methodConfig = EXTRACTION_METHODS[method]
  console.log(`Method ${method} supports MIME types: ${methodConfig.supportedMimeTypes.join(', ')}`)
  return methodConfig.supportedMimeTypes.includes(typedMimeType)
}

/**
 * Get all extraction methods available for a specific MIME type
 */
export const getAvailableMethodsForMimeType = (
  mimeType: string,
): Array<{
  id: ExtractionMethodId
  name: string
  description: string
}> => {
  // Check if the MIME type is supported
  if (!AVAILABLE_MIME_TYPES.includes(mimeType as MimeType)) {
    return [] // Return empty array for unsupported MIME types
  }

  return Object.entries(EXTRACTION_METHODS)
    .filter(([, config]) => config.supportedMimeTypes.includes(mimeType as MimeType))
    .map(([id, config]) => ({
      id: id as ExtractionMethodId,
      name: config.name,
      description: config.description,
    }))
}
