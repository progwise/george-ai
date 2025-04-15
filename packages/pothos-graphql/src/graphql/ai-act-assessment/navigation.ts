import { AiActChecklistAction, AiActChecklistStepNavigation } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActStringRef } from './multilingual-string'

export const AiActChecklistActionRef = builder.objectRef<AiActChecklistAction>('AIActChecklistAction').implement({
  description: 'AI Act Checklist Action',
  fields: (t) => ({
    level: t.exposeString('level', { nullable: false }),
    description: t.expose('description', { type: AiActStringRef, nullable: false }),
  }),
})

export const AIActChecklistNavigationRef = builder
  .objectRef<AiActChecklistStepNavigation>('AIActChecklistNavigation')
  .implement({
    description: 'AI Act Checklist Navigation',
    fields: (t) => ({
      title: t.expose('title', { type: AiActStringRef, nullable: false }),
      actions: t.field({
        type: [AiActChecklistActionRef],
        nullable: false,
        resolve: (parent) => parent.actions,
      }),
    }),
  })
