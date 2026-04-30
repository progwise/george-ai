import { readAnalysis, readAttachment } from '../..'
import { getFilePathOrThrow, readFile } from '../../file-system'
import { getEntry, getEntryPath } from '../entry'
import { getIdentifier } from '../schema'
import {
  ANALYSIS_FOLDER_NAME,
  ATTACHMENTS_FOLDER_NAME,
  EXTRACTIONS_BACKUP_FOLDER_NAME,
  SOURCE_FILE_NAME,
} from './constants'
import { parseUri } from './uri'

export async function getReaderForUri(uri: string): Promise<{
  size: number
  mimeType: string
  fileName: string
  stream: NodeJS.ReadableStream
}> {
  const {
    workspaceId,
    libraryId,
    documentId,
    extractionMethod,
    extractionBackupFolderName,
    fragment,
    attachment,
    analysis,
    fileName,
  } = parseUri(uri)

  const identifier = getIdentifier({
    workspaceId,
    libraryId,
    documentId,
    extractionMethod: extractionBackupFolderName ? undefined : extractionMethod,
  })

  const entry = await getEntry(identifier)
  if (!entry) {
    throw new Error(`No entry found for identifier: ${JSON.stringify(identifier)}`)
  }

  if (extractionBackupFolderName) {
    const backupBase = [getEntryPath(identifier), EXTRACTIONS_BACKUP_FOLDER_NAME, extractionBackupFolderName]
    const pathParts = analysis
      ? [...backupBase, ANALYSIS_FOLDER_NAME, fileName]
      : attachment
        ? [...backupBase, ATTACHMENTS_FOLDER_NAME, fileName]
        : [...backupBase, fileName]
    const filePath = await getFilePathOrThrow(pathParts, `Backup file not found for URI: ${uri}`)
    const { size, mimeType, stream } =
      (await readFile(filePath)) ||
      (() => {
        throw new Error(`File not found at path: ${filePath} for URI: ${uri}`)
      })()
    return { size, mimeType, fileName, stream }
  }

  if (attachment) {
    const { size, mimeType, stream } = await readAttachment(identifier, fileName)
    return { size, mimeType, fileName, stream }
  }

  if (analysis) {
    const { size, mimeType, stream } = await readAnalysis(identifier, fileName)
    return { size, mimeType, fileName, stream }
  }

  if (fragment !== undefined) {
    throw new Error(`Fragment reading not implemented yet for URI: ${uri}`)
  }

  const entryPath = getEntryPath(identifier)
  const filePath = await getFilePathOrThrow([entryPath, fileName], `Folder not found for URI: ${uri}`)
  const { size, mimeType, stream } =
    (await readFile(filePath)) ||
    (() => {
      throw new Error(`File not found at path: ${filePath} for URI: ${uri}`)
    })()

  if (fileName === SOURCE_FILE_NAME && entry.type === 'document') {
    return { size, mimeType: entry.mimeType, fileName, stream }
  }
  return { size, mimeType, fileName, stream }
}
