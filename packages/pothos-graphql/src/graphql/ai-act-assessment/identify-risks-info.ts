import { AiActComplianceArea, AiActIdentifyRisks, AiActLegalDisclaimer } from '@george-ai/ai-act'

import { builder } from '../builder'
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
  }),
})

export const AiActIdentifyRisksInfoRef = builder.objectRef<AiActIdentifyRisks>('AiActIdentifyRisksInfo').implement({
  description: 'AI Act Identify Risks Info',
  fields: (t) => ({
    title: t.expose('title', { type: AiActStringRef, nullable: false }),
    legalDisclaimer: t.expose('legalDisclaimer', { type: AiActLegalDisclaimerRef, nullable: false }),
    complianceAreas: t.expose('complianceAreas', { type: [AiActComplianceAreaRef], nullable: false }),
  }),
})
