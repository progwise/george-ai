import { calculatePopularity } from './calculate-popularity.js'

describe('computeFeedbackPopularity', () => {
  it('should return 0 when there are no votes', () => {
    expect(calculatePopularity([])).toBe(0)
  })

  it('should correctly calculate the popularity with mixed votes', () => {
    expect(calculatePopularity(['up', 'down', 'up', 'up'])).toBe(2)
  })

  it('should correctly calculate the popularity with only up votes', () => {
    expect(calculatePopularity(['up', 'up', 'up'])).toBe(3)
  })

  it('should correctly calculate the popularity with only down votes', () => {
    expect(calculatePopularity(['down', 'down'])).toBe(-2)
  })
})
