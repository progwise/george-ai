import { exit } from 'process'

import { dropTestDatabase, ensureTestDatabase } from '@george-ai/test-utils'

const setup = async () => {
  await ensureTestDatabase('app-domain')
}

const teardown = async () => {
  await dropTestDatabase('app-domain')
  exit(0)
}

export { setup, teardown }
