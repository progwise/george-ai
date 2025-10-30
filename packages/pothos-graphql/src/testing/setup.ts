import resetDb from './reset-db'

beforeEach(async () => {
  await resetDb()
})
