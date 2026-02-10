// Import types first to ensure they're registered with the builder
import './types'
// Then import queries and mutations
import './queries'
import './mutations'

import { logger } from '../common'

// Queue Management GraphQL Schema
// This module provides admin-only access to queue management functionality

logger.info('Setting up: Queue Management Schema')
