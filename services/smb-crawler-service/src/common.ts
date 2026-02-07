import { createLogger } from '@george-ai/app-commons'

export const logger = createLogger('smb-crawler-service')

// TODO: Move shared types like SmbCrawlOptions to a separate package if they need to be used by both the crawler service and domain
export type { SmbCrawlOptions, SmbFileMetadata } from '@george-ai/smb-crawler-client'
