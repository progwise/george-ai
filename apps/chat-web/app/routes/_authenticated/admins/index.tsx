import { Navigate, createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admins/')({
  beforeLoad: ({ context }) => {
    if (!context.user?.isAdmin) {
      throw notFound()
    }
    return {}
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  return <Navigate to="/admins/users" />
}
