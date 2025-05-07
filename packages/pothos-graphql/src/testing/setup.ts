import resetDb from './reset-db'

process.env.OPENAI_API_KEY = '123'
process.env.TAVILY_API_KEY = '123'

beforeEach(async () => {
  await resetDb()
})
