import { builder } from '../builder'

import './queries'

console.log('Setting up: AiLanguageModel')

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
  }),
})
