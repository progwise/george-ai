import {
  ensureCollectionExists,
  transformAndUpsertSummary,
} from '@george-ai/typesense-client'
import pMap from 'p-map'
import { getAllSummaries } from '@george-ai/strapi-client'

export const rebuildCollection = async () => {
  const webPageSummaryArray = (await getAllSummaries()) || []

  await ensureCollectionExists()
  await pMap(
    webPageSummaryArray,
    async (webPageSummaryEntity) => {
      await transformAndUpsertSummary(webPageSummaryEntity)
    },
    { concurrency: 10 },
  )
}

rebuildCollection()
