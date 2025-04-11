import { AiActChecklistStepNavigation } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AiActStringRef } from './basic-system-info'

export const AIActChecklistNavigationRef = builder
  .objectRef<AiActChecklistStepNavigation>('AIActChecklistNavigation')
  .implement({
    description: 'AI Act Checklist Navigation',
    fields: (t) => ({
      title: t.expose('title', { type: AiActStringRef }),
      hint: t.expose('hint', { type: AiActStringRef }),
    }),
  })
//
