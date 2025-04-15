import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getAiAssistantChecklistStep1 = createServerFn({ method: 'GET' })
  .validator((data: string) => {
    return z.string().parse(data)
  })
  .handler(async (ctx) => {
    return backendRequest(
      graphql(`
        query AiActAssessmentQuery($assistantId: String!) {
          AiActAssessmentQuery(assistantId: $assistantId) {
            ...RiskAreasIdentification_Assessment
            ...BasicSystemInfo_Assessment
          }
        }
      `),
      { assistantId: ctx.data },
    )
  })

export const getChecklistStep1QueryOptions = (assistantId?: string) =>
  queryOptions({
    queryKey: ['AiChecklist', assistantId],
    queryFn: () => (assistantId ? getAiAssistantChecklistStep1({ data: assistantId }) : null),
    enabled: !!assistantId,
  })

export const updateBasicSystemInfo = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    const entries = Object.fromEntries(data)
    return z
      .object({
        assistantId: z.string().nonempty(),
        questionId: z.string().nonempty(),
        value: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(entries)
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
  .validator((data: { assistantId: unknown }) => {
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
