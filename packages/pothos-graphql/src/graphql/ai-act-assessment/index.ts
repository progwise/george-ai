import {
  AiActAssistantSurvey,
  AiActRiskIndicator,
  getDefaultAssistantSurvey,
  getDefaultIdentifyRisks,
} from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActAssistantSurveyRef } from './assistant-survey'
import { AiActIdentifyRisksInfoRef } from './identify-risks-info'

import './mutations'

interface AiActAssessment {
  riskIndicator: AiActRiskIndicator
  basicSystemInfo: AiActAssistantSurvey
}

const AiActAssessment = builder.objectRef<{ assistantId: string }>('AiActAssessment').implement({
  description: 'AI Act Assessment Query',
  fields: (t) => ({
    assistantId: t.exposeString('assistantId', { nullable: false }),
    assistantSurvey: t.field({
      type: AiActAssistantSurveyRef,
      nullable: false,
      resolve: (source) => {
        return { ...getDefaultAssistantSurvey(source.assistantId), assistantId: source.assistantId }
      },
    }),
    identifyRiskInfo: t.field({
      type: AiActIdentifyRisksInfoRef,
      nullable: false,
      resolve: (source) => {
        return { ...getDefaultIdentifyRisks(), assistantId: source.assistantId }
      },
    }),
  }),
})

builder.queryField('aiActAssessment', (t) =>
  t.field({
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    type: AiActAssessment,
    nullable: false,
    resolve: (_parent, args) => {
      return { assistantId: args.assistantId }
    },
  }),
)
