const getSummariesAndDelete = async (pageId) => {
  const scrapedPage = await strapi.entityService.findOne(
    'api::scraped-web-page.scraped-web-page',
    pageId,
    {
      populate: ['web_page_summaries'],
    },
  )
  const summaryIds = scrapedPage.web_page_summaries.map((summary) => summary.id)

  for (const id of summaryIds) {
    await strapi.entityService.delete(
      'api::web-page-summary.web-page-summary',
      id,
    )
  }
}

export default {
  async beforeDelete(event) {
    getSummariesAndDelete(event.params.where.id)
  },

  async beforeDeleteMany(event) {
    for (const pageId of event.params?.where?.$and[0].id.$in) {
      getSummariesAndDelete(pageId)
    }
  },
}
