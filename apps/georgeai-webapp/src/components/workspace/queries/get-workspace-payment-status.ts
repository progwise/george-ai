import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../../gql'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const workspacePaymentStatusQueryDocument = graphql(`
  query GetWorkspacePaymentStatus($workspaceId: ID!) {
    workspacePaymentStatus(workspaceId: $workspaceId) {
      isPaid
      subscriptionType
      validUntil
    }
  }
`)

const getWorkspacePaymentStatus = createServerFn({ method: 'GET' })
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async (ctx) => {
    const { workspacePaymentStatus } = await backendRequest(workspacePaymentStatusQueryDocument, {
      workspaceId: ctx.data.workspaceId,
    })
    return workspacePaymentStatus
  })

export const getWorkspacePaymentStatusQueryOptions = (workspaceId?: string) =>
  queryOptions({
    queryKey: [queryKeys.WorkspacePaymentStatus, workspaceId],
    queryFn: async () => (await getWorkspacePaymentStatus({ data: { workspaceId: workspaceId! } })) ?? null,
    enabled: !!workspaceId,
  })
