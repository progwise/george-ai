import { AiActString } from '@george-ai/ai-act'

import { builder } from '../builder'

export const AiActStringRef = builder.objectRef<AiActString>('AiActString').implement({
  fields: (t) => ({
    en: t.exposeString('en', { nullable: false }),
    de: t.exposeString('de', { nullable: false }),
  }),
})
