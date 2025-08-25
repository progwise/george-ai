import { z } from 'zod'

import { GoogleAccessTokenSchema } from '../data-sources/login-google-server'

export const googleDriveResponseSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      size: z.string().optional(),
      iconLink: z.string().optional(),
      mimeType: z.string(),
    }),
  ),
})

export const getHighResIconUrl = (iconLink: string): string => {
  if (!iconLink) return ''

  const listIconPattern = /\/icon_\d+_([^_]+)_list\.png$/
  const resolutionPattern = /\/\d+\//

  if (listIconPattern.test(iconLink)) {
    return iconLink.replace(listIconPattern, '/mediatype/icon_3_$1_x32.png')
  }

  return resolutionPattern.test(iconLink) ? iconLink.replace(resolutionPattern, '/32/') : iconLink
}

export const fetchContentOfOpenGoogleDriveFolder = async (
  queryString: string | null,
  setterCallbackFn: (files: { size: number; iconLink: string; kind: string; id: string; name: string }[]) => void,
) => {
  const rawToken = localStorage.getItem('google_drive_access_token') || '{}'
  const googleDriveAccessToken = GoogleAccessTokenSchema.parse(JSON.parse(rawToken))
  if (queryString === null) {
    return null
  }
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?fields=files(id,kind,name,size,iconLink,mimeType)&q=${queryString}`,
    {
      headers: { Authorization: `Bearer ${googleDriveAccessToken.access_token}` },
    },
  )
  if (!response.ok) throw new Error('Network error')
  const responseJson = googleDriveResponseSchema.parse(await response.json())
  const files = responseJson.files.map(({ mimeType, ...file }) => ({
    ...file,
    size: file.size ? parseInt(file.size) : 0,
    iconLink: getHighResIconUrl(file.iconLink ?? ''),
    kind: mimeType,
  }))
  setterCallbackFn(files)

  return files
}
