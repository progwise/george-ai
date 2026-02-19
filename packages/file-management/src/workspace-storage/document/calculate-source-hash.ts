import { fs } from '../commons'
import { DocumentIdentifier } from '../schema'
import { getSourcePathOrThrow } from './get-source-path'

export async function calculateSourceHash(identifier: DocumentIdentifier): Promise<string> {
  const filePath = await getSourcePathOrThrow(identifier)
  return await fs.calculateFileHash(filePath)
}
