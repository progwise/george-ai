export type FileConverterOptionText = {
  en: string
  de: string
}

export type FileConverterOption = {
  name: string
  label: FileConverterOptionText
  description: FileConverterOptionText
  defaultValue?: string
}

// Define the options as a const object first to enable type inference
const FILE_CONVERTER_OPTIONS = {
  pdf: {
    title: {
      en: 'PDF Processing',
      de: 'PDF-Verarbeitung',
    },
    settings: [
      {
        name: 'enableTextExtraction',
        label: {
          en: 'Enable Text Extraction',
          de: 'Text Extraktion aktivieren',
        },
        description: {
          en: 'Extract text directly from PDF files.',
          de: 'Extrahiere Text direkt aus PDF-Dateien.',
        },
      },
      {
        name: 'enableImageProcessing',
        label: {
          en: 'Enable Image Processing',
          de: 'Bildverarbeitung aktivieren',
        },
        description: {
          en: 'Process PDF files as images for File-Structure independent analysis.',
          de: 'Verarbeite PDF-Dateien als Bilder für eine strukturunabhängige Analyse.',
        },
      },
      {
        name: 'ocrPrompt',
        label: {
          en: 'OCR Analysis Prompt',
          de: 'OCR-Analyse-Prompt',
        },
        description: {
          en: 'Custom prompt for AI vision model when analyzing PDF images',
          de: 'Benutzerdefinierter Prompt für KI-Vision-Modell bei PDF-Bildanalyse',
        },
        defaultValue:
          'Please give me the content of this image as markdown structured as follows:\nShort summary what you see in the image\nList all visual blocks with a headline and its content\nReturn plain and well structured Markdown. Do not repeat information.',
      },
      {
        name: 'ocrModel',
        label: {
          en: 'OCR Model',
          de: 'OCR-Modell',
        },
        description: {
          en: 'AI model to use for OCR analysis',
          de: 'KI-Modell für OCR-Analyse',
        },
        defaultValue: 'qwen2.5vl:latest',
      },
      {
        name: 'ocrTimeout',
        label: {
          en: 'OCR Timeout (seconds)',
          de: 'OCR-Timeout (Sekunden)',
        },
        description: {
          en: 'Maximum time allowed for OCR processing per page',
          de: 'Maximale Zeit für OCR-Verarbeitung pro Seite',
        },
        defaultValue: '120',
      },
      {
        name: 'ocrLoopDetectionThreshold',
        label: {
          en: 'Loop Detection Threshold',
          de: 'Schleifen-Erkennungsschwelle',
        },
        description: {
          en: 'Number of repetitions before detecting an endless loop (0 = disabled)',
          de: 'Anzahl der Wiederholungen vor Erkennung einer Endlosschleife (0 = deaktiviert)',
        },
        defaultValue: '5',
      },
    ],
  },
} as const

// Create a mutable version of the type for external use
export type FileConverterOptions = {
  [K in keyof typeof FILE_CONVERTER_OPTIONS]: {
    title: FileConverterOptionText
    settings: FileConverterOption[]
  }
}

// This type is now automatically derived from the actual object
export type FileConverterSettingName =
  (typeof FILE_CONVERTER_OPTIONS)[keyof typeof FILE_CONVERTER_OPTIONS]['settings'][number]['name']

export const getFileConverterOptions = (): FileConverterOptions => {
  return FILE_CONVERTER_OPTIONS as unknown as FileConverterOptions
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

  // Fall back to default value from the option definition
  const allOptions = getFileConverterOptions()
  for (const category of Object.values(allOptions)) {
    const option = category.settings.find((opt) => opt.name === optionName)
    if (option?.defaultValue) {
      return option.defaultValue
    }
  }

  return undefined
}
