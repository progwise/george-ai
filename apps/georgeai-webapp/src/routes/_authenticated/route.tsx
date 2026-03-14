import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { logger } from '../../common'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    // make user in router context non nullable and add workspaceId
    return { user: context.user }
  },
  onError: async ({ error }) => {
    logger.error('Error in authenticated route', { error })
  },
})

function RouteComponent() {
  return <Outlet />
}
