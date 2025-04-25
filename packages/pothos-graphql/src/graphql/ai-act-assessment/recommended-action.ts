import { AiActRecommendedAction } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActStringRef } from './multilingual-string'

export const AiActRecommendedActionRef = builder.objectRef<AiActRecommendedAction>('AiActRecommendedAction').implement({
  description: 'AI Act Checklist Action',
  fields: (t) => ({
    level: t.exposeString('level', { nullable: false }),
    description: t.expose('description', { type: AiActStringRef, nullable: false }),
  }),
})
