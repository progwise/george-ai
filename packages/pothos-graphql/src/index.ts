import { builder } from './graphql/builder'

// TODO: Refactor
import './domain/crawler/cron-jobs'
import './graphql/ai-act-assessment'
import './graphql/ai-assistant'
import './graphql/ai-automation'
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
import './graphql/common'
import './graphql/embedding'
import './graphql/file'
import './graphql/language-model'
import './graphql/library'
import './graphql/processing'
import './graphql/queue-management'
import './graphql/scalars'
import './graphql/settings'
import './graphql/user'
import './graphql/workspace'

const schema = builder.toSchema()

export { schema }

export { checkAssistant, getAssistantIconsPath, updateAssistantIconUrl } from './domain/assistant'
export { checkUser, updateUserAvatarUrl, getUserByMail, getUserById, getUserAvatarsPath } from './domain/user'
export { isProviderAvatar } from './domain/user/avatar-provider'
export { markUploadFinished } from './domain/file'
export {
  getWorkspaceMembership,
  getLibraryWorkspace,
  getWorkspaceProviders,
  initializeWorkspace,
} from './domain/workspace'
export type { WorkspaceMembershipInfo } from './domain/workspace'

export { startEnrichmentQueueWorker } from './worker-queue/enrichment-queue-worker'
export { subscribeConversationMessagesUpdate, unsubscribeConversationMessagesUpdates } from './subscriptions'
