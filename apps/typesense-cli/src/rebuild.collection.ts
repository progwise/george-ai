import {
  PublicationState,
  ensureCollectionExists,
  upsertWebpageSummary,
} from '@george-ai/typesense-client'
import pMap from 'p-map'
import { getAllSummaries } from '@george-ai/strapi-client'

// eslint-disable-next-line @typescript-eslint/naming-convention
enum Enum_Summaryfeedback_Voting {
  Down = 'down',
  Up = 'up',
}

export const rebuildCollection = async () => {
  const AllWebPageSummaries = (await getAllSummaries()) || []

  await ensureCollectionExists()
  await pMap(
    AllWebPageSummaries,
    async (webPageSummaryEntity) => {
      const { id, attributes } = webPageSummaryEntity

      if (!id) {
        throw new Error('Id is missing')
      }
      if (!attributes) {
        throw new Error('Attributes are missing')
      }

      const {
        lastScrapeUpdate,
        locale,
        keywords,
        summary,
        largeLanguageModel,
        publishedAt,
        summary_feedbacks,
        scraped_web_page,
      } = attributes

      const updatedAtDate = new Date(lastScrapeUpdate) ?? new Date(0)
      const votes = (summary_feedbacks?.data || [])
        .filter(({ attributes }) => {
          const createdAt = attributes?.createdAt
            ? new Date(attributes.createdAt)
            : new Date(0)
          return createdAt > updatedAtDate
        })
        .map((feedback) => feedback.attributes?.voting)
        .filter(
          (vote): vote is Enum_Summaryfeedback_Voting =>
            vote === Enum_Summaryfeedback_Voting.Down ||
            vote === Enum_Summaryfeedback_Voting.Up,
        )

      let popularity = 0
      for (const vote of votes) {
        if (vote === Enum_Summaryfeedback_Voting.Up) {
          popularity += 1
        } else if (vote === Enum_Summaryfeedback_Voting.Down) {
          popularity -= 1
        }
      }

      const scrapedAttributes = scraped_web_page?.data?.attributes || {}
      const parsedKeywords = keywords && JSON.parse(keywords)

      const webPageSummary = {
        id: id,
        language: locale ?? '',
        keywords: ((value: any): value is string[] =>
          Array.isArray(value) &&
          value.every((item) => typeof item === 'string'))(parsedKeywords)
          ? parsedKeywords
          : [],
        summary: summary ?? '',
        largeLanguageModel: largeLanguageModel ?? '',
        title: scrapedAttributes.title ?? '',
        url: scrapedAttributes.url ?? '',
        originalContent: scrapedAttributes.originalContent ?? '',
        publicationState: publishedAt
          ? PublicationState.Published
          : PublicationState.Draft,
        popularity,
      }

      await upsertWebpageSummary(webPageSummary)
    },
    { concurrency: 10 },
  )
}

rebuildCollection()
