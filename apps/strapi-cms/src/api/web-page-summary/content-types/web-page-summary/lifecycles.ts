import { upsertTypesenseCollection } from '@george-ai/typesense-client'

const transformWebPageSummary = (webPageSummaryResult) => {
  return {
    id: webPageSummaryResult.id.toString(),
    attributes: {
      locale: webPageSummaryResult.locale,
      keywords: webPageSummaryResult.keywords,
      summary: webPageSummaryResult.summary,
      largeLanguageModel: webPageSummaryResult.largeLanguageModel,
      scraped_web_pages: {
        data: {
          attributes: {
            title: webPageSummaryResult.scraped_web_pages.title,
            url: webPageSummaryResult.scraped_web_pages.url,
            originalContent:
              webPageSummaryResult.scraped_web_pages.originalContent,
            publishedAt: webPageSummaryResult.scraped_web_pages.publishedAt,
          },
        },
      },
    },
  }
}

const transformAndUpsertSummary = async (id) => {
  const webPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    id,
    {
      populate: ['scraped_web_pages'],
    },
  )

  const webPageSummary = transformWebPageSummary(webPageSummaryResult)

  upsertTypesenseCollection(webPageSummary)
}

export default {
  async afterCreate(event) {
    await transformAndUpsertSummary(event.result.id)
  },

  async afterUpdate(event) {
    await transformAndUpsertSummary(event.result.id)
  },
}
