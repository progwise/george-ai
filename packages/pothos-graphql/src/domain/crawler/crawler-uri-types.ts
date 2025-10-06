export const CRAWLER_URI_TYPES = ['http', 'smb', 'sharepoint', 'box'] as const
export type CrawlerUriType = (typeof CRAWLER_URI_TYPES)[number]
