import { createLogger } from '@george-ai/app-commons'

export interface SourceLocation {
  readonly line: number
  readonly column: number
}

const logger = createLogger('app-domain:error:common')
export { logger }
