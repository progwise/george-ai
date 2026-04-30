import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('api-crawler')

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
