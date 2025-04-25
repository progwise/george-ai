import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    // make user in router context non nullable
    return { user: context.user }
  },
})

function RouteComponent() {
  return <Outlet />
}
