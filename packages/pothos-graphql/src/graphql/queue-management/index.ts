// Import types first to ensure they're registered with the builder
import './types'
// Then import queries and mutations
import './queries'
import './mutations'

// Queue Management GraphQL Schema
// This module provides admin-only access to queue management functionality

console.log('Setting up: Queue Management Schema')

// Export types for use in other modules
export { QueueOperationResult, QueueStatus, QueueSystemStatus, QueueType } from './types'
