import { updatePopularity } from '../../../../update-summary '

const getSummaryAndUpdatePopularity = async ({
  feedbackId,
  excludeFeedbackId,
}) => {
  const summaryFeedbackResult = await strapi.entityService.findOne(
    'api::summary-feedback.summary-feedback',
    feedbackId,
    {
      populate: ['web_page_summary'],
    },
  )

  await updatePopularity({
    summaryId: summaryFeedbackResult.web_page_summary.id,
    excludeFeedbackId,
  })
}

export default {
  async afterCreate(event) {
    await updatePopularity({
      summaryId: event.params.data.web_page_summary,
      excludeFeedbackId: undefined,
    })
  },

  async beforeDelete(event) {
    await getSummaryAndUpdatePopularity({
      feedbackId: event.params.where.id,
      excludeFeedbackId: event.params.where.id,
    })
  },

  async beforeDeleteMany(event) {
    for (const feedbackId of event.params?.where?.$and[0].id.$in) {
      await getSummaryAndUpdatePopularity({
        feedbackId,
        excludeFeedbackId: feedbackId,
      })
    }
  },
}
