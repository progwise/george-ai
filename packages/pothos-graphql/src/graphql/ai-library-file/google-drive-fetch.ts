import { z } from 'zod'

const responseSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      mimeType: z.string(),
    }),
  ),
})

export const selectRecursively = async (folderId: string, accessToken: string) => {
  const checkedFiles: { id: string; name: string; kind: string }[] = []
  let queryString: string
  if (folderId) {
    queryString = encodeURIComponent("'" + folderId + "'" + ' in parents')
  } else {
    return []
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?fields=files(id,kind,name,mimeType)&q=${queryString}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  const responseJson = await response.json()
  if (!response.ok) throw new Error('Network error')
  const googleDriveResponse = responseSchema.parse(responseJson)
  const folderContent = googleDriveResponse.files.map(({ mimeType, ...file }) => ({
    ...file,
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
