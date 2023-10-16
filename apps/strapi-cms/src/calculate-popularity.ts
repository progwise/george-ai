export const calculatePopularity = (
  feedbacks: {
    id: number
    voting: 'up' | 'down'
    createdAt: string
  }[],
) => {
  let popularity = 0

  for (const feedback of feedbacks) {
    feedback.voting === 'up' ? (popularity += 1) : (popularity -= 1)
  }

  return popularity
}
