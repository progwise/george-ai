import {
  PublicationState,
  calculatePopularity,
  upsertSummaryDocument,
} from '@george-ai/typesense-client'
import pMap from 'p-map'
import { getAllSummaries } from '@george-ai/strapi-client'

export const rebuildCollection = async () => {
  const allSummaries = await getAllSummaries()
  if (allSummaries.length === 0) {
    console.log('No webPageSummaries found')
    return
  }

  await pMap(
    allSummaries,
    async ({
      id,
      language,
      keywords,
      summary,
      largeLanguageModel,
      publishedAt,
      feedbacks,
      title,
      url,
      originalContent,
    }) => {
      const parsedKeywords: string[] = JSON.parse(keywords)
      const summaryDocument = {
        id,
        language,
        keywords: parsedKeywords,
        summary,
        largeLanguageModel,
        title,
        url,
        originalContent,
        publicationState: publishedAt
          ? PublicationState.Published
          : PublicationState.Draft,
        popularity: calculatePopularity(feedbacks),
      }

      await upsertSummaryDocument(summaryDocument, id)
    },
    { concurrency: 10 },
  )
}

rebuildCollection()
