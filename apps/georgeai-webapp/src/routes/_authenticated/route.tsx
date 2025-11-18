import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getCurrentWorkspaceCookie } from '../../server-functions/workspace-cookie'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    // Get current workspace ID from cookie (not GraphQL - just reading the cookie)
    const workspaceId = await getCurrentWorkspaceCookie()

    // make user in router context non nullable and add workspaceId
    return { user: context.user, workspaceId }
  },
})

function RouteComponent() {
  return <Outlet />
}
