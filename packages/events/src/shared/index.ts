import { createEventClient } from '@george-ai/event-service-client'

export * from './schemas'

export const eventClient = await createEventClient()
