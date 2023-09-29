import { deleteSummary } from '@george-ai/strapi-client'

export default {
  async afterDeleteMany(event) {
    for (const id of event.params?.where?.$and[0].id.$in) {
      console.log('id: ', id)
      const webPageSummaries = await strapi.entityService.findMany(
        'api::web-page-summary.web-page-summary',
        {
          'scraped_web_page.id': id,
        },
      )
      console.log('webPageSummaries: ', webPageSummaries)
      for (const summary of webPageSummaries) {
        await deleteSummary(summary.id)
      }
    }
  },
}
