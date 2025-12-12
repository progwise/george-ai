import { createFileRoute, redirect } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { useAuth } from '../auth/auth'
import { useTranslation } from '../i18n/use-translation-hook'
import { BowlerLogoIcon } from '../icons/bowler-logo-icon'

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

  const handleLogin = () => {
    if (isReady) {
      login()
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-base-100 pt-32">
      <div className="max-w-md space-y-8 p-8 text-center">
        <div className="mx-auto flex flex-col items-center">
          <BowlerLogoIcon className="size-32" gradientColors={['#1d4ed8', '#d946ef']} />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-base-content">George-AI</h1>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          disabled={!isReady}
          className="btn btn-wide border-0 bg-linear-to-r from-primary to-secondary text-white transition duration-500 btn-lg hover:from-secondary hover:to-primary"
        >
          {t('welcome.signIn')}
        </button>
      </div>
    </div>
  )
}
