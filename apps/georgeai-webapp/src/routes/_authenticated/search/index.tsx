import { createFileRoute } from '@tanstack/react-router'

import { useWorkspace } from '../../../components/workspace'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { SearchIcon } from '../../../icons/search-icon'

const RouteComponent = () => {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()
  const { currentWorkspace } = useWorkspace(user)

  return (
    <div className="flex flex-col items-center pt-24">
      <SearchIcon />
      <h1>{t('Search')}</h1>
      <p>Coming soon™</p>
      {currentWorkspace ? (
        <p>Current Workspace loaded successfully</p>
      ) : (
        <div className="h-6 w-72 skeleton rounded-lg"></div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: RouteComponent,
})
