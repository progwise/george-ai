import createClient from 'openapi-fetch'

import type { paths } from './generated/schema'

const CRAWL4AI_BASE_URL = 'http://gai-crawl4ai:11245'

export const openApiClient = createClient<paths>({ baseUrl: CRAWL4AI_BASE_URL })
