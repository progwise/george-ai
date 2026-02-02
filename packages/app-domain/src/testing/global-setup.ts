import { exit } from 'process'

import { testing } from '@george-ai/app-database'

const setup = async () => {
  await testing.ensureTestDatabase()
}

const teardown = async () => {
  exit(0)
}

export { setup, teardown }
