import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { z } from 'zod'

import { getGoogleAccessToken, getGoogleLoginUrl } from '../../components/data-sources/login-google-server'

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

export const redirectForAccessCode = async (fullPath: string, search: Record<string, string | undefined>) => {
  const redirect_url = window.location.origin + fullPath
  if (!search.code) {
    console.log('start login')
    localStorage.setItem('google_login_progress', '1')
    const newUrl = await getGoogleLoginUrl({
      data: { redirect_url },
    })
    window.location.href = newUrl
  }
}

function RouteComponent() {
  const search = Route.useSearch()
  const fullPath = Route.fullPath

  useEffect(() => {
    if (search.redirectAfterAuth?.length) {
      console.log('setting redirectAfterAuth', search.redirectAfterAuth)
      localStorage.setItem('google_login_redirect_after', search.redirectAfterAuth)
    }
  }, [search.redirectAfterAuth])

  const getAccessToken = useCallback(async () => {
    const redirect_url = window.location.origin + fullPath
    if (search.code) {
      const accessToken = await getGoogleAccessToken({
        data: { access_code: search.code, redirect_url },
      })
      console.log('got access token', accessToken)
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

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4 text-lg font-semibold">Authenticating...</div>
      <button className="btn btn-primary" type="button" onClick={() => redirectForAccessCode(fullPath, search)}>
        Start Google Login
      </button>
    </div>
  )
}
