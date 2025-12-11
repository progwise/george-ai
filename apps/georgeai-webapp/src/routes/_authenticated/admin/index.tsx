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
        <div className="from-primary/20 to-primary/10 bg-linear-to-br rounded-full p-3 shadow-lg">
          <BriefcaseIcon className="text-primary h-8 w-8" />
        </div>
        <div>
          <h1 className="text-primary text-3xl font-bold">{t('admin.dashboardTitle')}</h1>
          <p className="text-lg opacity-70">{t('admin.welcomeMessage')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Management Card */}
        <Link to="/admin/users" className="group">
          <div className="card from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 bg-linear-to-br border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
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
          <div className="card from-secondary/10 to-secondary/5 border-secondary/20 hover:border-secondary/40 bg-linear-to-br border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
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

        {/* AI Models Management Card */}
        <Link to="/admin/ai-models" className="group">
          <div className="card from-info/10 to-info/5 border-info/20 hover:border-info/40 bg-linear-to-br border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-info/20 rounded-full p-3">
                      <CpuIcon className="text-info h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="card-title mb-1 text-xl">{t('admin.manageAiModels')}</h3>
                      <div className="badge badge-info badge-outline">Model Management</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('admin.manageAiModelsDescription')}</p>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-sm badge-ghost">Sync Models</div>
                <div className="badge badge-sm badge-ghost">Enable/Disable</div>
                <div className="badge badge-sm badge-ghost">Provider Management</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Queue Management Card */}
        <Link to="/admin/queues" className="group">
          <div className="card from-accent/10 to-accent/5 border-accent/20 hover:border-accent/40 bg-linear-to-br border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-accent/20 rounded-full p-3">
                      <ListViewIcon className="text-accent h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="card-title mb-1 text-xl">{t('admin.manageQueues')}</h3>
                      <div className="badge badge-accent badge-outline">Queue Control</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('admin.manageQueuesDescription')}</p>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-sm badge-ghost">Start/Stop Workers</div>
                <div className="badge badge-sm badge-ghost">Retry Failed Tasks</div>
                <div className="badge badge-sm badge-ghost">Monitor Status</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Connectors Card */}
        <Link to="/admin/connectors" className="group">
          <div className="card from-warning/10 to-warning/5 border-warning/20 hover:border-warning/40 bg-linear-to-br border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="card-body p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-warning/20 rounded-full p-3">
                      <LinkIcon className="text-warning h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="card-title mb-1 text-xl">{t('connectors.title')}</h3>
                      <div className="badge badge-warning badge-outline">External Systems</div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">{t('connectors.description')}</p>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 opacity-60 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="badge badge-sm badge-ghost">Shopware 6</div>
                <div className="badge badge-sm badge-ghost">Test Connection</div>
                <div className="badge badge-sm badge-ghost">Manage Credentials</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
