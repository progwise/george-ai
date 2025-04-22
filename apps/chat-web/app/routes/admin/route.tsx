import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { useAuth } from '../../auth/auth-hook'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()
  if (auth.user?.username !== 'moncapitaine') {
    return <div>You are not authorized to access this page</div>
  }
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <ul className="menu w-56 rounded-box bg-base-200">
        <li>
          <h2 className="menu-title">
            <Link to="/admin">Admin</Link>
          </h2>
          <li>
            <Link to="/admin/users">Users</Link>
          </li>
          <li>
            <a>Item 2</a>
          </li>
          <li>
            <a>Item 3</a>
          </li>
        </li>
      </ul>
      <div className="flex flex-col">
        {/* Page content here */}
        <Outlet />
      </div>
    </div>
  )
}
