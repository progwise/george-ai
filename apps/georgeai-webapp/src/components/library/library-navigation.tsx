import { Link } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'

export const LibraryNavigation = ({ libraryId }: { libraryId: string }) => {
  const { t } = useTranslation()
  return (
    <div role="tablist" className="tabs-lift tabs">
      <a className="tab tab-disabled flex-1 cursor-default text-center">
        {/* Placeholder empty tab for filling up the line... */}
      </a>
      <Link
        to="/libraries/$libraryId/files"
        params={{ libraryId }}
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
      >
        {t('labels.files')}
      </Link>
      <Link
        to="/libraries/$libraryId/crawlers"
        params={{ libraryId }}
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
      >
        {t('labels.crawlers')}
      </Link>
      <Link
        to="/libraries/$libraryId/query"
        params={{ libraryId }}
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
      >
        {t('labels.query')}
      </Link>
      <Link
        to="/libraries/$libraryId/processing"
        params={{ libraryId }}
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
      >
        {t('labels.processing')}
      </Link>
      <Link
        to="/libraries/$libraryId/settings"
        params={{ libraryId }}
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
      >
        {t('labels.settings')}
      </Link>
      <Link
        to="/libraries/$libraryId/updates"
        params={{ libraryId }}
        className="tab"
        activeOptions={{ exact: false }}
        activeProps={{ className: 'tab-active' }}
        role="tab"
      >
        {t('labels.updates')}
      </Link>
      <a className="tab tab-disabled flex-1 cursor-default text-center">
        {/* Placeholder empty tab for filling up the line... */}
      </a>
    </div>
  )
}
