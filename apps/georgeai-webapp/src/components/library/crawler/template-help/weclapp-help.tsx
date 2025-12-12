import { useTranslation } from '../../../../i18n/use-translation-hook'

export const WeclappHelp = () => {
  const { t } = useTranslation()

  return (
    <div className="card bg-base-200 card-sm">
      <div className="card-body p-3">
        <h3 className="card-title text-sm">{t('crawlers.weclappHelpTitle')}</h3>
        <div className="max-h-64 overflow-y-auto text-xs">
          <p className="mb-2 opacity-75">{t('crawlers.weclappHelpDescription')}</p>
          <ul className="space-y-1">
            <li>
              <code className="rounded-sm bg-base-300 px-1">baseUrl</code> - {t('crawlers.weclappHelp.baseUrl')}
            </li>
            <li>
              <code className="rounded-sm bg-base-300 px-1">endpoint</code> - {t('crawlers.weclappHelp.endpoint')}
            </li>
            <li>
              <code className="rounded-sm bg-base-300 px-1">authConfig.token</code> - {t('crawlers.weclappHelp.token')}
            </li>
          </ul>
          <p className="mt-2 opacity-50">{t('crawlers.weclappHelpHint')}</p>
        </div>
      </div>
    </div>
  )
}
