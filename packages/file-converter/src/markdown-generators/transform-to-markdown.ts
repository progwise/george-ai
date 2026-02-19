import { document } from '@george-ai/file-management'
import { ExtractionManifest } from '@george-ai/file-management'

import { isSupportedMimeType } from '../constants'
import { FileConverterOptions, isMethodAvailableForMimeType } from '../file-converter-options'
import { csvToMarkdown } from './csv-to-markdown'
import { docxToMarkdown } from './docx-to-markdown'
import { emlToMarkdown } from './eml-to-markdown'
import { excelToMarkdown } from './excel-to-markdown'
import { htmlToMarkdown } from './html-to-markdown'
import { pdfToMarkdown } from './pdf-to-markdown'
import { textToMarkdown } from './text-to-markdown'

export const transformToMarkdown = async (parameters: {
  workspaceId: string
  libraryId: string
  documentId: string
  timeoutSignal: AbortSignal
  options: FileConverterOptions
}): Promise<ExtractionManifest> => {
  const { workspaceId, libraryId, documentId, options, timeoutSignal } = parameters
  const manifest = await document.get(workspaceId, {
    libraryId,
    documentId,
  })
  if (!manifest) {
    throw new Error(
      `File not found: ${parameters.documentId} in workspace ${parameters.workspaceId}, library ${parameters.libraryId}`,
    )
  }

  if (!isSupportedMimeType(manifest.mimeType)) {
    throw new Error(
      `Unsupported mime type: ${manifest.mimeType} for document ${parameters.documentId} in workspace ${parameters.workspaceId}, library ${parameters.libraryId}`,
    )
  }

  if (!isMethodAvailableForMimeType(options.extractionMethod, manifest.mimeType)) {
    throw new Error(
      `Extraction method ${options.extractionMethod} is not available for mime type ${manifest.mimeType} for file ${parameters.documentId} in workspace ${parameters.workspaceId}, library ${parameters.libraryId}`,
    )
  }

  const mimeType = manifest.mimeType

  switch (options.extractionMethod) {
    case 'csvExtraction':
      return await csvToMarkdown({
        workspaceId,
        libraryId,
        documentId,
        timeoutSignal,
        mimeType,
      })
    case 'pdfExtraction':
      return await pdfToMarkdown({ workspaceId, libraryId, documentId, timeoutSignal, mimeType })
    case 'textExtraction':
      return await textToMarkdown({ workspaceId, libraryId, documentId, timeoutSignal, mimeType })
    case 'docxExtraction':
      return await docxToMarkdown({ workspaceId, libraryId, documentId, timeoutSignal, mimeType })
    case 'emlExtraction':
      return await emlToMarkdown({ workspaceId, libraryId, documentId, timeoutSignal, mimeType })
    case 'excelExtraction':
      return await excelToMarkdown({ workspaceId, libraryId, documentId, timeoutSignal, mimeType })
    case 'htmlExtraction':
      return await htmlToMarkdown({ workspaceId, libraryId, documentId, timeoutSignal, mimeType })
    default:
      throw new Error(`Unsupported extraction method: ${options.extractionMethod}`)
  }
}
