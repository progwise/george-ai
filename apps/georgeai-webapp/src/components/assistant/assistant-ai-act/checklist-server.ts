import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getAiActAssessment = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => {
    return z.string().parse(data)
  })
  .handler(async (ctx) => {
    return backendRequest(
      graphql(`
        query AiActAssessmentQuery($assistantId: String!) {
          aiActAssessment(assistantId: $assistantId) {
            ...RiskAreasIdentification_Assessment
            ...AssistantSurvey_Assessment
          }
        }
      `),
      { assistantId: ctx.data },
    )
  })

export const getAiActAssessmentQueryOptions = (assistantId: string) =>
  queryOptions({
    queryKey: ['AiChecklist', assistantId],
    queryFn: () => getAiActAssessment({ data: assistantId }),
  })

export const updateBasicSystemInfo = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    return z
      .object({
        assistantId: z.string().nonempty(),
        questionId: z.string().nonempty(),
        value: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    const { assistantId, questionId, value, notes } = ctx.data
    return backendRequest(
      graphql(`
        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {
          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)
        }
      `),
      { assistantId, questionId, value, notes },
    )
  })

export const resetAssessment = createServerFn({ method: 'POST' })
  .inputValidator((data: { assistantId: unknown }) => {
    return z
      .object({
        assistantId: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    const { assistantId } = ctx.data
    return backendRequest(
      graphql(`
        mutation resetAssessmentAnswers($assistantId: String!) {
          resetAssessmentAnswers(assistantId: $assistantId)
        }
      `),
      { assistantId },
    )
  })
