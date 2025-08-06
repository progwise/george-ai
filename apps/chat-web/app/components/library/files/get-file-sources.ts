import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

import { KEYCLOAK_TOKEN_COOKIE_NAME } from '../../../auth/auth'
import { BACKEND_PUBLIC_URL, BACKEND_URL } from '../../../constants'

const getFileSources = createServerFn({ method: 'GET' })
  .validator((data: { fileId: string; libraryId: string }) =>
    z
      .object({
        fileId: z.string().nonempty(),
        libraryId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const jwtToken = getCookie?.(KEYCLOAK_TOKEN_COOKIE_NAME)
    if (!jwtToken) {
      throw new Error('No JWT Token')
    }
    const response = await fetch(BACKEND_URL + `/library-files/${data.libraryId}/${data.fileId}`, {
      method: 'GET',
      headers: {
        'x-user-jwt': jwtToken,
      },
    })
    if (!response.ok) {
      const responseText = await response.text()
      throw new Error(responseText)
    }
    const fileNames = (await response.json()) as string[]
    return fileNames.map((fileName) => ({
      fileName,
      link: BACKEND_PUBLIC_URL + `/library-files/${data.libraryId}/${data.fileId}?filename=${fileName}`,
    }))
  })

export const getFileSourcesQueryOptions = (params: { fileId: string; libraryId: string }) => ({
  queryKey: ['fileSources', params],
  queryFn: () => getFileSources({ data: { fileId: params.fileId, libraryId: params.libraryId } }),
})
