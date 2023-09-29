export default {
  async beforeDeleteMany(event) {
    for (const pageId of event.params?.where?.$and[0].id.$in) {
      const webPage = await strapi.entityService.findOne(
        event.model.uid,
        pageId,
        {
          populate: [event.model.columnToAttribute.web_page_summaries],
        },
      )
      const summaryIds = webPage.web_page_summaries.map((summary) => summary.id)

      for (const id of summaryIds) {
        await strapi.entityService.delete(
          'api::web-page-summary.web-page-summary',
          id,
        )
      }
    }
  },
}
