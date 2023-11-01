import { computeFeedbackPopularity } from './compute-feedback-popularity.js'

describe('computeFeedbackPopularity', () => {
  it('should return 0 when there are no votes', () => {
    expect(computeFeedbackPopularity([])).toBe(0)
  })

  it('should correctly calculate the popularity with mixed votes', () => {
    expect(computeFeedbackPopularity(['up', 'down', 'up', 'up'])).toBe(2)
  })

  it('should correctly calculate the popularity with only up votes', () => {
    expect(computeFeedbackPopularity(['up', 'up', 'up'])).toBe(3)
  })

  it('should correctly calculate the popularity with only down votes', () => {
    expect(computeFeedbackPopularity(['down', 'down'])).toBe(-2)
  })
})
