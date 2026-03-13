import { InferenceModel } from '@george-ai/app-schema'
import { InferenceModelState } from '@george-ai/event-service-client'

import { builder } from '../builder'

builder.objectRef<InferenceModelState>('InferenceModelState').implement({
  fields: (t) => ({
    workspaceId: t.exposeString('workspaceId'),
    hostId: t.exposeString('hostId'),
    loadState: t.exposeString('loadState'),
    driver: t.field({ type: 'InferenceDriver', nullable: false, resolve: (parent) => parent.connection.driver }),
    modelName: t.exposeString('modelName'),
    callCount: t.exposeInt('callCount'),
    errorCount: t.exposeInt('errorCount'),
    responseTimeMsPerToken: t.exposeInt('responseTimeMsPerToken'),
  }),
})

builder.objectRef<InferenceModel>('InferenceModel').implement({
  fields: (t) => ({
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    driver: t.expose('driver', { type: 'InferenceDriver', nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    canDoEmbedding: t.exposeBoolean('canDoEmbedding', { nullable: false }),
    canDoChatCompletion: t.exposeBoolean('canDoChatCompletion', { nullable: false }),
    canDoVision: t.exposeBoolean('canDoVision', { nullable: false }),
    canDoFunctionCalling: t.exposeBoolean('canDoFunctionCalling', { nullable: false }),
    enabled: t.exposeBoolean('enabled', { nullable: false }),
  }),
})

builder.prismaObject('AiLanguageModel', {
  name: 'AiLanguageModel',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    provider: t.exposeString('provider', { nullable: false }),
    canDoEmbedding: t.exposeBoolean('canDoEmbedding', { nullable: false }),
    canDoChatCompletion: t.exposeBoolean('canDoChatCompletion', { nullable: false }),
    canDoVision: t.exposeBoolean('canDoVision', { nullable: false }),
    canDoFunctionCalling: t.exposeBoolean('canDoFunctionCalling', { nullable: false }),
    enabled: t.exposeBoolean('enabled', { nullable: false }),
    adminNotes: t.exposeString('adminNotes', { nullable: true }),
    lastUsedAt: t.expose('lastUsedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    librariesUsingAsEmbedding: t.relation('librariesUsingForEmbedding'),
    assistantsUsingAsChat: t.relation('assistantsUsing'),
    listFieldsUsing: t.relation('listFieldsUsing'),
  }),
})
