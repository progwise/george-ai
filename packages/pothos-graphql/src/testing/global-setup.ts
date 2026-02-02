import { exit } from 'process'

import { testing } from '@george-ai/app-database'

const setup = async () => {
  testing.ensureTestDatabase().then(() => {
    console.log('App database for tests is ready...')
  })
}

const teardown = async () => {
  // No global teardown needed currently
  exit(0)
}

export { setup, teardown }
