import { useTranslation } from '../../../i18n/use-translation-hook'

export const UserStats = ({
  stats,
}: {
  stats: { total: number; confirmed: number; unconfirmed: number; activated: number; unactivated: number }
}) => {
  const { t } = useTranslation()
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
      <div className="rounded-box bg-base-200 flex flex-row items-center justify-between border-0 p-2 shadow-sm">
        <div className="text-xs">{t('labels.totalUsers')}</div>
        <div className="text-base font-bold">{stats.total}</div>
      </div>
      <div className="rounded-box bg-base-200 flex flex-row items-center justify-between border-0 p-2 shadow-sm">
        <div className="text-xs">{t('labels.confirmed')}</div>
        <div className="text-success text-base font-bold">{stats.confirmed}</div>
      </div>
      <div className="rounded-box bg-base-200 flex flex-row items-center justify-between border-0 p-2 shadow-sm">
        <div className="text-xs">{t('labels.unconfirmed')}</div>
        <div className="text-warning text-base font-bold">{stats.unconfirmed}</div>
      </div>
      <div className="rounded-box bg-base-200 flex flex-row items-center justify-between border-0 p-2 shadow-sm">
        <div className="text-xs">{t('labels.activated')}</div>
        <div className="text-success text-base font-bold">{stats.activated}</div>
      </div>
      <div className="rounded-box bg-base-200 flex flex-row items-center justify-between border-0 p-2 shadow-sm">
        <div className="text-xs">{t('labels.unactivated')}</div>
        <div className="text-warning text-base font-bold">{stats.unactivated}</div>
      </div>
    </div>
  )
}
