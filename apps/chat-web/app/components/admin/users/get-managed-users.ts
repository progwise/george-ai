import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

graphql(`
  fragment ManagedUser on ManagedUser {
    id
    username
    name
    given_name
    family_name
    lastLogin
    createdAt
    updatedAt
    email
    isAdmin
    registered
    business
    position
    confirmationDate
    activationDate
    avatarUrl
  }
`)

const getManagedUsers = createServerFn({
  method: 'GET',
})
  .validator((data: object) =>
    z
      .object({
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
        filter: z.string().optional(),
        statusFilter: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        query getManagedUsers($skip: Int!, $take: Int!, $filter: String, $statusFilter: String) {
          managedUsers(skip: $skip, take: $take, filter: $filter, statusFilter: $statusFilter) {
            skip
            take
            filter
            userStatistics {
              total
              confirmed
              unconfirmed
              activated
              unactivated
            }
            users {
              ...ManagedUser
            }
          }
        }
      `),
      { ...ctx.data },
    )
  })

export const getManagedUsersQueryOptions = (skip: number, take: number, filter?: string, statusFilter?: string) => ({
  queryKey: ['managedUsers', { skip, take, filter, statusFilter }],
  queryFn: () => getManagedUsers({ data: { skip, take, filter, statusFilter } }),
})
