import { createLogger } from '@george-ai/app-commons'

export { ContextSchema, type Context } from './context'
export { ResultSchema, type Result } from './result'

export const logger = createLogger('event-service-client')
