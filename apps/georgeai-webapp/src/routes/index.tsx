import { createFileRoute, redirect } from '@tanstack/react-router'

import { logger } from '../common'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // If user is not authenticated, redirect to login
    if (!context.user) {
      throw redirect({
        to: '/login',
      })
    }
    throw redirect({
      to: '/overview',
    })
  },

  onError: ({ error }) => {
    logger.error('Error in / route', { error })
  },
})
