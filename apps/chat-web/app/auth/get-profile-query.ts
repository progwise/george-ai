import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getUserProfile } from '../server-functions/users'

const getProfileServerFn = createServerFn({ method: 'GET' })
  .validator((userId: string) => z.string().nonempty().parse(userId))
  .handler(async ({ data }) => {
    const { userProfile } = await getUserProfile({ data: { profileId: data } })
    return userProfile
  })

export const getProfileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['getProfile', userId],
    queryFn: () => getProfileServerFn({ data: userId }),
  })
