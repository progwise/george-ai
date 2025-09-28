import { createFileRoute, redirect } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect } from 'react'
import { z } from 'zod'

import { useAuth } from '../auth/auth'
import { LoadingSpinner } from '../components/loading-spinner'
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
  const { login, isReady } = useAuth()
  const { t } = useTranslation()

  // Automatically trigger login when the component mounts and auth is ready
  useEffect(() => {
    if (isReady) {
      login()
    }
  }, [isReady, login])

  return <LoadingSpinner isLoading={true} message={t('actions.signInToContinue')} />
}
