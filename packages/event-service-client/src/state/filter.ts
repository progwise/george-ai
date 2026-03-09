import { InferenceDriver } from '@george-ai/app-schema'

import { InferenceModelLoadState, StateItemType } from './common'

export interface BaseStateFilter {
  type: StateItemType
}

export interface InferenceHostFilter extends BaseStateFilter {
  type: 'inferenceHost'
  workspaceId?: string
  hostId?: string
  driver?: InferenceDriver
}

export interface InferenceModelFilter extends BaseStateFilter {
  type: 'inferenceModel'
  workspaceId?: string
  driver?: InferenceDriver
  modelName?: string
  hostId?: string
  loadState?: InferenceModelLoadState
}

export type StateItemFilter = InferenceHostFilter | InferenceModelFilter
