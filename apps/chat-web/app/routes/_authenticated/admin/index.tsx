import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArrowRight } from '../../../icons/arrow-right'

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
  const { t } = useTranslation()

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('admin.dashboardTitle')}</h3>
      </div>

      <div className="space-y-4">
        <p>{t('admin.welcomeMessage')}</p>

        <div>
          <h3 className="mb-3">{t('admin.availableFunctions')}</h3>

          <div className="grid gap-3 md:grid-cols-2">
            <Link to="/admin/users" className="group">
              <div className="card bg-base-100 shadow-sm transition-shadow hover:shadow-md">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title">{t('admin.manageUsers')}</h2>
                      <p className="text-sm">{t('admin.manageUsersDescription')}</p>
                    </div>
                    <ArrowRight className="size-5 shrink-0 opacity-70 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
