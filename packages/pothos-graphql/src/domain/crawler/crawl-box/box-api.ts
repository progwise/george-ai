import { BoxFolderItemsResponse } from './common'

const BOX_API_BASE_URL = 'https://api.box.com/2.0'

async function fetchBoxApi(endpoint: string, accessToken: string): Promise<Response> {
  const response = await fetch(`${BOX_API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Box API authentication failed - token may be expired')
    }
    if (response.status === 429) {
      throw new Error('Box API rate limit exceeded - please try again later')
    }
    throw new Error(`Box API error: ${response.status} ${response.statusText}`)
  }

  return response
}

export async function listFolderItems(
  folderId: string,
  accessToken: string,
  offset = 0,
): Promise<BoxFolderItemsResponse> {
  const fields = 'type,id,name,size,modified_at,content_modified_at'
  const limit = 1000 // Box API max limit per request
  const response = await fetchBoxApi(
    `/folders/${folderId}/items?fields=${fields}&limit=${limit}&offset=${offset}`,
    accessToken,
  )

  return response.json()
}

export async function downloadBoxFile(fileId: string, accessToken: string): Promise<Buffer> {
  const response = await fetch(`${BOX_API_BASE_URL}/files/${fileId}/content`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    redirect: 'follow', // Box API returns 302 redirect to actual download URL
  })

  if (!response.ok) {
    throw new Error(`Box file download error: ${response.status} ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
