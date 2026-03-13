import { builder } from './graphql/builder'

// TODO: Refactor
import './graphql/ai-act-assessment'
import './graphql/ai-assistant'
import './graphql/ai-connector'
import './graphql/ai-conversation'
import './graphql/ai-conversation-invitation'
import './graphql/ai-conversation-message'
import './graphql/ai-conversation-participation'
import './graphql/ai-enrichments'
import './graphql/ai-library-crawler'
import './graphql/ai-library-update'
import './graphql/ai-library-usage'
import './graphql/ai-list'
import './graphql/ai-list-field'
import './graphql/api-key'
// Refactored:
import './graphql/automation'
import './graphql/common'
import './graphql/embedding'
import './graphql/event-system'
import './graphql/file'
import './graphql/inference'
import './graphql/library'
import './graphql/processing'
import './graphql/scalars'
import './graphql/settings'
import './graphql/user'
import './graphql/workspace'
import './init'

const schema = builder.toSchema()

export { schema }
