import { useTranslation } from '../../../i18n/use-translation-hook'

export const UserStats = ({
  stats,
  statusFilter,
}: {
  stats: { total: number; confirmed: number; unconfirmed: number; activated: number; unactivated: number }
  statusFilter?: string
}) => {
  const { t } = useTranslation()

  // Calculate total users from global stats (confirmed + unconfirmed)
  const totalUsers = stats.confirmed + stats.unconfirmed

  // Always show "Total Users" for consistency and clarity
  const getTotalLabel = () => {
    return t('labels.totalUsers')
  }

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
      <div className="rounded-box bg-base-200 flex flex-row items-center justify-between border-0 p-2 shadow-sm">
        <div className="text-xs">{getTotalLabel()}</div>
        <div className="text-base font-bold">{totalUsers}</div>
      </div>
      <div
        className={`rounded-box bg-base-200 flex flex-row items-center justify-between p-2 shadow-sm ${
          statusFilter === 'confirmed' ? 'border-success border-2' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.confirmed')}</div>
        <div className="text-success text-base font-bold">{stats.confirmed}</div>
      </div>
      <div
        className={`rounded-box bg-base-200 flex flex-row items-center justify-between p-2 shadow-sm ${
          statusFilter === 'unconfirmed' ? 'border-warning border-2' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.unconfirmed')}</div>
        <div className="text-warning text-base font-bold">{stats.unconfirmed}</div>
      </div>
      <div
        className={`rounded-box bg-base-200 flex flex-row items-center justify-between p-2 shadow-sm ${
          statusFilter === 'activated' ? 'border-success border-2' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.activated')}</div>
        <div className="text-success text-base font-bold">{stats.activated}</div>
      </div>
      <div
        className={`rounded-box bg-base-200 flex flex-row items-center justify-between p-2 shadow-sm ${
          statusFilter === 'unactivated' ? 'border-warning border-2' : 'border-0'
        }`}
      >
        <div className="text-xs">{t('labels.unactivated')}</div>
        <div className="text-warning text-base font-bold">{stats.unactivated}</div>
      </div>
    </div>
  )
}
