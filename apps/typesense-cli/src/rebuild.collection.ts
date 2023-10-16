import {
  ensureSummaryCollectionExists,
  upsertSummaryDocument,
} from '@george-ai/typesense-client'
import pMap from 'p-map'
import { getAllSummaries } from '@george-ai/strapi-client'

export const rebuildCollection = async () => {
  const allSummaries = (await getAllSummaries()) || []

  await ensureSummaryCollectionExists()
  await pMap(
    allSummaries,
    async (webPageSummary) => {
      if (!webPageSummary) {
        return
      }
      const {
        id,
        language,
        keywords,
        summary,
        largeLanguageModel,
        publicationState,
        feedbacks,
        title,
        url,
        originalContent,
      } = webPageSummary

      let popularity = 0
      for (const feedback of feedbacks) {
        feedback === 'up' ? (popularity += 1) : (popularity -= 1)
      }

      const parsedKeywords = JSON.parse(keywords)

      const summaryDocument = {
        id,
        language,
        keywords: ((value: any): value is string[] =>
          Array.isArray(value) &&
          value.every((item) => typeof item === 'string'))(parsedKeywords)
          ? parsedKeywords
          : [],
        summary,
        largeLanguageModel,
        title,
        url,
        originalContent,
        publicationState,
        popularity,
      }

      await upsertSummaryDocument(summaryDocument, id)
    },
    { concurrency: 10 },
  )
}

rebuildCollection()
