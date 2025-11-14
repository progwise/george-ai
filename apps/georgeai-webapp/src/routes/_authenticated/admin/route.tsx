import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { CpuIcon } from '../../../icons/cpu-icon'
import { ListViewIcon } from '../../../icons/list-view-icon'
import { ServerIcon } from '../../../icons/server-icon'
import { UsersIcon } from '../../../icons/users-icon'

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
    <div className="from-base-300/50 via-base-200/30 to-base-100/50 min-h-screen bg-gradient-to-br">
      {/* Admin Header with Navigation */}
      <div className="from-primary/10 via-secondary/10 to-accent/10 border-primary/20 border-b bg-gradient-to-r shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Header Section */}
            <div className="flex items-center gap-4">
              <div className="from-primary/20 to-secondary/20 rounded-full bg-gradient-to-br p-3 shadow-lg">
                <svg className="text-primary h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-primary text-2xl font-bold">{t('admin.adminAreaHeadline')}</h1>
                <p className="text-sm opacity-70">System administration and monitoring</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="tabs tabs-boxed bg-base-100/80 shadow-lg backdrop-blur-sm">
              <Link
                to="/admin"
                activeProps={{
                  className:
                    'tab tab-active [--tab-bg:theme(colors.primary)] [--tab-color:theme(colors.primary-content)]',
                }}
                inactiveProps={{
                  className: 'tab hover:bg-base-200/80 transition-colors duration-200',
                }}
                activeOptions={{ exact: true }}
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z"
                  />
                </svg>
                {t('admin.dashboard')}
              </Link>

              <Link
                to="/admin/users"
                activeProps={{
                  className:
                    'tab tab-active [--tab-bg:theme(colors.primary)] [--tab-color:theme(colors.primary-content)]',
                }}
                inactiveProps={{
                  className: 'tab hover:bg-base-200/80 transition-colors duration-200',
                }}
                activeOptions={{ exact: false }}
              >
                <UsersIcon className="mr-2 h-4 w-4" />
                {t('admin.manageUsers')}
              </Link>

              <Link
                to="/admin/ai-services"
                activeProps={{
                  className:
                    'tab tab-active [--tab-bg:theme(colors.secondary)] [--tab-color:theme(colors.secondary-content)]',
                }}
                inactiveProps={{
                  className: 'tab hover:bg-base-200/80 transition-colors duration-200',
                }}
                activeOptions={{ exact: false }}
              >
                <ServerIcon className="mr-2 h-4 w-4" />
                {t('admin.monitorAiServices')}
              </Link>

              <Link
                to="/admin/ai-models"
                activeProps={{
                  className: 'tab tab-active [--tab-bg:theme(colors.info)] [--tab-color:theme(colors.info-content)]',
                }}
                inactiveProps={{
                  className: 'tab hover:bg-base-200/80 transition-colors duration-200',
                }}
                activeOptions={{ exact: false }}
              >
                <CpuIcon className="mr-2 h-4 w-4" />
                {t('admin.manageAiModels')}
              </Link>

              <Link
                to="/admin/queues"
                activeProps={{
                  className:
                    'tab tab-active [--tab-bg:theme(colors.accent)] [--tab-color:theme(colors.accent-content)]',
                }}
                inactiveProps={{
                  className: 'tab hover:bg-base-200/80 transition-colors duration-200',
                }}
                activeOptions={{ exact: false }}
              >
                <ListViewIcon className="mr-2 h-4 w-4" />
                {t('admin.manageQueues')}
              </Link>
            </nav>
          </div>

          {/* Breadcrumbs */}
          <div className="mt-4 flex items-center text-sm">
            <div className="breadcrumbs">
              <ul>
                <li className="opacity-60">
                  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </li>
                <li className="text-primary font-semibold">
                  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Administration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <div className="bg-base-200/50 border-base-300/50 mt-auto border-t">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm opacity-60">
            <div className="flex items-center gap-2">
              <div className="bg-success h-2 w-2 animate-pulse rounded-full"></div>
              System Status: Operational
            </div>
            <div>Admin Panel v2.0 - Powered by George AI</div>
          </div>
        </div>
      </div>
    </div>
  )
}
