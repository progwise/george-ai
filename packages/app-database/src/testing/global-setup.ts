import { exit } from 'process'

import { ensureTestDatabase } from './test-database'

const setup = async () => {
  await ensureTestDatabase().then(() => {
    console.log('Test database is ready...')
  })
}

const teardown = async () => {
  // No global teardown needed currently
  exit(0)
}

export { setup, teardown }
