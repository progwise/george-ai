export const calculatePopularity = (feedbacks: ('up' | 'down')[]) => {
  let popularity = 0

  for (const feedback of feedbacks) {
    feedback === 'up' ? (popularity += 1) : (popularity -= 1)
  }

  return popularity
}
