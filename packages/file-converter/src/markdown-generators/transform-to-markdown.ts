import { DocumentManifest } from '@george-ai/file-management'
import { ExtractionManifest } from '@george-ai/file-management'

import { isSupportedMimeType } from '../constants'
import { FileConverterOptions, isMethodAvailableForMimeType } from '../file-converter-options'
import { logger } from './common'
import { csvToMarkdown } from './csv-to-markdown'
import { docxToMarkdown } from './docx-to-markdown'
import { emlToMarkdown } from './eml-to-markdown'
import { excelToMarkdown } from './excel-to-markdown'
import { htmlToMarkdown } from './html-to-markdown'
import { imageToMarkdown } from './image-to-markdown'
import { pdfToMarkdown } from './pdf-to-markdown'
import { textToMarkdown } from './text-to-markdown'

export const transformToMarkdown = async (parameters: {
  document: DocumentManifest
  timeoutSignal: AbortSignal
  options: FileConverterOptions
}): Promise<ExtractionManifest> => {
  const { document, options, timeoutSignal } = parameters

  if (!isSupportedMimeType(document.mimeType)) {
    logger.error('Unsupported mime type', { ...parameters })
    throw new Error(
      `Unsupported mime type: ${document.mimeType} for document ${document.documentId} in workspace ${document.workspaceId}, library ${document.libraryId}`,
    )
  }

  if (!isMethodAvailableForMimeType(options.extractionMethod, document.mimeType)) {
    logger.error('Method not available for mime type', { ...parameters })
    throw new Error(
      `Extraction method ${options.extractionMethod} is not available for mime type ${document.mimeType} for file ${document.documentId} in workspace ${document.workspaceId}, library ${document.libraryId}`,
    )
  }
  logger.debug('starting with extraction', { ...parameters })

  switch (options.extractionMethod) {
    case 'csvExtraction':
      return await csvToMarkdown({ document, timeoutSignal })
    case 'pdfExtraction':
      return await pdfToMarkdown({ document, timeoutSignal })
    case 'textExtraction':
      return await textToMarkdown({ document, timeoutSignal })
    case 'docxExtraction':
      return await docxToMarkdown({ document, timeoutSignal })
    case 'emlExtraction':
      return await emlToMarkdown({ document, timeoutSignal })
    case 'excelExtraction':
      return await excelToMarkdown({ document, timeoutSignal })
    case 'htmlExtraction':
      return await htmlToMarkdown({ document, timeoutSignal })
    case 'imageExtraction':
      return await imageToMarkdown({ document, timeoutSignal })
    default:
      throw new Error(`Unsupported extraction method: ${options.extractionMethod}`)
  }
}
