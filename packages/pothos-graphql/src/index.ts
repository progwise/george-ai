import { builder } from './graphql/builder'

import './graphql/scalars'
import './graphql/chat'
import './graphql/user'
import './graphql/ai-assistant'
import './graphql/ai-library'
import './graphql/ai-library-file'

const schema = builder.toSchema()

export { schema }

export * from './file-upload'
