import { exit } from 'process'

import { dropTestDatabase, ensureTestDatabase } from '@george-ai/test-utils'

import { main } from '../app'

const setup = async () => {
  await ensureTestDatabase('event-queue-worker')
  await main()
}

const teardown = async () => {
  await dropTestDatabase('event-queue-worker')
  exit(0)
}

export { setup, teardown }
