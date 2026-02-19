import apiKey from './api-key'
import assistant from './assistant'
import automation from './automation'
import conversation from './conversation'
import document from './document'
import enrichment from './enrichment'
import file from './file'
import { initializeAppDomain } from './initialize'
import languageModel from './languageModel'
import library from './library'
import list from './list'
import processing from './processing'
import subscriptions from './subscriptions'
import user from './user'
import workspace from './workspace'

initializeAppDomain().catch((error) => {
  console.error('Error initializing app domain:', error)
})

export * from './access-control'
export * from './crawler'
export * from './assistant'
export * from './automation'
export * from './config'
export * from './context'
export * from './conversation'
export * from './document'
export * from './enrichment'
export * from './file'
export * from './languageModel'
export * from './library'
export * from './list'
export * from './processing'
export * from './workspace'
export * from './user'
export * from './subscriptions'
export * from './api-key'
export * from './error'

export default {
  apiKey,
  assistant,
  conversation,
  automation,
  document,
  enrichment,
  file,
  languageModel,
  library,
  list,
  processing,
  workspace,
  user,
  subscriptions,
}

export {
  apiKey,
  assistant,
  conversation,
  automation,
  document,
  enrichment,
  file,
  languageModel,
  library,
  list,
  processing,
  workspace,
  user,
  subscriptions,
}
