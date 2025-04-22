import { AiActRiskIndicator } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActStringRef } from './multilingual-string'

export const AiActRiskIndicatorRef = builder.objectRef<AiActRiskIndicator>('AiActRiskIndicator').implement({
  description: 'AI Act Risk Indicator',
  fields: (t) => ({
    level: t.exposeString('level', { nullable: false }),
    description: t.expose('description', { type: AiActStringRef, nullable: false }),
    factors: t.expose('factors', { nullable: false, type: [AiActStringRef] }),
  }),
})
