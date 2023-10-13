import { fetchWebPageSummary } from './fetch-web-page-summary'

export const getFeedbacks = async (summaryId) => {
  const { lastScrapeUpdate, summary_feedbacks } =
    await fetchWebPageSummary(summaryId)

  const feedbacks =
    summary_feedbacks
      .filter(
        (
          feedbackData,
        ): feedbackData is {
          attributes: {
            id
            voting
            createdAt
          }
        } => {
          const { voting } = feedbackData ?? {}
          return voting === 'down' || voting === 'up'
        },
      )
      .map((feedback) => {
        const { voting, createdAt, id: feedbackId } = feedback
        return {
          feedbackId,
          createdAt: new Date(createdAt ?? 0),
          voting,
        }
      }) ?? []

  return {
    lastScrapeUpdate: new Date(lastScrapeUpdate ?? 0),
    feedbacks,
  }
}
