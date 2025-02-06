import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useCallback, useEffect } from 'react'
import {
  getGoogleAccessToken,
  getGoogleLoginUrl,
} from '../../components/data-sources/login-google-server'

export const authGoogleSearchSchema = z.object({
  redirectAfterAuth: z.string().optional(),
  code: z.string().optional(),
  scope: z.string().optional(),
  authUser: z.string().optional(),
  hd: z.string().optional(),
  prompt: z.string().optional(),
})

export const Route = createFileRoute('/library/auth-google')({
  component: RouteComponent,
  validateSearch: (search) => authGoogleSearchSchema.parse(search),
})

/*
http://localhost:3001/library/auth-google?
//  code=4%2F0ASVgi3LXMRCIw1mCkazRoaS9F09HK6FVvbUYyk6lzVZnM6GosksduxFcq7OA3XjniLytZg
// &scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email
// &authuser=0
// &hd=progwise.net
// &prompt=consent
*/

function RouteComponent() {
  const search = Route.useSearch()
  const fullPath = Route.fullPath

  useEffect(() => {
    if (search.redirectAfterAuth?.length) {
      console.log('setting redirectAfterAuth', search.redirectAfterAuth)
      localStorage.setItem(
        'google_login_redirect_after',
        search.redirectAfterAuth,
      )
    }
  }, [search.redirectAfterAuth])

  const redirectForAccessCode = async () => {
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

  const getAccessToken = useCallback(async () => {
    const redirect_url = window.location.origin + fullPath
    const accessToken = await getGoogleAccessToken({
      data: { access_code: search.code, redirect_url },
    })
    console.log('got access token', accessToken)
    localStorage.setItem(
      'google_drive_access_token',
      JSON.stringify(accessToken),
    )
    localStorage.removeItem('google_login_progress')
    window.location.href =
      localStorage.getItem('google_login_redirect_after') || '/'
  }, [search.code, fullPath])

  return (
    <div>
      ...Authenticating
      <button
        className="btn"
        type="button"
        onClick={() => redirectForAccessCode()}
      >
        Step 1
      </button>
      <button
        className="btn"
        type="button"
        onClick={async () => await getAccessToken()}
      >
        Step 2
      </button>
    </div>
  )
}
