import {
  AiActChecklistStep,
  AiActRiskIndicator,
  getDefaultBasicSystemInfo,
  getDefaultIdentifyRisks,
} from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActBasicSystemInfoRef } from './basic-system-info'
import { AiActIdentifyRisksInfoRef } from './identify-risks-info'
import { AiActRiskIndicatorRef } from './risk-indicator'

export * from './mutations'

interface AiActAssessment {
  riskIndicator: AiActRiskIndicator
  basicSystemInfo: AiActChecklistStep
}

const AiActAssessment = builder.objectRef<{ assistantId: string }>('AiActAssessment').implement({
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
    assistantId: t.exposeString('assistantId', { nullable: false }),
    basicSystemInfo: t.field({
      type: AiActBasicSystemInfoRef,
      nullable: false,
      resolve: (source) => {
        return { ...getDefaultBasicSystemInfo(source.assistantId), assistantId: source.assistantId }
      },
    }),
    identifyRiskInfo: t.field({
      type: AiActIdentifyRisksInfoRef,
      nullable: false,
      resolve: () => {
        return getDefaultIdentifyRisks()
      },
    }),
  }),
})

builder.queryField('AiActAssessmentQuery', (t) =>
  t.field({
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    type: AiActAssessment,
    resolve: (_parent, args) => {
      return { assistantId: args.assistantId }
    },
  }),
)
