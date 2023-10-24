import {
  PublicationState,
  calculatePopularity,
  deleteSummaryDocument,
  ensureSummaryCollection,
  upsertSummaryDocument,
} from '@george-ai/typesense-client'

const getSummary = async (summaryId: number) => {
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

const upsertSummary = async (summaryId: number) => {
  const {
    lastScrapeUpdate,
    locale,
    keywords,
    summary,
    largeLanguageModel,
    publishedAt,
    summary_feedbacks,
    scraped_web_page,
  } = await getSummary(summaryId)

  const filterFeedbacks = summary_feedbacks
    .filter(
      (feedback) => new Date(feedback.createdAt) > new Date(lastScrapeUpdate),
    )
    .map((feedback) => feedback.voting)
  const parsedKeywords: string[] = JSON.parse(keywords)

  const summaryDocument = {
    id: summaryId.toString(),
    language: locale,
    keywords: parsedKeywords,
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
  try {
    await ensureSummaryCollection()
  } catch (error) {
    console.error(
      'Failed to ensuring the summary collection exists:',
      error,
    )
  }
  try {
    await upsertSummaryDocument(summaryDocument)
  } catch (error) {
    console.error(`Failed to upsert the summary document with id: ${summaryId}`, error)
  }
}

const deleteFeedbacks = async (summaryId) => {
  const { summary_feedbacks } = await getSummary(summaryId)

  for (const feedback of summary_feedbacks) {
    await strapi.entityService.delete(
      'api::summary-feedback.summary-feedback',
      feedback.id,
    )
  }
  try {
    await deleteSummaryDocument(summaryId.toString())
  } catch (error) {
    console.error(
      `Failed to delete the summary document with id: ${summaryId}`,
      error,
    )
  }
}

export default {
  async afterCreate(event) {
    const summaryId = event.result.id
    await upsertSummary(summaryId)
  },

  async afterUpdate(event) {
    const summaryId = event.result.id
    await upsertSummary(summaryId)
  },

  async afterUpdateMany(event) {
    for (const summaryId of event.params.where.id.$in) {
      await upsertSummary(summaryId)
    }
  },

  async beforeDelete(event) {
    const summaryId = event.params.where.id
    await deleteFeedbacks(summaryId)
  },

  async beforeDeleteMany(event) {
    for (const summaryId of event.params?.where?.$and[0].id.$in) {
      await deleteFeedbacks(summaryId)
    }
  },
}
