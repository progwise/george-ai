import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { BACKEND_PUBLIC_URL } from '../../../constants'
import { queryKeys } from '../../../query-keys'

const GetFileDownloadUrlParameterSchema = z.object({
  file: z.object({
    fileUri: z.string(),
  }),
})

export const getFileDownloadUrlFn = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof GetFileDownloadUrlParameterSchema>) =>
    GetFileDownloadUrlParameterSchema.parse(data),
  )
  .handler(({ data: { file } }) => {
    const result = `${BACKEND_PUBLIC_URL}/download?fileUri=${encodeURIComponent(file.fileUri)}`
    return result
  })

export const getFileDownloadUrlQueryOptions = (params: z.infer<typeof GetFileDownloadUrlParameterSchema>) =>
  queryOptions({
    queryKey: [queryKeys.FileDownloadUrl, params],
    queryFn: () => getFileDownloadUrlFn({ data: params }),
  })
