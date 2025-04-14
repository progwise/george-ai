import { AiActChecklistStep, AiActOption, AiActOptionRisk, AiActQuestion, AiActString } from '@george-ai/ai-act'

import { prisma } from '../../prisma'
import { builder } from '../builder'
import { AIActChecklistNavigationRef } from './navigation'
import { AiActRiskIndicatorRef } from './risk-indicator'

export const AiActStringRef = builder.objectRef<AiActString>('AiActString').implement({
  fields: (t) => ({
    en: t.exposeString('en', { nullable: false }),
    de: t.exposeString('de', { nullable: false }),
  }),
})

export const AiActOptionRiskRef = builder.objectRef<AiActOptionRisk>('AiActOptionRiskRef').implement({
  fields: (t) => ({
    points: t.exposeInt('points', { nullable: false }),
    description: t.expose('description', { type: AiActStringRef, nullable: false }),
    riskLevel: t.exposeString('riskLevel'),
  }),
})

export const AiActOptionRef = builder.objectRef<AiActOption>('AiActOption').implement({
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    title: t.expose('title', { type: AiActStringRef, nullable: false }),
    risk: t.field({
      type: AiActOptionRiskRef,
      nullable: true,
      resolve: (source) => {
        if (!source.risk) {
          return null
        }
        return {
          level: source.risk.riskLevel ?? ('medium' as const),
          description: source.risk.description,
          points: source.risk.points,
          factors: [],
        }
      },
    }),
  }),
})

const AiActQuestionsRef = builder.objectRef<AiActQuestion>('AiActQuestionsRef').implement({
  description: 'AI Act Questions',
  fields: (t) => ({
    id: t.exposeString('id', { nullable: false }),
    title: t.expose('title', { type: AiActStringRef, nullable: false }),
    hint: t.expose('hint', { type: AiActStringRef, nullable: false }),
    options: t.expose('options', { type: [AiActOptionRef], nullable: { list: false, items: false } }),
    value: t.exposeString('value', { nullable: true }),
    notes: t.exposeString('notes', { nullable: true }),
  }),
})

export const AiActChecklistStepRef = builder
  .objectRef<AiActChecklistStep & { assistantId: string }>('AiActChecklistStepRef')
  .implement({
    description: 'AI Act Assessment Basic System Info 2',
    fields: (t) => ({
      title: t.expose('title', { type: AiActStringRef }),
      hint: t.expose('hint', { type: AiActStringRef }),
      id: t.exposeString('id'),
      percentCompleted: t.field({
        type: 'Int',
        resolve: async (source) => {
          const answerCount = await prisma.aiAssistantEUActAnswers.count({
            where: { assistantId: source.assistantId },
          })
          return Math.round((answerCount / source.questions.length) * 100)
        },
      }),
      questions: t.field({
        type: [AiActQuestionsRef],
        resolve: async (source) => {
          const answers = await prisma.aiAssistantEUActAnswers.findMany({
            where: { assistantId: source.assistantId },
          })

          return source.questions.map((question) => {
            const answer = answers.find((answer) => answer.questionId === question.id)
            return {
              ...question,
              value: answer?.answer ?? null,
              notes: answer?.notes ?? null,
            }
          })
        },
      }),
      riskIndicator: t.field({
        type: AiActRiskIndicatorRef,
        resolve: async (source) => {
          const answeredQuestions = await prisma.aiAssistantEUActAnswers.findMany({
            where: { assistantId: source.assistantId },
          })
          if (answeredQuestions.length < source.questions.length) {
            return {
              level: 'undetermined' as const,
              description: { de: 'Keine Antworten gesammelt', en: 'No answers collected' },
              factors: [],
            }
          }
          const riskPoints = answeredQuestions.reduce((acc, question) => {
            const option = source.questions
              .find((q) => q.id === question.questionId)
              ?.options.find((o) => o.id === question.answer)
            return acc + (option?.risk?.points ?? 0)
          }, 0)
          const riskLevel = riskPoints > 10 ? 'high' : riskPoints > 5 ? 'medium' : 'low'
          return {
            level: riskLevel,
            description: { de: 'Noch nicht vollständig implementiert', en: 'Not fully implemented yet' },
            factors: [],
          }
        },
      }),
      navigation: t.field({
        type: AIActChecklistNavigationRef,
        resolve: (source) => source.navigation,
      }),
    }),
  })
