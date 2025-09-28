import { createServerFn } from '@tanstack/react-start'

import { BACKEND_PUBLIC_URL } from '../constants'

export const getBackendPublicUrl = createServerFn({ method: 'GET' }).handler(() => {
  return BACKEND_PUBLIC_URL
})
