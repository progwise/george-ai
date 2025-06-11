import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admins/users')({
  component: UsersLayout,
})

function UsersLayout() {
  return <Outlet />
}
