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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold">{t('admin.adminAreaHeadline')}</h3>
        <nav className="flex gap-2">
          <Link
            to="/admin"
            activeProps={{
              className: 'btn btn-primary btn-sm',
            }}
            inactiveProps={{
              className: 'btn btn-ghost btn-sm',
            }}
            activeOptions={{ exact: true }}
          >
            {t('admin.dashboard')}
          </Link>
          <Link
            to="/admin/users"
            activeProps={{
              className: 'btn btn-primary btn-sm',
            }}
            inactiveProps={{
              className: 'btn btn-ghost btn-sm',
            }}
            activeOptions={{ exact: false }}
          >
            {t('admin.manageUsers')}
          </Link>
        </nav>
      </div>
      <Outlet />
    </article>
  )
}
