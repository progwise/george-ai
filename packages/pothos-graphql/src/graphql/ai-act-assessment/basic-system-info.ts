import { AiActChecklistStep, AiActOption, AiActQuestion, AiActString } from '@george-ai/ai-act'

import { builder } from '../builder'
import { AIActChecklistNavigationRef } from './navigation'

export const AiActStringRef = builder.objectRef<AiActString>('AiActString').implement({
  fields: (t) => ({
    en: t.exposeString('en'),
    de: t.exposeString('de'),
  }),
})

export const AiActOptionRef = builder.objectRef<AiActOption>('AiActOption').implement({
  description: 'AI Act Option',
  fields: (t) => ({
    id: t.exposeString('id'),
  }),
})

const AiActQuestionsRef = builder.objectRef<AiActQuestion>('AiActQuestionsRef').implement({
  description: 'AI Act Questions',
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.expose('title', { type: AiActStringRef }),
    hint: t.expose('hint', { type: AiActStringRef }),
    options: t.expose('options', { type: [AiActOptionRef] }),
    value: t.exposeString('value', { nullable: true }),
    notes: t.exposeString('notes', { nullable: true }),
  }),
})

export const AiActChecklistStepRef = builder.objectRef<AiActChecklistStep>('AiActChecklistStepRef').implement({
  description: 'AI Act Assessment Basic System Info 2',
  fields: (t) => ({
    title: t.expose('title', { type: AiActStringRef }),
    hint: t.expose('hint', { type: AiActStringRef }),
    id: t.exposeString('id'),
    percentCompleted: t.exposeInt('percentCompleted'),
    questions: t.field({
      type: [AiActQuestionsRef],
      resolve: (source) => source.questions,
    }),
    navigation: t.field({
      type: AIActChecklistNavigationRef,
      resolve: (source) => source.navigation,
    }),
  }),
})
