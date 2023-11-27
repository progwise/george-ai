// const deleteSummaries = async (pageId: number) => {
//   const scrapedPage = await strapi.entityService.findOne(
//     'api::scraped-web-page.scraped-web-page',
//     pageId,
//     {
//       populate: ['web_page_summaries'],
//     },
//   )
//   for (const summary of scrapedPage.web_page_summaries) {
//     await strapi.entityService.delete(
//       'api::web-page-summary.web-page-summary',
//       summary.id,
//     )
//   }
// }

// export default {
//   async beforeDelete(event) {
//     const pageId = event.params.where.id
//     await deleteSummaries(pageId)
//   },

//   async beforeDeleteMany(event) {
//     for (const pageId of event.params?.where?.$and[0].id.$in) {
//       await deleteSummaries(pageId)
//     }
//   },
// }
