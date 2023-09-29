import { ensureCollectionExists, upsertWebpageSummary } from '../index.js'
import {
  WebPageSummaryResult,
  transformLifecycleWebPageSummary,
} from './transform-lifecycle-web-page-summary.js'

export const transformAndUpsertSummary = async (
  webPageSummaryResult: WebPageSummaryResult,
  popularity: number,
) => {
  const webPageSummary = transformLifecycleWebPageSummary(
    webPageSummaryResult,
    popularity,
  )
  await ensureCollectionExists()
  await upsertWebpageSummary(webPageSummary)
}
