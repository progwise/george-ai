import { SOURCE_FILE_NAME, fs } from '../commons'
import { getEntryPath } from '../entry'
import { DocumentIdentifier } from '../schema'

export function getSourcePath(identifier: DocumentIdentifier): string {
  const filePath = getEntryPath(identifier)
  const sourceFilePath = fs.getFolderPath(filePath, SOURCE_FILE_NAME)
  return sourceFilePath
}

export async function getSourcePathOrThrow(identifier: DocumentIdentifier): Promise<string> {
  const filePath = getEntryPath(identifier)
  const sourceFilePath = await fs.getFilePathOrThrow([filePath, SOURCE_FILE_NAME], 'Source file does not exist')
  return sourceFilePath
}
