import { exit } from 'process'

import { testing } from '@george-ai/app-database'

const setup = async () => {
  await testing.ensureTestDatabase('pothos-graphql')
}

const teardown = async () => {
  await testing.dropTestDatabase('pothos-graphql')
  exit(0)
}

export { setup, teardown }
