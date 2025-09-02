import { z } from 'zod'

const DEFAULT_OCR_PROMPT = `Please give me the content of this image as markdown structured as follows:
Short summary what you see in the image
List all visual blocks with a headline and its content
Return plain and well structured Markdown. Do not repeat information.`

// Zod schemas for each extraction method
export const pdfTextExtractionOptionsSchema = z.object({
  // PDF text extraction has no configurable options
})

export const docxExtractionOptionsSchema = z.object({
  // DOCX extraction has no configurable options
})

export const excelExtractionOptionsSchema = z.object({
  // Excel extraction has no configurable options
})

export const csvExtractionOptionsSchema = z.object({
  // CSV extraction has no configurable options
})

export const htmlExtractionOptionsSchema = z.object({
  // HTML extraction has no configurable options
})

export const textExtractionOptionsSchema = z.object({
  // Text extraction has no configurable options
})

export const pdfImageLlmOptionsSchema = z.object({
  ocrPrompt: z.string().optional().default(DEFAULT_OCR_PROMPT),
  ocrModel: z.string().default('qwen2.5vl:latest'),
  ocrTimeoutPerPage: z.number().min(10000).max(300000).default(120000), // in milliseconds
  imageScale: z.number().min(1).max(4).default(2),
})

export const tesseractOcrOptionsSchema = z.object({
  language: z.string().default('eng'),
  psm: z.number().min(0).max(13).default(3),
  oem: z.number().min(0).max(3).default(3),
})

// Registry of validation schemas
export const extractionOptionsSchemas = {
  'pdf-text-extraction': pdfTextExtractionOptionsSchema,
  'docx-extraction': docxExtractionOptionsSchema,
  'excel-extraction': excelExtractionOptionsSchema,
  'csv-extraction': csvExtractionOptionsSchema,
  'html-extraction': htmlExtractionOptionsSchema,
  'text-extraction': textExtractionOptionsSchema,
  'pdf-image-llm': pdfImageLlmOptionsSchema,
  'tesseract-ocr': tesseractOcrOptionsSchema,
  'embedding-only': z.object({}), // No options for embedding-only
} as const

export type ExtractionMethodId = keyof typeof extractionOptionsSchemas

export type PdfTextExtractionOptions = z.infer<typeof pdfTextExtractionOptionsSchema>
export type DocxExtractionOptions = z.infer<typeof docxExtractionOptionsSchema>
export type ExcelExtractionOptions = z.infer<typeof excelExtractionOptionsSchema>
export type CsvExtractionOptions = z.infer<typeof csvExtractionOptionsSchema>
export type HtmlExtractionOptions = z.infer<typeof htmlExtractionOptionsSchema>
export type TextExtractionOptions = z.infer<typeof textExtractionOptionsSchema>
export type PdfImageLlmOptions = z.infer<typeof pdfImageLlmOptionsSchema>
export type TesseractOcrOptions = z.infer<typeof tesseractOcrOptionsSchema>

export type ExtractionOptions =
  | PdfTextExtractionOptions
  | DocxExtractionOptions
  | ExcelExtractionOptions
  | CsvExtractionOptions
  | HtmlExtractionOptions
  | TextExtractionOptions
  | PdfImageLlmOptions
  | TesseractOcrOptions

/**
 * Validate extraction options for a specific method
 */
export const validateExtractionOptions = (
  method: ExtractionMethodId,
  optionsJson?: string | null,
): {
  success: boolean
  data?: ExtractionOptions
  error?: unknown
} => {
  const schema = extractionOptionsSchemas[method]

  if (!optionsJson) {
    // Return default options if none provided
    const parseResult = schema.safeParse({})
    return parseResult.success
      ? { data: parseResult.data, success: true }
      : { success: false, error: parseResult.error }
  }

  try {
    const options = JSON.parse(optionsJson)
    const parseResult = schema.safeParse(options)
    return parseResult.success
      ? { data: parseResult.data, success: true }
      : { success: false, error: parseResult.error }
  } catch (error) {
    return { success: false, error }
  }
}

export const validateMultipleExtractionOptions = (
  methods: ExtractionMethodId[],
  optionsJson?: string | null,
): { success: boolean; data?: ExtractionOptions; error?: unknown } => {
  const results: Array<{ method: ExtractionMethodId; result: ReturnType<typeof validateExtractionOptions> }> =
    methods.map((method) => ({
      method,
      result: validateExtractionOptions(method, optionsJson),
    }))

  const errors = results.filter((r) => !r.result.success)
  if (errors.length > 0) {
    return { success: false, error: errors.map((e) => ({ method: e.method, error: e.result.error })) }
  }
  // Merge all valid options into one object
  const mergedOptions = results.reduce((acc, r) => ({ ...acc, ...(r.result.data || {}) }), {} as ExtractionOptions)
  return { success: true, data: mergedOptions }
}

/**
 * Get default options for a method (useful for UI)
 */
export const getDefaultExtractionOptions = (method: ExtractionMethodId) => {
  const schema = extractionOptionsSchemas[method]
  return schema.parse({})
}

/**
 * Serialize options to JSON string for storage
 */
export const serializeExtractionOptions = (methods: ExtractionMethodId[], options: Record<string, unknown>): string => {
  // First validate the options
  const validatedOptions = validateMultipleExtractionOptions(methods, JSON.stringify(options))
  if (!validatedOptions.success) {
    throw new Error(`Invalid extraction options for method ${methods.join(', ')}: ${validatedOptions.error}`)
  }
  return JSON.stringify(validatedOptions.data)
}

/**
 * Check if extraction method is valid
 */
export const isValidExtractionMethod = (method: string): method is ExtractionMethodId => {
  return method in extractionOptionsSchemas
}
