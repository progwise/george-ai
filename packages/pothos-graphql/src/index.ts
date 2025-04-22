import { builder } from './graphql/builder'

import './graphql/ai-assistant'
import './graphql/ai-conversation'
import './graphql/ai-conversation-message'
import './graphql/ai-library'
import './graphql/ai-library-file'
import './graphql/ai-library-crawler'
import './graphql/ai-library-usage'
import './graphql/ai-participation'
import './graphql/chat'
import './graphql/scalars'
import './graphql/user'
import './graphql/user-profile'
import './graphql/version'

const schema = builder.toSchema()

export { schema }

export * from './file-upload'
