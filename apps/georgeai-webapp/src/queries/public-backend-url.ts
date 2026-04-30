import { createServerFn } from '@tanstack/react-start'

import { BACKEND_PUBLIC_URL } from '../constants'
import { queryKeys } from '../query-keys'

export const getBackendPublicUrl = createServerFn({ method: 'GET' }).handler(() => {
  return BACKEND_PUBLIC_URL
})

export const getBackendPublicUrlQueryOptions = () => ({
  queryKey: [queryKeys.BackendPublicUrl],
  queryFn: getBackendPublicUrl,
})
