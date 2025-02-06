import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '../loading-spinner'

interface EmbeddingsTableProps {
  aiLibraryId: string
}

const ClearEmbeddingsDocument = graphql(/* GraphQL */ `
  mutation clearEmbeddings($aiLibraryId: String!) {
    clearEmbeddedFiles(aiLibraryId: $aiLibraryId)
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
  .validator((data) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(ClearEmbeddingsDocument, {
      aiLibraryId: ctx.data,
    })
  })

const dropFile = createServerFn({ method: 'GET' })
  .validator((data) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(DropFileDocument, { id: ctx.data })
  })

const reProcessFile = createServerFn({ method: 'GET' })
  .validator((data) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(ReprocessFileDocument, { id: ctx.data })
  })

const EmbeddingsTableDocument = graphql(`
  query EmbeddingsTable($aiLibraryId: String!) {
    aiLibraryFiles(aiLibraryId: $aiLibraryId) {
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
  .validator(({ aiLibraryId }) => z.string().nonempty().parse(aiLibraryId))
  .handler(async (ctx) => {
    return await backendRequest(EmbeddingsTableDocument, {
      aiLibraryId: ctx.data,
    })
  })

const aiLibraryFilesQueryOptions = (aiLibraryId?: string) => ({
  queryKey: [queryKeys.AiLibraryFiles, aiLibraryId],
  queryFn: async () => {
    if (!aiLibraryId) {
      return null
    } else {
      return getLibraryFiles({ data: { aiLibraryId } })
    }
  },
  enabled: !!aiLibraryId,
})

export const EmbeddingsTable = ({ aiLibraryId }: EmbeddingsTableProps) => {
  const { data, isLoading, refetch } = useSuspenseQuery(
    aiLibraryFilesQueryOptions(aiLibraryId),
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
              await clearEmbeddings({ data: aiLibraryId })
              await refetch()
            }}
          >
            Clear
          </button>
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
