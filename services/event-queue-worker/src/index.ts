import 'dotenv/config'

import { main } from './app'
import { WORKER_ID, logger } from './common'

main()
  .then(() => {
    logger.info('Event queue worker started successfully', { WORKER_ID })
  })
  .catch((error) => {
    logger.error('Error starting event queue worker:', error)
    process.exit(1)
  })
