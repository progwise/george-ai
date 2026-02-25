import { logger } from '../commons'
import { ExtractionManifest } from '../schema'
import { ExtractionWriter, getExtractionWriter } from './extraction.writer'

export async function writeExtraction(parameters: { extraction: ExtractionManifest }): Promise<ExtractionWriter> {
  const { extraction } = parameters
  logger.debug('write extraction', { extraction })
  return await getExtractionWriter(extraction)
}
