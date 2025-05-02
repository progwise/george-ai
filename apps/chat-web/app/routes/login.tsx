import { createFileRoute, redirect } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { useAuth } from '../auth/auth'
import { useTranslation } from '../i18n/use-translation-hook'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: zodValidator(loginSearchSchema),
  beforeLoad: ({ context, search }) => {
    // If the user is already logged in, redirect them to the home page or the page they were trying to access before logging in
    if (context.user) {
      throw redirect({
        to: search.redirect ?? '/',
      })
    }
  },
})

function RouteComponent() {
  const { redirect } = Route.useSearch()
  const { login } = useAuth()
  const { t } = useTranslation()

  let loginText

  switch (true) {
    case redirect?.startsWith('/conversations') && redirect.includes('/confirm-invitation'):
      loginText = t('actions.signInToConfirmInvitation')
      break
    case redirect?.startsWith('/conversations'):
      loginText = t('actions.signInForConversations')
      break
    case redirect?.startsWith('/assistants'):
      loginText = t('actions.signInForAssistants')
      break
    case redirect?.startsWith('/libraries'):
      loginText = t('actions.signInForLibraries')
      break
    case redirect?.startsWith('/profile'):
      loginText = t('actions.signInForProfile')
      break
    default:
      loginText = t('actions.signInToContinue')
      break
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={() => login()}>
      {loginText}
    </button>
  )
}
