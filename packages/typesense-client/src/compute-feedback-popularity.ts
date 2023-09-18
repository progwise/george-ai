export const computeFeedbackPopularity = (
  summaryFeedbacks: { voting: string }[],
) => {
  let accumulator = 0

  for (const feedback of summaryFeedbacks) {
    const vote = feedback.voting
    if (vote === 'up') {
      accumulator += 1
    } else if (vote === 'down') {
      accumulator -= 1
    } else {
      console.warn(
        `Value ${vote} is not implemented for calculating the popularity`,
      )
    }
  }

  return accumulator
}
