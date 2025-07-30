export type FileConverterOptionText = {
  en: string
  de: string
}

export type FileConverterOption = {
  name: string
  label: FileConverterOptionText
  description: FileConverterOptionText
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
