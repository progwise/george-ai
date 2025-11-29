import { useTranslation } from '../../../../i18n/use-translation-hook'

export const ShopwareHelp = () => {
  const { t } = useTranslation()

  return (
    <div className="card card-sm bg-base-200">
      <div className="card-body p-3">
        <h3 className="card-title text-sm">{t('crawlers.shopwareAssociationsTitle')}</h3>
        <div className="max-h-64 overflow-y-auto text-xs">
          <p className="mb-2 opacity-75">{t('crawlers.shopwareAssociationsDescription')}</p>
          <ul className="space-y-1">
            <li>
              <code className="bg-base-300 rounded px-1">manufacturer</code> -{' '}
              {t('crawlers.shopwareAssociations.manufacturer')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">categories</code> -{' '}
              {t('crawlers.shopwareAssociations.categories')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">cover.media</code> -{' '}
              {t('crawlers.shopwareAssociations.coverMedia')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">media.media</code> -{' '}
              {t('crawlers.shopwareAssociations.mediaMedia')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">properties.group</code> -{' '}
              {t('crawlers.shopwareAssociations.propertiesGroup')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">unit</code> - {t('crawlers.shopwareAssociations.unit')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">tax</code> - {t('crawlers.shopwareAssociations.tax')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">deliveryTime</code> -{' '}
              {t('crawlers.shopwareAssociations.deliveryTime')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">prices</code> - {t('crawlers.shopwareAssociations.prices')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">options</code> - {t('crawlers.shopwareAssociations.options')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">configuratorSettings</code> -{' '}
              {t('crawlers.shopwareAssociations.configuratorSettings')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">crossSellings</code> -{' '}
              {t('crawlers.shopwareAssociations.crossSellings')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">seoUrls</code> - {t('crawlers.shopwareAssociations.seoUrls')}
            </li>
            <li>
              <code className="bg-base-300 rounded px-1">tags</code> - {t('crawlers.shopwareAssociations.tags')}
            </li>
          </ul>
          <p className="mt-2 opacity-50">{t('crawlers.shopwareAssociationsHint')}</p>
        </div>
      </div>
    </div>
  )
}
