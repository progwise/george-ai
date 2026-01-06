/**
 * Event Service Client - Provider-agnostic event messaging
 *
 * This package provides a clean abstraction over event messaging.
 * Current implementation: NATS JetStream
 * Future: Can be switched to RabbitMQ, Kafka, etc.
 *
 * IMPORTANT: Only import from this file, never from internal files
 */
import type { EventClient } from './event-client'
import { NatsClient } from './nats-client'

// Export only the interface, not the implementation
export type { EventClient }

/**
 * Connection configuration
 */
export interface EventClientConfig {
  servers?: string | string[]
  user?: string
  pass?: string
  token?: string
}

/**
 * Create a new event client with environment-based configuration
 */
async function createEventClient(config?: EventClientConfig): Promise<EventClient> {
  // Create new NATS client
  const natsClient = new NatsClient()

  // Get config from environment or use provided config
  const servers = config?.servers ?? process.env.NATS_URL ?? 'nats://gai-nats:4222'
  const user = config?.user ?? process.env.NATS_USER
  const pass = config?.pass ?? process.env.NATS_PASSWORD
  const token = config?.token ?? process.env.NATS_TOKEN

  await natsClient.connect({
    servers,
    user,
    pass,
    token,
  })

  // Wrap in EventClient interface
  return natsClient
}

export const eventClient = await createEventClient()
