import { AiActRiskIndicator } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActStringRef } from './basic-system-info'

export const AiActRiskIndicatorRef = builder.objectRef<AiActRiskIndicator>('AiActRiskIndicator').implement({
  description: 'AI Act Risk Indicator',
  fields: (t) => ({
    level: t.exposeString('level'),
    description: t.expose('description', { type: AiActStringRef }),
    factors: t.expose('factors', { nullable: false, type: [AiActStringRef] }),
  }),
})
