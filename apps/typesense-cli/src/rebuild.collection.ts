import {
  PublicationState,
  computeFeedbackPopularity,
  ensureCollectionExists,
  isStringArray,
  upsertWebpageSummary,
} from '@george-ai/typesense-client'
import pMap from 'p-map'
import { WebPageSummaryEntity } from './gql/graphql'
import { GetAllSummaries } from '@george-ai/strapi-client'

const mapper = async (webPageSummaryEntity: WebPageSummaryEntity) => {
  const updatedAt = new Date(webPageSummaryEntity.attributes?.updatedAt)

  const votes = (webPageSummaryEntity.attributes?.summary_feedbacks?.data ?? [])
    .filter((feedback) => {
      const createdAt = new Date(feedback.attributes?.createdAt)
      return createdAt > updatedAt
    })
    .map((feedback) => feedback.attributes?.voting || '')

  const popularity = computeFeedbackPopularity(votes)

  const webPageSummary = {
    id: webPageSummaryEntity.id ?? '',
    language: webPageSummaryEntity.attributes?.locale ?? '',
    keywords:
      webPageSummaryEntity.attributes?.keywords &&
      isStringArray(JSON.parse(webPageSummaryEntity.attributes?.keywords))
        ? JSON.parse(webPageSummaryEntity.attributes?.keywords)
        : [],
    summary: webPageSummaryEntity.attributes?.summary ?? '',
    largeLanguageModel:
      webPageSummaryEntity.attributes?.largeLanguageModel ?? '',
    title:
      webPageSummaryEntity.attributes?.scraped_web_page?.data?.attributes
        ?.title ?? '',
    url:
      webPageSummaryEntity.attributes?.scraped_web_page?.data?.attributes
        ?.url ?? '',
    originalContent:
      webPageSummaryEntity.attributes?.scraped_web_page?.data?.attributes
        ?.originalContent ?? '',
    publicationState: webPageSummaryEntity.attributes?.publishedAt
      ? PublicationState.Published
      : PublicationState.Draft,
    popularity,
  }

  await upsertWebpageSummary(webPageSummary)
}

export const rebuildCollection = async () => {
  const webPageSummaryArray = (await GetAllSummaries()) || []

  await ensureCollectionExists()
  await pMap(webPageSummaryArray, mapper, { concurrency: 10 })
}

rebuildCollection()
