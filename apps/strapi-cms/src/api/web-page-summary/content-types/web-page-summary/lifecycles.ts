import { upsertTypesenseCollection } from '@george-ai/typesense-client'

const transformWebPageSummary = (WebPageSummaryResult) => {
  return {
    id: WebPageSummaryResult.id.toString(),
    attributes: {
      Keywords: WebPageSummaryResult.Keywords,
      Summary: WebPageSummaryResult.Summary,
      LargeLanguageModel: WebPageSummaryResult.LargeLanguageModel,
      scraped_web_pages: {
        data: {
          attributes: {
            Title: WebPageSummaryResult.scraped_web_pages.Title,
            Url: WebPageSummaryResult.scraped_web_pages.Url,
            OriginalContent:
              WebPageSummaryResult.scraped_web_pages.OriginalContent,
            locale: WebPageSummaryResult.scraped_web_pages.locale,
            publishedAt: WebPageSummaryResult.scraped_web_pages.publishedAt,
          },
        },
      },
    },
  }
}

const transformAndUpsertSummary = async (id) => {
  const WebPageSummaryResult = await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    id,
    {
      populate: ['scraped_web_pages'],
    },
  )

  const WebPageSummary = transformWebPageSummary(WebPageSummaryResult)

  upsertTypesenseCollection(WebPageSummary)
}

export default {
  async afterCreate(event) {
    await transformAndUpsertSummary(event.result.id)
  },

  async afterUpdate(event) {
    await transformAndUpsertSummary(event.result.id)
  },
}
