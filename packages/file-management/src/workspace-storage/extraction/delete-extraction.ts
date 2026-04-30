import { rm } from 'node:fs/promises'

import { getEntryOrThrow, getEntryPath, saveEntry } from '../entry'
import { ExtractionIdentifier } from '../schema'
import { updateStats } from '../storage-stats'

export async function deleteExtraction(identifier: ExtractionIdentifier) {
  const documentManifest = await getEntryOrThrow({ ...identifier, type: 'document' })
  const extractionManifest = await getEntryOrThrow(identifier)
  const extractionDir = getEntryPath(identifier)

  await updateStats(documentManifest, {
    stats: extractionManifest.storageStats,
    operation: 'subtract',
  })

  await saveEntry({
    ...documentManifest,
    extractions: documentManifest.extractions?.filter((e) => e.extractionMethod !== identifier.extractionMethod) ?? [],
  })

  await rm(extractionDir, { recursive: true, force: true })
}
