import { AiActBasicSystemInfo, getDefaultBasicSystemInfo } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActBasicSystemInfoRef } from './basic-system-info'

type AiActRiskIndicator = {
  level: 'high' | 'medium' | 'low' | 'nonApplicable' | 'undetermined'
  description: string
  factors?: string[]
  calculated: Date
}

const AiActRiskIndicatorRef = builder.objectRef<AiActRiskIndicator>('AiActRiskIndicator').implement({
  description: 'AI Act Risk Indicator',
  fields: (t) => ({
    level: t.exposeString('level'),
    description: t.exposeString('description'),
    factors: t.exposeStringList('factors', { nullable: true }),
    calculated: t.expose('calculated', { type: 'DateTime' }),
  }),
})

interface AiActAssessmentQuery {
  riskIndicator: AiActRiskIndicator
  basicSystemInfo: AiActBasicSystemInfo
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
          description: 'Medium risk indicator description',
          calculated: new Date(),
        }
      },
    }),
    basicSystemInfo: t.field({
      type: AiActBasicSystemInfoRef,
      resolve: (source) => {
        const basicSystemInfo = getDefaultBasicSystemInfo(source.assistantId)
        return basicSystemInfo
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
