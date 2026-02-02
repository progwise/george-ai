import { rm } from 'node:fs/promises'
import path from 'node:path'

import { ExtractionMethod } from '@george-ai/app-commons/src/types/extraction'

import { getFileDir, getLibraryDir } from './directories'
import { exists } from './exists'
import { getExtractionMetadata, getFileManifest, saveFileManifest } from './metadata-files'
import { libraryUsageUpdate } from './usage-update'

export async function deleteExtraction(
  workspaceId: string,
  args: { libraryId: string; fileId: string; extractionMethod: ExtractionMethod },
) {
  const { libraryId, fileId, extractionMethod } = args
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  const extractionDir = path.join(fileDir, 'extractions', extractionMethod)

  const extractionExists = await exists(workspaceId, { libraryId, fileId, extractionMethod })
  if (!extractionExists) {
    throw new Error(`Extraction with methodId ${extractionMethod} does not exist for file ${fileId}`)
  }

  const extractionMeta = await getExtractionMetadata(extractionDir)
  if (!extractionMeta) {
    throw new Error(
      `Extraction metadata not found for methodId: ${extractionMethod} in fileId: ${fileId}, libraryId: ${libraryId}, workspaceId: ${workspaceId}`,
    )
  }

  const fileManifest = await getFileManifest(fileDir)
  if (!fileManifest) {
    throw new Error(
      `File manifest not found for fileId: ${fileId} in libraryId: ${libraryId} and workspaceId: ${workspaceId}`,
    )
  }

  await libraryUsageUpdate(await getLibraryDir(workspaceId, libraryId), {
    usage: {
      sourceBytes: 0,
      extractedBytes: -extractionMeta.extractedBytes,
      physicalBytes: -extractionMeta.physicalBytes,
      sourceFiles: 0,
      extractionFiles: -extractionMeta.extractionFiles,
      physicalFiles: -extractionMeta.physicalFiles,
      extractions: -1,
      activeExtractions: fileManifest.sourceHash === extractionMeta.sourceHash ? -1 : 0,
      activeExtractedBytes: fileManifest.sourceHash === extractionMeta.sourceHash ? -extractionMeta.extractedBytes : 0,
      lastUpdate: new Date().toISOString(),
    },
    operation: 'add',
  })

  await saveFileManifest(fileDir, {
    ...fileManifest,
    extractions: fileManifest.extractions.filter((ex) => ex.extractionMethod !== extractionMethod),
  })

  await rm(extractionDir, { recursive: true, force: true })
}
