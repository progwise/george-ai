import { fs } from '../commons'
import { DocumentIdentifier } from '../schema'
import { getSourcePath } from './get-source-path'

export async function getSourceSize(identifier: DocumentIdentifier): Promise<{ diskSize: number }> {
  const sourceFilePath = getSourcePath(identifier)
  const sourceFileStat = await fs.getFileStats(sourceFilePath)

  return { diskSize: sourceFileStat?.diskSize || 0 }
}
