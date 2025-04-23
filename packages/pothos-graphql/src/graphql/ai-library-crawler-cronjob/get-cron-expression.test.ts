import { getCronExpression } from './get-cron-expression'

const defaultValues = {
  active: true,
  crawlerId: '',
  id: '',
  createdAt: new Date(),
  updatedAt: new Date(),
}

it('returns null if no days are selected', () => {
  const expression = getCronExpression({
    ...defaultValues,
    hour: 0,
    minute: 0,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })

  expect(expression).toBeNull()
})

it('returns once a week correctly', () => {
  const expression = getCronExpression({
    ...defaultValues,
    hour: 2,
    minute: 30,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })

  expect(expression).toBe('30 2 * * 1')
})

it('returns two consecutively days separate by comma', () => {
  const expression = getCronExpression({
    ...defaultValues,
    hour: 2,
    minute: 30,
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })

  expect(expression).toBe('30 2 * * 1,2')
})

it('returns three consecutively days with a range', () => {
  const expression = getCronExpression({
    ...defaultValues,
    hour: 2,
    minute: 30,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })

  expect(expression).toBe('30 2 * * 1-3')
})

it('returns three consecutively days, a day off and two consecutivly days as one range and two comma sperate days', () => {
  const expression = getCronExpression({
    ...defaultValues,
    hour: 2,
    minute: 30,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: false,
    friday: true,
    saturday: true,
    sunday: false,
  })

  expect(expression).toBe('30 2 * * 1-3,5,6')
})

it('returns seven days as a *', () => {
  const expression = getCronExpression({
    ...defaultValues,
    hour: 2,
    minute: 30,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  })

  expect(expression).toBe('30 2 * * *')
})
