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
        options[key] = value
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

  // Only include values that differ from defaults
  if (options.ocrPrompt && options.ocrPrompt !== DEFAULT_VALUES.ocrPrompt) {
    parts.push(`ocrPrompt=${options.ocrPrompt}`)
  }

  if (options.ocrModel && options.ocrModel !== DEFAULT_VALUES.ocrModel) {
    parts.push(`ocrModel=${options.ocrModel}`)
  }

  if (options.ocrTimeout !== undefined && options.ocrTimeout !== parseInt(DEFAULT_VALUES.ocrTimeout, 10)) {
    parts.push(`ocrTimeout=${options.ocrTimeout}`)
  }

  if (
    options.ocrLoopDetectionThreshold !== undefined &&
    options.ocrLoopDetectionThreshold !== parseInt(DEFAULT_VALUES.ocrLoopDetectionThreshold, 10)
  ) {
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
