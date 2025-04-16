import {
  AiActAssistantSurvey,
  AiActOption,
  AiActOptionRisk,
  AiActQuestion,
  performRiskAssessment,
} from '@george-ai/ai-act'

import { prisma } from '../../prisma'
import { builder } from '../builder'
import { AiActStringRef } from './multilingual-string'
import { AiActRecommendedActionRef } from './recommended-action'
import { AiActRiskIndicatorRef } from './risk-indicator'

export const AiActOptionRiskRef = builder.objectRef<AiActOptionRisk>('AiActOptionRisk').implement({
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

const AiActQuestionsRef = builder.objectRef<AiActQuestion>('AiActQuestions').implement({
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

export const AiActAssistantSurveyRef = builder
  .objectRef<AiActAssistantSurvey & { assistantId: string }>('AiActAssistantSurvey')
  .implement({
    description: 'AI Act Assessment Basic System Info',
    fields: (t) => ({
      title: t.expose('title', { type: AiActStringRef, nullable: false }),
      hint: t.expose('hint', { type: AiActStringRef, nullable: false }),
      assistantId: t.exposeString('assistantId', { nullable: false }),
      id: t.exposeString('id', { nullable: false }),
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
          const answers = await prisma.aiAssistantEUActAnswers.findMany({
            where: { assistantId: source.assistantId },
          })
          if (answers.length < source.questions.length) {
            return {
              level: 'undetermined' as const,
              description: { de: 'Keine Antworten gesammelt', en: 'No answers collected' },
              factors: [],
            }
          }

          source.questions = source.questions.map((question) => {
            const answer = answers.find((answer) => answer.questionId === question.id)
            return {
              ...question,
              value: answer?.answer ?? null,
              notes: answer?.notes ?? null,
            }
          })

          const riskIndicator = performRiskAssessment(source)
          return riskIndicator
        },
      }),
      actionsTitle: t.expose('actionsTitle', { type: AiActStringRef, nullable: false }),
      actions: t.field({
        type: [AiActRecommendedActionRef],
        resolve: (source) => {
          return source.actions.map((action) => ({
            level: action.level,
            description: action.description,
          }))
        },
      }),
    }),
  })
