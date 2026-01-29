import { workspaceStorage } from '@george-ai/file-management'
import { ExtractionMetadata } from '@george-ai/file-management/src/schemas/extraction-metadata'

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
  fileId: string
  timeoutSignal: AbortSignal
  options: FileConverterOptions
}): Promise<ExtractionMetadata> => {
  const { workspaceId, libraryId, fileId, options, timeoutSignal } = parameters
  const fileInfo = await workspaceStorage.getFile(workspaceId, {
    libraryId,
    fileId,
  })
  if (!fileInfo) {
    throw new Error(
      `File not found: ${parameters.fileId} in workspace ${parameters.workspaceId}, library ${parameters.libraryId}`,
    )
  }

  if (!isSupportedMimeType(fileInfo.mimeType)) {
    throw new Error(
      `Unsupported mime type: ${fileInfo.mimeType} for file ${parameters.fileId} in workspace ${parameters.workspaceId}, library ${parameters.libraryId}`,
    )
  }

  if (!isMethodAvailableForMimeType(options.extractionMethod, fileInfo.mimeType)) {
    throw new Error(
      `Extraction method ${options.extractionMethod} is not available for mime type ${fileInfo.mimeType} for file ${parameters.fileId} in workspace ${parameters.workspaceId}, library ${parameters.libraryId}`,
    )
  }

  const mimeType = fileInfo.mimeType

  switch (options.extractionMethod) {
    case 'csv-extraction':
      return await csvToMarkdown({
        workspaceId,
        libraryId,
        fileId,
        timeoutSignal,
        mimeType,
      })
    case 'pdf-extraction':
      return await pdfToMarkdown({ workspaceId, libraryId, fileId, timeoutSignal, mimeType })
    case 'text-extraction':
      return await textToMarkdown({ workspaceId, libraryId, fileId, timeoutSignal, mimeType })
    case 'docx-extraction':
      return await docxToMarkdown({ workspaceId, libraryId, fileId, timeoutSignal, mimeType })
    case 'eml-extraction':
      return await emlToMarkdown({ workspaceId, libraryId, fileId, timeoutSignal, mimeType })
    case 'excel-extraction':
      return await excelToMarkdown({ workspaceId, libraryId, fileId, timeoutSignal, mimeType })
    case 'html-extraction':
      return await htmlToMarkdown({ workspaceId, libraryId, fileId, timeoutSignal, mimeType })
    default:
      throw new Error(`Unsupported extraction method: ${options.extractionMethod}`)
  }
}
