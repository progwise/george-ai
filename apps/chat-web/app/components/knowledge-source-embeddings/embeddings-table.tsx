import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '../loading-spinner'

interface EmbeddingsTableProps {
  knowledgeSourceId: string
}

const ClearEmbeddingsDocument = graphql(/* GraphQL */ `
  mutation clearEmbeddings($knowledgeSourceId: String!) {
    clearEmbeddedFiles(knowledgeSourceId: $knowledgeSourceId)
  }
`)

const DropFileFocument = graphql(/* GraphQL */ `
  mutation dropFile($id: String!) {
    dropFile(fileId: $id) {
      id
    }
  }
`)

const clearEmbeddings = createServerFn({ method: 'GET' })
  .validator((data) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(ClearEmbeddingsDocument, {
      knowledgeSourceId: ctx.data,
    })
  })

const dropFile = createServerFn({ method: 'GET' })
  .validator((data) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(DropFileFocument, { id: ctx.data })
  })

const EmbeddingsTableDocument = graphql(/* GraphQL */ `
  query EmbeddingsTable($knowledgeSourceId: String!) {
    aiKnowledgeSourceFiles(knowledgeSourceId: $knowledgeSourceId) {
      id
      name
      url
      mimeType
      size
      chunks
    }
  }
`)

const getKnowledgeSourceFiles = createServerFn({ method: 'GET' })
  .validator(({ knowledgeSourceId }) =>
    z.string().nonempty().parse(knowledgeSourceId),
  )
  .handler(async (ctx) => {
    return await backendRequest(EmbeddingsTableDocument, {
      knowledgeSourceId: ctx.data,
    })
  })

const knowledgeFilesQueryOptions = (knowledgeSourceId?: string) => ({
  queryKey: [queryKeys.KnowledgeSourceFiles, knowledgeSourceId],
  queryFn: async () => {
    if (!knowledgeSourceId) {
      return null
    } else {
      return getKnowledgeSourceFiles({ data: { knowledgeSourceId } })
    }
  },
  enabled: !!knowledgeSourceId,
})

export const EmbeddingsTable = ({
  knowledgeSourceId,
}: EmbeddingsTableProps) => {
  const { data, isLoading } = useSuspenseQuery(
    knowledgeFilesQueryOptions(knowledgeSourceId),
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
            onClick={() => clearEmbeddings({ data: knowledgeSourceId })}
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.aiKnowledgeSourceFiles?.map((file, index) => (
            <tr key={file.id}>
              <td>{index + 1}</td>
              <td>{file.id}</td>
              <td>{file.name}</td>
              <td>{file.size}</td>
              <td>{file.chunks}</td>
              <td className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={async () => await dropFile({ data: file.id })}
                >
                  Drop
                </button>
                <button type="button" className="btn btn-xs">
                  Rebuild
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
