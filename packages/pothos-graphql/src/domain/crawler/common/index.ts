import { createLogger } from '@george-ai/app-commons'

import { recordOmittedFile } from './record-omitted-file'
import { saveCrawlerFile } from './save-crawler-file'

const logger = createLogger('pothos-graphql:domain:crawler')

export { logger, saveCrawlerFile, recordOmittedFile }
