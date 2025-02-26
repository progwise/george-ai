import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '../loading-spinner'
import { DesktopFileUpload } from './desktop-file-upload'

interface EmbeddingsTableProps {
  libraryId: string
}

const ClearEmbeddingsDocument = graphql(/* GraphQL */ `
  mutation clearEmbeddings($libraryId: String!) {
    clearEmbeddedFiles(libraryId: $libraryId)
  }
`)

const DropFileDocument = graphql(/* GraphQL */ `
  mutation dropFile($id: String!) {
    dropFile(fileId: $id) {
      id
    }
  }
`)

const ReprocessFileDocument = graphql(/* GraphQL */ `
  mutation reProcessFile($id: String!) {
    processFile(fileId: $id) {
      id
      chunks
      size
      uploadedAt
      processedAt
    }
  }
`)

const clearEmbeddings = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(ClearEmbeddingsDocument, {
      libraryId: ctx.data,
    })
  })

const dropFile = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(DropFileDocument, { id: ctx.data })
  })

const reProcessFile = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(ReprocessFileDocument, { id: ctx.data })
  })

const EmbeddingsTableDocument = graphql(`
  query EmbeddingsTable($libraryId: String!) {
    aiLibraryFiles(libraryId: $libraryId) {
      id
      name
      originUri
      mimeType
      size
      chunks
      uploadedAt
      processedAt
    }
  }
`)

const getLibraryFiles = createServerFn({ method: 'GET' })
  .validator(({ libraryId }: { libraryId: string }) =>
    z.string().nonempty().parse(libraryId),
  )
  .handler(async (ctx) => {
    return await backendRequest(EmbeddingsTableDocument, {
      libraryId: ctx.data,
    })
  })

const aiLibraryFilesQueryOptions = (libraryId?: string) => ({
  queryKey: [queryKeys.AiLibraryFiles, libraryId],
  queryFn: async () => {
    if (!libraryId) {
      return null
    } else {
      return getLibraryFiles({ data: { libraryId } })
    }
  },
  enabled: !!libraryId,
})

export const EmbeddingsTable = ({ libraryId }: EmbeddingsTableProps) => {
  const { data, isLoading, refetch } = useSuspenseQuery(
    aiLibraryFilesQueryOptions(libraryId),
  )

  if (isLoading) {
    return <LoadingSpinner />
  }
  return (
    <>
      <nav className="flex gap-4 justify-between items-center">
        <div className="flex gap-4">
          <button
            type="button"
            className="btn btn-xs"
            onClick={async () => {
              await clearEmbeddings({ data: libraryId })
              await refetch()
            }}
          >
            Clear
          </button>
          <DesktopFileUpload libraryId={libraryId} />
        </div>
      </nav>
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Name</th>
            <th>#Size</th>
            <th>#Chunks</th>
            <th>Processed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.aiLibraryFiles?.map((file, index) => (
            <tr key={file.id}>
              <td>{index + 1}</td>
              <td>{file.id}</td>
              <td>{file.name}</td>
              <td>{file.size}</td>
              <td>{file.chunks}</td>
              <td>{file.processedAt}</td>
              <td className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={async () => {
                    await dropFile({ data: file.id })
                    await refetch()
                  }}
                >
                  Drop
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={async () => {
                    await reProcessFile({ data: file.id })
                    await refetch()
                  }}
                >
                  Re-Process
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
