import { builder } from './graphql/builder'

import './graphql/scalars'
import './graphql/chat'
import './graphql/user'
import './graphql/ai-assistant'
import './graphql/ai-knowledge-source'
import './graphql/ai-knowledge-source-file'

const schema = builder.toSchema()

export { schema }

export * from './file-upload'
