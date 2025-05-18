import { builder } from './graphql/builder'

import './cron-jobs'
import './graphql/ai-act-assessment'
import './graphql/ai-assistant'
import './graphql/ai-assistant-participation'
import './graphql/ai-conversation'
import './graphql/ai-conversation-invitation'
import './graphql/ai-conversation-message'
import './graphql/ai-conversation-participation'
import './graphql/ai-library'
import './graphql/ai-library-crawler'
import './graphql/ai-library-crawler-cronjob'
import './graphql/ai-library-file'
import './graphql/ai-library-participation'
import './graphql/ai-library-usage'
import './graphql/chat'
import './graphql/contact-request'
import './graphql/scalars'
import './graphql/user'
import './graphql/user-profile'
import './graphql/version'

const schema = builder.toSchema()

export { schema }

export * from './file-upload'
export * from './graphql/context'
export * from './prisma'
