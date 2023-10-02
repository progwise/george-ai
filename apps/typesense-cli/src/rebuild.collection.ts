import {
  ensureCollectionExists,
  transformAndUpsertSummary,
} from '@george-ai/typesense-client'
import pMap from 'p-map'
import { getAllSummaries } from '@george-ai/strapi-client'

export const rebuildCollection = async () => {
  const AllWebPageSummaries = (await getAllSummaries()) || []

  await ensureCollectionExists()
  await pMap(
    AllWebPageSummaries,
    async (webPageSummary) => {
      await transformAndUpsertSummary(webPageSummary)
    },
    { concurrency: 10 },
  )
}

rebuildCollection()
