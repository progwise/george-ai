import { exit } from 'process'

import { dropTestDatabase, ensureTestDatabase } from '@george-ai/test-utils'

const setup = async () => {
  await ensureTestDatabase('app-database')
}

const teardown = async () => {
  await dropTestDatabase('app-database')
  exit(0)
}

export { setup, teardown }
