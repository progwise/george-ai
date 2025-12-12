import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { useWorkspace } from '../../../components/workspace/use-workspace'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { BriefcaseIcon } from '../../../icons/briefcase-icon'
import { BuildingOfficeIcon } from '../../../icons/building-office-icon'
import { CpuIcon } from '../../../icons/cpu-icon'
import { LinkIcon } from '../../../icons/link-icon'
import { ListViewIcon } from '../../../icons/list-view-icon'
import { ServerIcon } from '../../../icons/server-icon'
import { ShieldCheckIcon } from '../../../icons/shield-check-icon'
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
  const { user } = Route.useRouteContext()
  const { t } = useTranslation()
  const { currentWorkspace } = useWorkspace(user)

  return (
    <div className="grid h-[calc(100dvh-6rem)] w-[calc(100dvw-4rem)] grid-rows-[auto_auto_1fr] gap-2">
      {/* Admin Header with Navigation */}
      <div className="border-b border-primary/20 bg-linear-to-r from-primary/10 via-secondary/10 to-accent/10 shadow-sm">
        <div className="container mx-auto p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Header Section */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-linear-to-br from-primary/20 to-secondary/20 p-3 shadow-lg">
                <ShieldCheckIcon className="size-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">{t('admin.adminAreaHeadline')}</h1>
                <p className="text-sm opacity-70">{t('admin.adminAreaSubtitle')}</p>
              </div>
            </div>
            {/* Workspace Indicator */}
            <div className="flex items-center gap-3 rounded-xl bg-base-100/80 px-4 py-2 shadow-md backdrop-blur-sm">
              <div className="rounded-lg bg-primary/10 p-2">
                <BuildingOfficeIcon className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-base-content/60 uppercase">
                  {t('admin.administeringWorkspace')}
                </span>
                <span className="text-sm font-semibold text-base-content">{currentWorkspace?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <nav className="tabs-lift container mx-auto tabs justify-end bg-base-100/80">
        <a className="tab tab-disabled flex-1 cursor-default text-center">
          {/* Placeholder empty tab for filling up the line... */}
        </a>
        <Link
          to="/admin"
          activeProps={{
            className: 'tab  tab-active [--tab-bg:theme(colors.base)] [--tab-color:theme(colors.base-content)]',
          }}
          inactiveProps={{
            className: 'tab hover:bg-base-200/80 transition-colors duration-200',
          }}
          activeOptions={{ exact: true }}
        >
          <BriefcaseIcon className="mr-2 size-4" />
          {t('admin.dashboard')}
        </Link>

        <Link
          to="/admin/users"
          activeProps={{
            className:
              'tab tab-active text-primary-content  hover:text-base-200/80 [--tab-bg:theme(colors.primary)] [--tab-color:theme(colors.primary-content)]',
          }}
          inactiveProps={{
            className: 'tab hover:bg-base-200/80 transition-colors duration-200',
          }}
          activeOptions={{ exact: false }}
        >
          <UsersIcon className="mr-2 size-4" />
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
          <ServerIcon className="mr-2 size-4" />
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
          <CpuIcon className="mr-2 size-4" />
          {t('admin.manageAiModels')}
        </Link>

        <Link
          to="/admin/queues"
          activeProps={{
            className: 'tab tab-active [--tab-bg:theme(colors.accent)] [--tab-color:theme(colors.accent-content)]',
          }}
          inactiveProps={{
            className: 'tab hover:bg-base-200/80 transition-colors duration-200',
          }}
          activeOptions={{ exact: false }}
        >
          <ListViewIcon className="mr-2 size-4" />
          {t('admin.manageQueues')}
        </Link>

        <Link
          to="/admin/connectors"
          activeProps={{
            className: 'tab tab-active [--tab-bg:theme(colors.warning)] [--tab-color:theme(colors.warning-content)]',
          }}
          inactiveProps={{
            className: 'tab hover:bg-base-200/80 transition-colors duration-200',
          }}
          activeOptions={{ exact: false }}
        >
          <LinkIcon className="mr-2 size-4" />
          {t('connectors.title')}
        </Link>
      </nav>

      {/* Main Content Area */}
      <div className="container mx-auto overflow-auto pt-4">
        <Outlet />
      </div>
    </div>
  )
}
