import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { getGoogleAccessToken, getGoogleLoginUrl } from '../../components/data-sources/login-google-server'
import { useTranslation } from '../../i18n/use-translation-hook'

export const authGoogleSearchSchema = z.object({
  redirectAfterAuth: z.string().optional(),
  code: z.string().optional(),
  scope: z.string().optional(),
  authUser: z.string().optional(),
  hd: z.string().optional(),
  prompt: z.string().optional(),
})

export const Route = createFileRoute('/libraries/auth-google')({
  component: RouteComponent,
  validateSearch: (search) => authGoogleSearchSchema.parse(search),
})

const useRedirectUrl = (fullPath: string, search: Record<string, string | undefined>) => {
  return useQuery<string | null>({
    queryKey: ['redirectUrl', fullPath, search],
    queryFn: async (): Promise<string | null> => {
      localStorage.setItem('google_login_progress', '1')
      const redirect_url = window.location.origin + fullPath
      return await getGoogleLoginUrl({ data: { redirect_url } })
    },
    enabled: !search.code,
    staleTime: Infinity,
  })
}

function RouteComponent() {
  const auth = useAuth()
  const search = Route.useSearch()
  const fullPath = Route.fullPath
  const { t } = useTranslation()
  const { data: redirectUrl } = useRedirectUrl(fullPath, search)

  useEffect(() => {
    if (search.redirectAfterAuth?.length) {
      console.log('Setting redirectAfterAuth:', search.redirectAfterAuth)
      localStorage.setItem('google_login_redirect_after', search.redirectAfterAuth)
    }
  }, [search.redirectAfterAuth])

  const getAccessToken = useCallback(async () => {
    const redirect_url = window.location.origin + fullPath
    if (search.code) {
      const accessToken = await getGoogleAccessToken({
        data: { access_code: search.code, redirect_url },
      })
      console.log('Got access token', accessToken)
      localStorage.setItem('google_drive_access_token', JSON.stringify(accessToken))
      localStorage.setItem('google_drive_dialog_open', 'true')
      localStorage.removeItem('google_login_progress')
      window.location.href = localStorage.getItem('google_login_redirect_after') || '/'
    } else {
      console.error('No access code found in the URL')
    }
  }, [search.code, fullPath])

  useEffect(() => {
    if (search.code) {
      getAccessToken()
    }
  }, [search.code, getAccessToken])

  const handleStartLogin = useCallback(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl
    }
  }, [redirectUrl])

  const isLoggedIn = !!auth?.user

  if (!isLoggedIn) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => auth?.login()}>
        {t('auth.signInForGoogleAuth')}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4 text-lg font-semibold">Authenticating...</div>
      <button className="btn btn-primary" type="button" onClick={handleStartLogin} disabled={!redirectUrl}>
        {redirectUrl ? 'Start Google Login' : 'Loading...'}
      </button>
    </div>
  )
}
