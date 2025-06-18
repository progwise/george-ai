import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { useTranslation } from '../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/admin')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user.isAdmin) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-warning text-base font-semibold">{t('admin.adminAreaHeadline')}</h3>
        <ul className="menu-horizontal bg-base-200 rounded-box menu-sm">
          <li>
            <Link
              to="/admin"
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: true }}
            >
              {t('admin.dashboard')}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className="btn btn-ghost btn-sm"
              activeProps={{ className: 'btn-active' }}
              activeOptions={{ exact: false }}
            >
              {t('admin.manageUsers')}
            </Link>
          </li>
        </ul>
      </div>
      <Outlet />
    </article>
  )
}
