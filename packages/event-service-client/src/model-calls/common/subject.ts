import { ModelProvider } from '@george-ai/app-commons'

import { MODEL_CALLS_BATCH_SUBJECT_PREFIX, MODEL_CALLS_DIRECT_SUBJECT_PREFIX, ModelCallType } from './common'

export const getBatchCallSubject = (args: {
  workspaceId: string
  provider: ModelProvider
  modelCallType: ModelCallType
  modelName: string
}) => {
  return `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.${args.workspaceId}.provider.${args.provider}.call.${args.modelCallType}.model.${args.modelName}`
}

export const getDirectCallSubject = (args: {
  workspaceId?: string
  provider?: ModelProvider
  modelCallType?: ModelCallType
  modelName?: string
}) => {
  return `${MODEL_CALLS_DIRECT_SUBJECT_PREFIX}.${args.workspaceId || '*'}.provider.${args.provider || '*'}.call.${args.modelCallType || '*'}.model.${args.modelName || '*'}`
}

export const getBatchResponseSubject = (args: {
  workspaceId: string
  provider: ModelProvider
  modelCallType: ModelCallType
  modelName: string
}) => {
  return `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.${args.workspaceId}.provider.${args.provider}.response.${args.modelCallType}.model.${args.modelName}`
}

export const getBatchResponseSubjectFilter = (args: { modelCallType: ModelCallType }) => {
  return `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.*.provider.*.response.${args.modelCallType}`
}
