import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { z } from 'zod'

import {
  getGoogleAccessToken,
  getGoogleLoginUrl,
  validateGoogleAccessToken,
} from '../../../components/data-sources/login-google-server'

export const authGoogleSearchSchema = z.object({
  redirectAfterAuth: z.string().optional(),
  code: z.string().optional(),
  scope: z.string().optional(),
  authUser: z.string().optional(),
  hd: z.string().optional(),
  prompt: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/libraries/auth-google')({
  component: RouteComponent,
  validateSearch: (search) => authGoogleSearchSchema.parse(search),
})

function RouteComponent() {
  const search = Route.useSearch()
  const fullPath = Route.fullPath
  const { data: redirectUrlQuery } = useQuery<string | null>({
    queryKey: ['redirectUrl', fullPath, search],
    queryFn: async (): Promise<string | null> => {
      localStorage.setItem('google_login_progress', '1')
      const redirect_url = window.location.origin + fullPath
      return await getGoogleLoginUrl({ data: { redirect_url } })
    },
    enabled: !search.code,
    staleTime: Infinity,
  })

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
    if (redirectUrlQuery) {
      window.location.href = redirectUrlQuery
    }
  }, [redirectUrlQuery])

  useEffect(() => {
    const validateToken = async () => {
      const tokenString = localStorage.getItem('google_drive_access_token')
      if (tokenString) {
        const token = JSON.parse(tokenString)
        const isValid = await validateGoogleAccessToken({ data: { access_token: token.access_token } })
        if (!isValid.valid) {
          console.log('Token is invalid or expired. Logging out.')
          localStorage.removeItem('google_drive_access_token')
          localStorage.removeItem('google_login_redirect_after')
          localStorage.removeItem('google_drive_dialog_open')
        }
      }
    }

    validateToken()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="text-lg font-semibold">Authenticating...</div>
      <button className="btn btn-primary btn-sm" type="button" onClick={handleStartLogin} disabled={!redirectUrlQuery}>
        {redirectUrlQuery ? 'Start Google Login' : 'Loading...'}
      </button>
    </div>
  )
}
