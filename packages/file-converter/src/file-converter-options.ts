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
