export const filterValidFeedbacks = (summary_feedbacks) => {
  return (
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
  )
}
