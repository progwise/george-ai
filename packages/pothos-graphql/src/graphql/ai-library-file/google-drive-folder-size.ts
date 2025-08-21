import { z } from 'zod'

const folderSizeResponseSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      size: z.string().optional(),
      mimeType: z.string(),
    }),
  ),
})

export const fetchFolderSizeRecursively = async (folderId: string, accessToken: string) => {
  let size = 0
  const folderSizeArr: { id: string; size: number; isAdded: boolean }[] = []
  let fileQuery: string
  if (folderId === null) {
    return []
  } else {
    fileQuery = encodeURIComponent("'" + folderId + "'" + ' in parents')
  }
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?fields=files(id,name,size,mimeType)&q=${fileQuery}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  if (!response.ok) throw new Error('Network error')
  const responseJson = folderSizeResponseSchema.parse(await response.json())

  const content = responseJson.files.map(({ id, size, mimeType }) => ({
    id,
    size: size ? parseInt(size) : 0,
    kind: mimeType,
  }))

  // adds the size of each file within the current folder to its size
  const files = content?.filter((f) => f.kind !== 'application/vnd.google-apps.folder')
  files?.forEach((f) => {
    size += f.size
  })

  // does a recursive function call for each subfolder
  const folders = content?.filter((file) => file.kind === 'application/vnd.google-apps.folder')
  const resultsFromSubfolders: { id: string; size: number; isAdded: boolean }[][] = await Promise.all(
    folders.map((folder) => fetchFolderSizeRecursively(folder.id, accessToken)),
  )

  // adds the size of each subfolder, which was not added to the size of the direct parent folder yet and adds the folder to the array with all subfolders
  resultsFromSubfolders.forEach((subfolder) => {
    subfolder.forEach((subfolder) => {
      if (!subfolder.isAdded) {
        size += subfolder.size
      }
      folderSizeArr.push({ id: subfolder.id, size: subfolder.size, isAdded: true })
    })
  })

  // adds the current folder with its overall size and marked as not added to the direct parent folder yet to the array wich contains all subfolders
  folderSizeArr.push({ id: folderId, size: size, isAdded: false })

  return folderSizeArr
}
