import { z } from 'zod'

export const GoogleAccessTokenSchema = z.object({
  access_token: z.string().optional(),
  token_type: z.enum(['Bearer']).optional(),
  error: z.string().optional(),
  expires_in: z.number().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
})

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

export type GoogleDriveFile = z.infer<typeof googleDriveResponseSchema>

export const getHighResIconUrl = (iconLink: string): string => {
  if (!iconLink) return ''

  const listIconPattern = /\/icon_\d+_([^_]+)_list\.png$/
  const resolutionPattern = /\/\d+\//

  if (listIconPattern.test(iconLink)) {
    return iconLink.replace(listIconPattern, '/mediatype/icon_3_$1_x32.png')
  }

  return resolutionPattern.test(iconLink) ? iconLink.replace(resolutionPattern, '/32/') : iconLink
}

export const selectRecursively = async (folderId: string, accessToken: string) => {
  const checkedFiles: { id: string; name: string; kind: string; size: string; iconLink: string }[] = []
  let queryString: string
  if (folderId) {
    queryString = encodeURIComponent("'" + folderId + "'" + ' in parents')
  } else {
    return []
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?fields=files(id,kind,name,size,iconLink,mimeType)&q=${queryString}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  const responseJson = await response.json()
  if (!response.ok) throw new Error('Network error')
  const googleDriveResponse = googleDriveResponseSchema.parse(responseJson)
  const folderContent = googleDriveResponse.files.map(({ mimeType, ...file }) => ({
    ...file,
    size: file.size ? file.size : '0',
    iconLink: getHighResIconUrl(file.iconLink ?? ''),
    kind: mimeType,
  }))

  const files = folderContent?.filter((file) => file.kind !== 'application/vnd.google-apps.folder')
  checkedFiles.push(...files)
  const subfolders = folderContent?.filter((file) => file.kind === 'application/vnd.google-apps.folder')
  const fileArraysFromSubfolders = await Promise.all(
    subfolders.map((folder) => selectRecursively(folder.id, accessToken)),
  )
  fileArraysFromSubfolders.forEach((fileArray) => checkedFiles.push(...fileArray))

  return checkedFiles
}
