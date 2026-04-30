import { concatStreams } from '../../file-system'
import { readAnalysis } from '../analysis'
import { fs, getUri, logger } from '../commons'
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
    const analyses = manifest.analyses || [] // no excetions for old manifests
    const analysisResults = await Promise.allSettled(
      analyses.map((analysis) => {
        return readAnalysis(identifier, analysis.analysisFileName)
      }),
    )

    const failedAnalyses = analysisResults.filter((r) => r.status === 'rejected')
    if (failedAnalyses.length > 0) {
      failedAnalyses.forEach((r) => {
        logger.error(`Failed to read analysis for ${getUri(identifier)}`, { error: r.reason })
      })
    }

    const successfulAnalysisStreams = analysisResults.filter((r) => r.status === 'fulfilled').map((r) => r.value)

    const allStreams = [result.stream, ...successfulAnalysisStreams.map((r) => r.stream)]
    const totalSize = result.size + successfulAnalysisStreams.reduce((sum, r) => sum + r.size, 0)

    return {
      stream: concatStreams(...allStreams),
      size: totalSize,
      mimeType: 'text/markdown; charset=utf-8',
    }
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
