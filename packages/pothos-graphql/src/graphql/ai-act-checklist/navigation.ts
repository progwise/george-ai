import { AiActChecklistNavigation } from '@george-ai/ai-act'

import { builder } from '../builder'

export const AIActChecklistNavigationRef = builder
  .objectRef<AiActChecklistNavigation>('AIActChecklistNavigation')
  .implement({
    description: 'AI Act Checklist Navigation',
    fields: (t) => ({
      title: t.exposeString('title'),
      description: t.exposeString('description'),
    }),
  })
//
