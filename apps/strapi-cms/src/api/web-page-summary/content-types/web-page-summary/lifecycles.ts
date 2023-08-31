import { upsertTypesenseDocument } from "@george-ai/typesense-client";


export default    {
 async afterCreate(event) {
    const WebPageSummary = await strapi.entityService.findOne('api::web-page-summary.web-page-summary', event.result.id, {
      populate: ["scraped_web_pages"]
    })
      upsertTypesenseDocument(WebPageSummary)
    },

  async afterUpdate(event) {
  const WebPageSummary = await strapi.entityService.findOne('api::web-page-summary.web-page-summary', event.result.id, {
    populate: ["scraped_web_pages"]
  })
  upsertTypesenseDocument(WebPageSummary)
  },
};
