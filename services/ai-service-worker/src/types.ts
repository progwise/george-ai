import { admin } from '@george-ai/events'

export type Provider = admin.WorkspaceStartupEvent['providers'][number]
export type LanguageModel = admin.WorkspaceStartupEvent['languageModels'][number]
