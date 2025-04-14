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
            basicSystemInfo {
              questions {
                id
                title {
                  en
                  de
                }
                notes
                value
                hint {
                  de
                  en
                }
                options {
                  id
                  title {
                    de
                    en
                  }
                  risk {
                    riskLevel
                    description {
                      de
                      en
                    }
                    points
                  }
                }
              }
              title {
                en
                de
              }
              percentCompleted
              hint {
                en
                de
              }
              riskIndicator {
                description {
                  de
                  en
                }
                factors {
                  de
                  en
                }
                level
              }
            }
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
