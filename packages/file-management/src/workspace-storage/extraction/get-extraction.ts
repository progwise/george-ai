import { getEntry } from '../entry'
import { ExtractionIdentifier, ExtractionManifest } from '../schema'

export async function getExtraction(identifier: ExtractionIdentifier): Promise<ExtractionManifest | null> {
  const manifest = await getEntry(identifier)
  return manifest
}
