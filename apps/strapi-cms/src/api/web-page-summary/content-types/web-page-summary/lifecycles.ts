import {
  PublicationState,
  deleteSummaryDocument,
  ensureSummaryCollectionExists,
  upsertSummaryDocument,
} from '@george-ai/typesense-client'
import { calculatePopularity } from '../../../../calculate-popularity'

const getsummary = async (summaryId: number) => {
  const {
    lastScrapeUpdate,
    locale,
    keywords,
    summary,
    largeLanguageModel,
    publishedAt,
    summary_feedbacks,
    scraped_web_page,
  }: {
    lastScrapeUpdate: string
    locale: string
    keywords: string
    summary: string
    largeLanguageModel: string
    publishedAt: string | null
    summary_feedbacks: {
      id: number
      voting: 'up' | 'down'
      createdAt: string
    }[]
    scraped_web_page: {
      title: string
      url: string
      originalContent: string
    }
  } = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    summaryId,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )
  return {
    lastScrapeUpdate,
    locale,
    keywords,
    summary,
    largeLanguageModel,
    publishedAt,
    summary_feedbacks,
    scraped_web_page,
  }
}

const upsertSummary = async ({ summaryId }: { summaryId: number }) => {
  const {
    lastScrapeUpdate,
    locale,
    keywords,
    summary,
    largeLanguageModel,
    publishedAt,
    summary_feedbacks,
    scraped_web_page,
  } = await getsummary(summaryId)

  const filterFeedbacks = summary_feedbacks.filter(
    (feedback) => new Date(feedback.createdAt) > new Date(lastScrapeUpdate),
  )
  const parsedKeywords = JSON.parse(keywords)

  const summaryDocument = {
    id: summaryId.toString(),
    language: locale,
    keywords: ((value: any): value is string[] =>
      Array.isArray(value) && value.every((item) => typeof item === 'string'))(
      parsedKeywords,
    )
      ? parsedKeywords
      : [],
    summary,
    largeLanguageModel,
    title: scraped_web_page?.title,
    url: scraped_web_page?.url,
    originalContent: scraped_web_page?.originalContent,
    publicationState: publishedAt
      ? PublicationState.Published
      : PublicationState.Draft,
    popularity: calculatePopularity(filterFeedbacks),
  }

  await ensureSummaryCollectionExists()
  await upsertSummaryDocument(summaryDocument, summaryId.toString())
}

const deleteFeedbacks = async ({ summaryId }) => {
  const { summary_feedbacks } = await getsummary(summaryId)

  for (const feedback of summary_feedbacks) {
    await strapi.entityService.delete(
      'api::summary-feedback.summary-feedback',
      feedback.id,
    )
  }
  await deleteSummaryDocument(summaryId.toString())
}

export default {
  async afterCreate(event) {
    await upsertSummary({ summaryId: event.result.id })
  },

  async afterUpdate(event) {
    await upsertSummary({ summaryId: event.result.id })
  },

  async afterUpdateMany(event) {
    for (const summaryId of event.params.where.id.$in) {
      await upsertSummary({ summaryId })
    }
  },

  async beforeDelete(event) {
    await deleteFeedbacks({ summaryId: event.params.where.id })
  },

  async beforeDeleteMany(event) {
    for (const summaryId of event.params?.where?.$and[0].id.$in) {
      await deleteFeedbacks({ summaryId })
    }
  },
}
