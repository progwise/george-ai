import { useTranslation } from '../../../../i18n/use-translation-hook'

export const CustomApiHelp = () => {
  const { t } = useTranslation()

  return (
    <div className="card bg-base-200 card-sm">
      <div className="card-body p-3">
        <h3 className="card-title text-sm">{t('crawlers.customApiHelpTitle')}</h3>
        <div className="max-h-64 overflow-y-auto text-xs">
          <p className="mb-2 opacity-75">{t('crawlers.customApiHelpDescription')}</p>
          <ul className="space-y-1">
            <li>
              <code className="rounded-sm bg-base-300 px-1">baseUrl</code> - {t('crawlers.customApiHelp.baseUrl')}
            </li>
            <li>
              <code className="rounded-sm bg-base-300 px-1">endpoint</code> - {t('crawlers.customApiHelp.endpoint')}
            </li>
            <li>
              <code className="rounded-sm bg-base-300 px-1">authType</code> - {t('crawlers.customApiHelp.authType')}
            </li>
            <li>
              <code className="rounded-sm bg-base-300 px-1">authConfig</code> - {t('crawlers.customApiHelp.authConfig')}
            </li>
            <li>
              <code className="rounded-sm bg-base-300 px-1">providerConfig.identifierField</code> -{' '}
              {t('crawlers.customApiHelp.identifierField')}
            </li>
            <li>
              <code className="rounded-sm bg-base-300 px-1">providerConfig.titleField</code> -{' '}
              {t('crawlers.customApiHelp.titleField')}
            </li>
          </ul>
          <p className="mt-2 opacity-50">{t('crawlers.customApiHelpHint')}</p>
        </div>
      </div>
    </div>
  )
}
