import { DocumentFile, DocumentFileType, ExtractionMethodSchema } from '@george-ai/app-schema'

import { existsFolder, fileTree } from '../../file-system'
import {
  ANALYSIS_FOLDER_NAME,
  ATTACHMENTS_FOLDER_NAME,
  EXTRACTIONS_BACKUP_FOLDER_NAME,
  EXTRACTIONS_FOLDER_NAME,
  SOURCE_FILE_NAME,
  getUri,
} from '../commons'
import { getEntryPath } from '../entry'
import { getIdentifier } from '../schema'

export async function getDocumentFiles(params: {
  workspaceId: string
  libraryId: string
  documentId: string
}): Promise<DocumentFile[]> {
  const { workspaceId, libraryId, documentId } = params
  const rootPath = getEntryPath({ ...params, type: 'document', version: 1 })
  const folderExists = await existsFolder(rootPath)
  if (!folderExists) {
    return []
  }

  const allFiles = await (
    await fileTree(rootPath)
  ).map((file) => ({
    ...file,
    relativePath: file.parentPath === rootPath ? '' : file.parentPath.slice(rootPath.length + 1),
  }))

  return allFiles.map((file) => {
    const isDocumentRoot = file.relativePath.length === 0
    const extractionMatch = file.relativePath.match(new RegExp(`(?:^|/)${EXTRACTIONS_FOLDER_NAME}/([^/]+)`))
    const extractionMethod = extractionMatch ? ExtractionMethodSchema.safeParse(extractionMatch[1]).data : undefined
    const isAnalysis = file.relativePath.endsWith(`/${ANALYSIS_FOLDER_NAME}`) && file.name.endsWith('.analysis.md')
    const isBackup = file.name.endsWith('.bak') || file.relativePath.includes(EXTRACTIONS_BACKUP_FOLDER_NAME)
    const isExtractionMain = !!extractionMethod && file.name === 'output.md'
    const isExtractionPart = !isExtractionMain && !!extractionMethod && file.name.endsWith('.md')
    const isManifest = file.name === 'manifest.json'
    const isDocumentSourceFile = file.name.includes(SOURCE_FILE_NAME) && isDocumentRoot
    const isAttachment = file.relativePath.includes(`/${ATTACHMENTS_FOLDER_NAME}`)

    const fileType: DocumentFileType = isAnalysis
      ? 'analysis'
      : isBackup
        ? 'backup'
        : isExtractionMain
          ? 'extractionMain'
          : isExtractionPart
            ? 'extractionPart'
            : isManifest
              ? 'manifest'
              : isDocumentSourceFile
                ? 'source'
                : isAttachment
                  ? 'attachment'
                  : 'unknown'

    return {
      workspaceId,
      libraryId,
      documentId,
      fileName: file.name,
      relativePath: file.relativePath,
      mimeType: file.mimeType,
      modified: file.modifiedTime,
      fileType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      fileUri: getUri(
        getIdentifier({
          workspaceId,
          libraryId,
          documentId,
          extractionMethod,
        }),
        {
          attachmentFileName: isAttachment ? file.name : undefined,
          analysisFileName: isAnalysis ? file.name : undefined,
        },
      ),
      extractionMethod,
      isDocumentRoot,
      isAnalysis,
      isBackup,
      isExtractionMain,
      isExtractionPart,
      isManifest,
      isDocumentSourceFile,
      isAttachment,
    }
  })
}
