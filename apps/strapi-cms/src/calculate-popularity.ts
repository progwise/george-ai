export const calculatePopularity = (
  feedbacks: {
    id: string
    voting: 'up' | 'down'
    createdAt: number
  }[],
) => {
  let popularity = 0

  for (const feedback of feedbacks) {
    feedback.voting === 'up' ? (popularity += 1) : (popularity -= 1)
  }

  return popularity
}
