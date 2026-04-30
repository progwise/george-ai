import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('test-utils')

export const conf = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}
