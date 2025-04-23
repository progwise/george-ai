import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'

import { toastSuccess } from '../../components/georgeToaster'
import { LoadingSpinner } from '../../components/loading-spinner'
import { useTranslation } from '../../i18n/use-translation-hook'
import { confirmUserProfile } from '../../server-functions/users'

export const Route = createFileRoute('/profile/$profileId/confirm')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { profileId } = params
    return await confirmUserProfile({ data: { profileId } })
  },
})

function RouteComponent() {
  const data = useLoaderData({ strict: false })
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (data) {
    toastSuccess(t('texts.profileConfirmed'))
    navigate({ to: '/profile' })
  }
  return <LoadingSpinner message="Confirming your profile..." isLoading={true} />
}
