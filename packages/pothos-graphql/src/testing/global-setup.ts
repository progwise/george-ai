import { exit } from 'process'

import { dropTestDatabase, ensureTestDatabase } from '@george-ai/test-utils'

const setup = async () => {
  await ensureTestDatabase('pothos-graphql')
}

const teardown = async () => {
  await dropTestDatabase('pothos-graphql')
  exit(0)
}

export { setup, teardown }
