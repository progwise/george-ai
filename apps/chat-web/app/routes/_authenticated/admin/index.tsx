import { Link, createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/')({
  beforeLoad: ({ context }) => {
    if (!context.user?.isAdmin) {
      throw notFound()
    }
    return {}
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div className="prose">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <p className="mt-2">Welcome to the admin dashboard. Use the navigation to manage users and settings.</p>
      <p>Currently for admins the following functions are implemented</p>
      <dl>
        <dt>
          {' '}
          <Link to="/admin/users" className="link-accent">
            Manage Users
          </Link>
        </dt>
        <dd>You can see all users, activate them and tweak their profiles. You can also delete users.</dd>
      </dl>
    </div>
  )
}
