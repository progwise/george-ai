export const fetchWebPageSummary = async (summaryId: string | number) => {
  return await strapi.entityService.findOne(
    'api::web-page-summary.web-page-summary',
    summaryId,
    {
      populate: ['scraped_web_page', 'summary_feedbacks'],
    },
  )
}
