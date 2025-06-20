import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { getUserProfile } from '../server-functions/users'

const getProfileServerFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await getUserProfile()
})

export const getProfileQueryOptions = () =>
  queryOptions({
    queryKey: ['getProfile'],
    queryFn: () => getProfileServerFn(),
  })
