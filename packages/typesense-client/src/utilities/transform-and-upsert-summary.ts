import { upsertWebpageSummary } from '../collections/upsert-webpagesummary.js'
import {
  Enum_Summaryfeedback_Voting,
  Maybe,
  SummaryFeedbackEntity,
  WebPageSummaryEntity,
} from '../gql/graphql.js'
import { PublicationState } from '../index.js'
import { computeFeedbackPopularity } from './compute-feedback-popularity.js'

export const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const extractVotes = (
  feedbacks: Array<SummaryFeedbackEntity>,
  lastScrapeUpdate: any,
) => {
  const updatedAtDate = new Date(lastScrapeUpdate) ?? new Date(0)
  return feedbacks
    .filter(({ attributes }) => {
      const createdAt = attributes?.createdAt
        ? new Date(attributes.createdAt)
        : new Date(0)
      return createdAt > updatedAtDate
    })
    .map(({ attributes }) => attributes?.voting)
    .filter(
      (vote): vote is Enum_Summaryfeedback_Voting =>
        vote === Enum_Summaryfeedback_Voting.Down ||
        vote === Enum_Summaryfeedback_Voting.Up,
    )
}

export const transformAndUpsertSummary = async (
  webPageSummaryEntity: WebPageSummaryEntity,
) => {
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

  const votes = extractVotes(summary_feedbacks?.data || [], lastScrapeUpdate)
  const popularity = computeFeedbackPopularity(votes)

  const scrapedAttributes = scraped_web_page?.data?.attributes || {}
  const parsedKeywords = keywords && JSON.parse(keywords)

  const webPageSummary = {
    id: id,
    language: locale ?? '',
    keywords: isStringArray(parsedKeywords) ? parsedKeywords : [],
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
}
