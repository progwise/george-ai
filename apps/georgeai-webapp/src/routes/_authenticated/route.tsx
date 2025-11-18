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

    // Get workspace ID from cookie, fallback to user's default workspace
    const workspaceId = await getCurrentWorkspaceCookie({
      data: { userDefaultWorkspaceId: context.user.defaultWorkspaceId },
    })

    // make user in router context non nullable and add workspaceId
    return { user: context.user, workspaceId }
  },
})

function RouteComponent() {
  return <Outlet />
}
