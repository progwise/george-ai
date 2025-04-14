import { AiActChecklistStep, AiActRiskIndicator, getDefaultBasicSystemInfo } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActChecklistStepRef } from './basic-system-info'
import { AiActRiskIndicatorRef } from './risk-indicator'

export * from './mutations'

interface AiActAssessmentQuery {
  riskIndicator: AiActRiskIndicator
  basicSystemInfo: AiActChecklistStep
}

const AiActAssessmentQuery = builder.objectRef<{ assistantId: string }>('AiActAssessmentQuery').implement({
  description: 'AI Act Assessment Query',
  fields: (t) => ({
    riskIndicators: t.field({
      type: AiActRiskIndicatorRef,
      resolve: (source) => {
        console.log('Calculate risk indicator for assistant', source.assistantId)
        return {
          level: 'medium' as const,
          description: { de: 'Keine Antworten gesammelt', en: 'No answers collected' },
          factors: [],
        }
      },
    }),
    basicSystemInfo: t.field({
      type: AiActChecklistStepRef,
      resolve: (source) => {
        return { ...getDefaultBasicSystemInfo(source.assistantId), assistantId: source.assistantId }
      },
    }),
  }),
})

builder.queryField('AiActAssessmentQuery', (t) =>
  t.field({
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    type: AiActAssessmentQuery,
    resolve: (_parent, args) => {
      return { assistantId: args.assistantId }
    },
  }),
)
