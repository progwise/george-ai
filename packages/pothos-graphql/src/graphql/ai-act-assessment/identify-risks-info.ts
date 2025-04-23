import {
  AiActComplianceArea,
  AiActIdentifyRisks,
  AiActLegalDisclaimer,
  getDefaultAssistantSurvey,
  performRiskAssessment,
} from '@george-ai/ai-act'

import { builder } from '../builder'
import { getQuestionsWithAnswers } from './answers'
import { AiActStringRef } from './multilingual-string'

export const AiActLegalDisclaimerRef = builder.objectRef<AiActLegalDisclaimer>('AIActLegalDisclaimer').implement({
  description: 'AI Act Legal Disclaimer',
  fields: (t) => ({
    title: t.expose('title', { type: AiActStringRef, nullable: false }),
    text: t.expose('text', { type: AiActStringRef, nullable: false }),
  }),
})

export const AiActComplianceAreaRef = builder.objectRef<AiActComplianceArea>('AiActComplianceArea').implement({
  description: 'AI Act Compliance Area',
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    title: t.expose('title', { type: AiActStringRef, nullable: false }),
    description: t.expose('description', { type: AiActStringRef, nullable: false }),
    mandatory: t.exposeBoolean('mandatory', { nullable: false }),
  }),
})

export const AiActIdentifyRisksInfoRef = builder
  .objectRef<AiActIdentifyRisks & { assistantId: string }>('AiActIdentifyRisksInfo')
  .implement({
    description: 'AI Act Identify Risks Info',
    fields: (t) => ({
      title: t.expose('title', { type: AiActStringRef, nullable: false }),
      legalDisclaimer: t.expose('legalDisclaimer', { type: AiActLegalDisclaimerRef, nullable: false }),
      complianceAreas: t.field({
        type: [AiActComplianceAreaRef],
        nullable: { list: false, items: false },
        resolve: async (source) => {
          const assistantId = source.assistantId
          const answers = await getQuestionsWithAnswers(assistantId, getDefaultAssistantSurvey(assistantId).questions)

          const euOperation = answers.find((a) => a.id === 'euOperation')?.value === 'Yes'

          if (!euOperation) {
            return []
          }
          const riskIndicator = performRiskAssessment(answers)

          const areas = new Set<string>()
          if (riskIndicator.level === 'high') {
            areas.add('documentation')
            areas.add('governance')
          } else if (riskIndicator.level === 'medium') {
            areas.add('documentation')
          }
          answers.forEach((q) => {
            switch (q.id) {
              case 'systemType':
                if (q.value === 'ML' || q.value === 'Both') {
                  areas.add('dataQuality')
                  areas.add('documentation')
                }
                break
              case 'operationMode':
                if (q.value === 'Autonomous') {
                  areas.add('humanOversight')
                  areas.add('security')
                }
                break
              case 'syntheticContent':
                if (q.value === 'Yes') {
                  areas.add('transparency')
                  areas.add('fundamentalRights')
                }
                break
              case 'gpaiModel':
                if (q.value === 'Yes' || q.value === 'Unsure') {
                  areas.add('governance')
                  areas.add('specificRequirements')
                }
                break
              default:
                break
            }
          })

          return source.complianceAreas.map((area) => ({
            ...area,
            mandatory: areas.has(area.id),
          }))
        },
      }),
    }),
  })
