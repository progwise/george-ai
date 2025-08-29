import { ExtractionMethodId } from './extraction-options-validation'

export interface ExtractionMethod {
  id: ExtractionMethodId
  name: string
  description: string
  supportedMimeTypes: string[]
  isEnabled: boolean
  defaultOptions: Record<string, unknown>
  optionsSchema: Record<string, unknown> // JSON schema for validation
}

export interface MethodRegistry {
  mimeType: string
  availableMethods: ExtractionMethod[]
}

const DEFAULT_OCR_PROMPT = `Please give me the content of this image as markdown structured as follows:
Short summary what you see in the image
List all visual blocks with a headline and its content
Return plain and well structured Markdown. Do not repeat information.`

// Registry of all available extraction methods
const EXTRACTION_METHODS: ExtractionMethod[] = [
  {
    id: 'pdf-text-extraction' as const,
    name: 'PDF Text Extraction',
    description: 'Extract text directly from PDF structure (fast, high accuracy for text-based PDFs)',
    supportedMimeTypes: ['application/pdf'],
    isEnabled: true,
    defaultOptions: {},
    optionsSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    id: 'docx-extraction' as const,
    name: 'DOCX Text Extraction',
    description: 'Extract text from Microsoft Word documents',
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    isEnabled: true,
    defaultOptions: {},
    optionsSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    id: 'excel-extraction' as const,
    name: 'Excel Data Extraction',
    description: 'Extract data from Excel spreadsheets as markdown tables',
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    isEnabled: true,
    defaultOptions: {},
    optionsSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    id: 'csv-extraction' as const,
    name: 'CSV Data Extraction',
    description: 'Convert CSV files to markdown tables',
    supportedMimeTypes: ['text/csv'],
    isEnabled: true,
    defaultOptions: {},
    optionsSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    id: 'html-extraction' as const,
    name: 'HTML Content Extraction',
    description: 'Convert HTML documents to clean markdown',
    supportedMimeTypes: ['text/html'],
    isEnabled: true,
    defaultOptions: {},
    optionsSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    id: 'text-extraction' as const,
    name: 'Plain Text Extraction',
    description: 'Process plain text files',
    supportedMimeTypes: ['text/plain', 'text/markdown', 'application/json', 'application/xml', 'text/xml'],
    isEnabled: true,
    defaultOptions: {},
    optionsSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    id: 'pdf-image-llm' as const,
    name: 'PDF LLM Vision',
    description:
      'Convert PDF pages to images and use LLM vision models for text extraction (slower, works with scanned documents)',
    supportedMimeTypes: ['application/pdf'],
    isEnabled: true,
    defaultOptions: {
      ocrPrompt: DEFAULT_OCR_PROMPT,
      ocrModel: 'qwen2.5vl:latest',
      ocrTimeoutPerPage: 120000,
      imageScale: 2,
    },
    optionsSchema: {
      type: 'object',
      properties: {
        ocrPrompt: {
          type: 'string',
          default: DEFAULT_OCR_PROMPT,
          description: 'Custom prompt for AI vision model',
        },
        ocrModel: {
          type: 'string',
          default: 'qwen2.5vl:latest',
          description: 'AI vision model to use for text extraction',
        },
        ocrTimeoutPerPage: {
          type: 'number',
          minimum: 10000,
          maximum: 300000,
          default: 120000,
          description: 'Timeout per page in milliseconds',
        },
        imageScale: {
          type: 'number',
          minimum: 1,
          maximum: 4,
          default: 2,
          description: 'Scale factor for PDF to image conversion',
        },
      },
      additionalProperties: false,
    },
  },
  {
    id: 'tesseract-ocr' as const,
    name: 'Tesseract OCR',
    description:
      'Traditional OCR using Tesseract engine (fast, good for high-quality scanned text) - NOT YET IMPLEMENTED',
    supportedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'],
    isEnabled: false, // Disabled until Tesseract server is implemented
    defaultOptions: {
      language: 'eng',
      psm: 3,
      oem: 3,
    },
    optionsSchema: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          default: 'eng',
          description: 'Tesseract language code (eng, deu, fra, etc.)',
        },
        psm: {
          type: 'number',
          minimum: 0,
          maximum: 13,
          default: 3,
          description: 'Page segmentation mode',
        },
        oem: {
          type: 'number',
          minimum: 0,
          maximum: 3,
          default: 3,
          description: 'OCR engine mode',
        },
      },
      additionalProperties: false,
    },
  },
]

/**
 * Get all available extraction methods for a specific mime type
 */
export const getAvailableMethodsForMimeType = (mimeType: string): ExtractionMethod[] => {
  return EXTRACTION_METHODS.filter((method) => method.supportedMimeTypes.includes(mimeType) && method.isEnabled)
}

/**
 * Get extraction method by ID
 */
export const getExtractionMethod = (methodId: string): ExtractionMethod | undefined => {
  return EXTRACTION_METHODS.find((method) => method.id === methodId)
}

/**
 * Get all extraction methods grouped by mime type
 */
export const getExtractionMethodRegistry = (): MethodRegistry[] => {
  // Get all unique mime types
  const allMimeTypes = new Set<string>()
  EXTRACTION_METHODS.forEach((method) => {
    method.supportedMimeTypes.forEach((mimeType) => {
      allMimeTypes.add(mimeType)
    })
  })

  // Group methods by mime type
  return Array.from(allMimeTypes)
    .map((mimeType) => ({
      mimeType,
      availableMethods: getAvailableMethodsForMimeType(mimeType),
    }))
    .filter((registry) => registry.availableMethods.length > 0)
}

/**
 * Validate if an extraction method is available for a mime type
 */
export const isMethodAvailableForMimeType = (methodId: ExtractionMethodId, mimeType: string): boolean => {
  if (methodId === 'embedding-only') {
    // Embedding-only is always valid as it uses existing markdown
    return true
  }
  const method = getExtractionMethod(methodId)
  return method ? method.supportedMimeTypes.includes(mimeType) && method.isEnabled : false
}
