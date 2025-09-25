import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET } from '../../constants'

export const getGoogleLoginUrl = createServerFn({
  method: 'GET',
})
  .inputValidator(({ redirect_url }: { redirect_url: string }) => {
    return {
      redirect_url: z.string().nonempty().parse(redirect_url),
    }
  })
  .handler(({ data }) => {
    const scopes = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.readonly']
    const encodedScopes = scopes.map((scope) => encodeURIComponent(scope)).join('%20')
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_DRIVE_CLIENT_ID}&redirect_uri=${data.redirect_url}&response_type=code&scope=${encodedScopes}`
  })

export const GoogleAccessTokenSchema = z.object({
  access_token: z.string().optional(),
  token_type: z.enum(['Bearer']).optional(),
  error: z.string().optional(),
  expires_in: z.number().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
})

export type GoogleAccessToken = z.infer<typeof GoogleAccessTokenSchema>

export const getGoogleAccessToken = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { access_code?: string; redirect_url?: string }) => {
    return z
      .object({
        access_code: z.string().nonempty(),
        redirect_url: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async ({ data }) => {
    const params = `?client_id=${GOOGLE_DRIVE_CLIENT_ID}&client_secret=${GOOGLE_DRIVE_CLIENT_SECRET}&code=${data.access_code}&grant_type=authorization_code&redirect_uri=${data.redirect_url}`
    console.log('getGoogleAccessToken params', params)
    const tokenData = await fetch(`https://oauth2.googleapis.com/token${params}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })

    const json = await tokenData.json()
    if (!tokenData.ok) {
      console.error('error getting access token', json)
      return { error: tokenData.statusText, details: json }
    }
    console.log('Token received', json)
    const token = GoogleAccessTokenSchema.parse(json)

    return token
  })

export const getGoogleUserData = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) =>
    z
      .object({
        access_token: z.string().nonempty(),
        token_type: z.enum(['BEARER', 'Bearer']),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user_data = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `${data.token_type} ${data.access_token}`,
      },
    })
      .then((res) => res.json())
      .catch((error) => {
        console.error('error getting user data', error)
      })
    console.log('received user data', user_data)
    return user_data
  })

export const validateGoogleAccessToken = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { access_token: string }) => {
    return z
      .object({
        access_token: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async ({ data }) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + data.access_token)
    if (!response.ok) {
      console.error('Invalid token', await response.json())
      return { valid: false }
    }
    return { valid: true }
  })
