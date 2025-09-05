import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArrowRight } from '../../../icons/arrow-right'
import { ServerIcon } from '../../../icons/server-icon'
import { UsersIcon } from '../../../icons/users-icon'

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
    <div className="from-base-200 via-base-100 to-base-200 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-primary mb-2 text-4xl font-bold">{t('admin.dashboardTitle')}</h1>
          <p className="text-lg opacity-80">{t('admin.welcomeMessage')}</p>
        </div>

        {/* Admin Functions Grid */}
        <div>
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold">
            <div className="bg-primary h-8 w-1 rounded-full"></div>
            {t('admin.availableFunctions')}
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {/* Users Management Card */}
            <Link to="/admin/users" className="group">
              <div className="card from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 border bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div className="card-body p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-4">
                        <div className="bg-primary/20 rounded-full p-3">
                          <UsersIcon className="text-primary h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="card-title mb-1 text-xl">{t('admin.manageUsers')}</h3>
                          <div className="badge badge-primary badge-outline">User Management</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed opacity-80">{t('admin.manageUsersDescription')}</p>
                    </div>
                    <ArrowRight className="h-6 w-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                  </div>

                  {/* Feature highlights */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="badge badge-sm badge-ghost">View Users</div>
                    <div className="badge badge-sm badge-ghost">Edit Profiles</div>
                    <div className="badge badge-sm badge-ghost">Activate Accounts</div>
                  </div>
                </div>
              </div>
            </Link>

            {/* AI Services Monitoring Card */}
            <Link to="/admin/ai-services" className="group">
              <div className="card from-secondary/10 to-secondary/5 border-secondary/20 hover:border-secondary/40 border bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div className="card-body p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-4">
                        <div className="bg-secondary/20 rounded-full p-3">
                          <ServerIcon className="text-secondary h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="card-title mb-1 text-xl">{t('admin.monitorAiServices')}</h3>
                          <div className="badge badge-secondary badge-outline">System Monitoring</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed opacity-80">{t('admin.monitorAiServicesDescription')}</p>
                    </div>
                    <ArrowRight className="h-6 w-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                  </div>

                  {/* Feature highlights */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="badge badge-sm badge-ghost">GPU Memory</div>
                    <div className="badge badge-sm badge-ghost">Model Status</div>
                    <div className="badge badge-sm badge-ghost">Load Balancing</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold">
            <div className="bg-info h-8 w-1 rounded-full"></div>
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-4">
            <Link to="/admin/users" className="btn btn-primary btn-outline">
              <UsersIcon className="h-5 w-5" />
              View All Users
            </Link>
            <Link to="/admin/ai-services" className="btn btn-secondary btn-outline">
              <ServerIcon className="h-5 w-5" />
              Check AI Status
            </Link>
            <button className="btn btn-ghost" disabled type="button">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              System Settings
              <div className="badge badge-warning badge-sm">Soon</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
