export const calculatePopularity = (
  feedbacks,
  lastScrapeUpdate,
  excludeFeedbackId?,
) => {
  let popularity = 0

  const votes = feedbacks
    .filter((feedback) => {
      if (!excludeFeedbackId) {
        return feedback.createdAt > lastScrapeUpdate
      }
      return (
        feedback.createdAt > lastScrapeUpdate &&
        feedback.feedbackId !== excludeFeedbackId
      )
    })
    .map((feedback) => feedback.voting)

  for (const vote of votes) {
    vote === 'up' ? (popularity += 1) : (popularity -= 1)
  }

  return popularity
}
