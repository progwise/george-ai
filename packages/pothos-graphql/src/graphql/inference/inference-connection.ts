import { InferenceHostConfig } from '@george-ai/event-service-client'

import { builder } from '../builder'

builder.objectRef<InferenceHostConfig['connection']>('InferenceHostConnection').implement({
  fields: (t) => ({
    driver: t.expose('driver', { type: 'InferenceDriver', nullable: false }),
    baseUrl: t.exposeString('baseUrl', { nullable: true }),
    encryptedApiKey: t.exposeString('encryptedApiKey', { nullable: true }),
  }),
})
