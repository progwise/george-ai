import type { EventClient, EventClientConfig } from './event-client'
import { NatsClient } from './nats-client'

// Export only the interface, not the implementation
export type { EventClient }

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
