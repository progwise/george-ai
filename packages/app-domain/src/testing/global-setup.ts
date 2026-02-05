import { exit } from 'process'

import { testing } from '@george-ai/app-database'

const setup = async () => {
  await testing.ensureTestDatabase('app-domain')
}

const teardown = async () => {
  await testing.dropTestDatabase('app-domain')
  exit(0)
}

export { setup, teardown }
