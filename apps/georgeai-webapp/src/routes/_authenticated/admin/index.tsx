import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { ArrowRight } from '../../../icons/arrow-right'
import { BriefcaseIcon } from '../../../icons/briefcase-icon'
import { CpuIcon } from '../../../icons/cpu-icon'
import { LinkIcon } from '../../../icons/link-icon'
import { ListViewIcon } from '../../../icons/list-view-icon'
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
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-linear-to-br from-primary/20 to-primary/10 p-3 shadow-lg">
          <BriefcaseIcon className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('admin.dashboardTitle')}</h1>
          <p className="text-lg opacity-70">{t('admin.welcomeMessage')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Management Card */}
        <Link to="/admin/users" className="group">
          <div className="card border border-primary/20 bg-linear-to-br from-primary/10 to-primary/5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-full bg-primary/20 p-3">
                      <UsersIcon className="size-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 card-title text-xl">{t('admin.manageUsers')}</h3>
                      <div className="badge badge-outline badge-primary">User Management</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('admin.manageUsersDescription')}</p>
                </div>
                <ArrowRight className="size-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-ghost badge-sm">View Users</div>
                <div className="badge badge-ghost badge-sm">Edit Profiles</div>
                <div className="badge badge-ghost badge-sm">Activate Accounts</div>
              </div>
            </div>
          </div>
        </Link>

        {/* AI Services Monitoring Card */}
        <Link to="/admin/ai-services" className="group">
          <div className="card border border-secondary/20 bg-linear-to-br from-secondary/10 to-secondary/5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-secondary/40 hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-full bg-secondary/20 p-3">
                      <ServerIcon className="size-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="mb-1 card-title text-xl">{t('admin.monitorAiServices')}</h3>
                      <div className="badge badge-outline badge-secondary">System Monitoring</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('admin.monitorAiServicesDescription')}</p>
                </div>
                <ArrowRight className="size-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-ghost badge-sm">GPU Memory</div>
                <div className="badge badge-ghost badge-sm">Model Status</div>
                <div className="badge badge-ghost badge-sm">Load Balancing</div>
              </div>
            </div>
          </div>
        </Link>

        {/* AI Models Management Card */}
        <Link to="/admin/ai-models" className="group">
          <div className="card border border-info/20 bg-linear-to-br from-info/10 to-info/5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-info/40 hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-full bg-info/20 p-3">
                      <CpuIcon className="size-8 text-info" />
                    </div>
                    <div>
                      <h3 className="mb-1 card-title text-xl">{t('admin.manageAiModels')}</h3>
                      <div className="badge badge-outline badge-info">Model Management</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('admin.manageAiModelsDescription')}</p>
                </div>
                <ArrowRight className="size-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-ghost badge-sm">Sync Models</div>
                <div className="badge badge-ghost badge-sm">Enable/Disable</div>
                <div className="badge badge-ghost badge-sm">Provider Management</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Queue Management Card */}
        <Link to="/admin/queues" className="group">
          <div className="card border border-accent/20 bg-linear-to-br from-accent/10 to-accent/5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-accent/40 hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-full bg-accent/20 p-3">
                      <ListViewIcon className="size-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="mb-1 card-title text-xl">{t('admin.manageQueues')}</h3>
                      <div className="badge badge-outline badge-accent">Queue Control</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('admin.manageQueuesDescription')}</p>
                </div>
                <ArrowRight className="size-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-ghost badge-sm">Start/Stop Workers</div>
                <div className="badge badge-ghost badge-sm">Retry Failed Tasks</div>
                <div className="badge badge-ghost badge-sm">Monitor Status</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Connectors Card */}
        <Link to="/admin/connectors" className="group">
          <div className="card border border-warning/20 bg-linear-to-br from-warning/10 to-warning/5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-warning/40 hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-full bg-warning/20 p-3">
                      <LinkIcon className="size-8 text-warning" />
                    </div>
                    <div>
                      <h3 className="mb-1 card-title text-xl">{t('connectors.title')}</h3>
                      <div className="badge badge-outline badge-warning">External Systems</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('connectors.description')}</p>
                </div>
                <ArrowRight className="size-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-ghost badge-sm">Shopware 6</div>
                <div className="badge badge-ghost badge-sm">Test Connection</div>
                <div className="badge badge-ghost badge-sm">Manage Credentials</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
