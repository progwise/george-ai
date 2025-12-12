import { useTranslation } from '../../../i18n/use-translation-hook'

export const UserStats = ({
  stats,
  statusFilter,
}: {
  stats: { total: number; confirmed: number; unconfirmed: number; activated: number; unactivated: number }
  statusFilter?: string
}) => {
  const { t } = useTranslation()

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
      <div className="flex flex-row items-center justify-between rounded-box border-0 bg-base-200 p-2 shadow-sm">
        <div className="text-xs">{t('labels.totalUsers')}</div>
        <div className="text-base font-bold">
          {stats.total} / {stats.confirmed + stats.unconfirmed}
        </div>
      </div>
      <div
        className={`flex flex-row items-center justify-between rounded-box bg-base-200 p-2 shadow-sm ${
          statusFilter === 'confirmed' ? 'border-2 border-success' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.confirmed')}</div>
        <div className="text-base font-bold text-success">{stats.confirmed}</div>
      </div>
      <div
        className={`flex flex-row items-center justify-between rounded-box bg-base-200 p-2 shadow-sm ${
          statusFilter === 'unconfirmed' ? 'border-2 border-warning' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.unconfirmed')}</div>
        <div className="text-base font-bold text-warning">{stats.unconfirmed}</div>
      </div>
      <div
        className={`flex flex-row items-center justify-between rounded-box bg-base-200 p-2 shadow-sm ${
          statusFilter === 'activated' ? 'border-2 border-success' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.activated')}</div>
        <div className="text-base font-bold text-success">{stats.activated}</div>
      </div>
      <div
        className={`flex flex-row items-center justify-between rounded-box bg-base-200 p-2 shadow-sm ${
          statusFilter === 'unactivated' ? 'border-2 border-warning' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.unactivated')}</div>
        <div className="text-base font-bold text-warning">{stats.unactivated}</div>
      </div>
    </div>
  )
}
