import { fs, getUri } from '../commons'
import { getEntryOrThrow, getEntryPath } from '../entry'
import { getFragmentsPath } from '../entry/get-entry-path'
import { ExtractionIdentifier } from '../schema'

export async function readExtraction(
  identifier: ExtractionIdentifier,
  fragment?: number,
): Promise<{ stream: AsyncIterable<string>; size: number; mimeType: string }> {
  const extractionDir = getEntryPath(identifier)

  const manifest = await getEntryOrThrow(identifier)

  if (!manifest.fragmentCount && fragment !== undefined) {
    throw new Error(`Fragments are not available for ${getUri(identifier)}.`)
  }

  if (fragment === undefined) {
    const mainFilePath = fs.getFilePath(extractionDir, 'output.md')
    const result = await fs.readFile(mainFilePath)
    if (!result) {
      throw new Error(`Main extraction file is missing for ${getUri(identifier)}.`)
    }
    return result
  }

  const fragmentFileName = `${String(fragment).padStart(4, '0')}.md`
  const fragmentsPath = getFragmentsPath(manifest)

  const fragmentFilePath = fs.getFilePath(fragmentsPath, fragmentFileName)

  const result = await fs.readFile(fragmentFilePath)
  if (!result) {
    throw new Error(`Fragment ${fragment} is missing for ${getUri(identifier)}.`)
  }
  return result
}
