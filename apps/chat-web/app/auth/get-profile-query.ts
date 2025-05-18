import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { getUserProfile } from '../server-functions/users'

const getProfileServerFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { userProfile } = await getUserProfile()
  return userProfile
})

export const getProfileQueryOptions = () =>
  queryOptions({
    queryKey: ['getProfile'],
    queryFn: () => getProfileServerFn(),
  })
