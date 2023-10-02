import { upsertWebpageSummary } from '../collections/upsert-webpagesummary.js'
import {
  Enum_Summaryfeedback_Voting,
  WebPageSummaryEntity,
} from '../gql/graphql.js'
import { PublicationState } from '../index.js'

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
      Array.isArray(value) && value.every((item) => typeof item === 'string'))(
      parsedKeywords,
    )
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
}
