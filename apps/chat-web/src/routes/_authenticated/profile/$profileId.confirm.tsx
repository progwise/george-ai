import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { LoadingSpinner } from '../../../components/loading-spinner'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { confirmUserProfile } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/profile/$profileId/confirm')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { profileId } = params
    return await confirmUserProfile({ data: { profileId } })
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (data) {
    setTimeout(() => navigate({ to: '/profile' }), 300)
    return (
      <div
        className="alert alert-success mx-auto max-w-fit cursor-pointer py-2 text-sm"
        onClick={() => navigate({ to: '/profile' })}
      >
        {t('texts.profileConfirmed')}. {t('actions.redirecting')}
      </div>
    )
  }
  return <LoadingSpinner message="Confirming your profile..." isLoading={true} />
}
