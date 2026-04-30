import { logger } from '../common'

import './mutations'
import './queries'
import './library'
import './library-manifest'
import './legacy-file'

export type { LegacyFile } from './legacy-file'

logger.info('Setting up: GraphQL Library Module')
