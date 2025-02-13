import { z } from 'zod'
import { graphql } from '../../gql'
import { backendRequest } from '../../server-functions/backend'
import { createServerFn } from '@tanstack/start'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { queryKeys } from '../../query-keys'
import { LoadingSpinner } from '../loading-spinner'

const AssistantLibrariesDocument = graphql(/* GraphQL */ `
  query assistantLibraries($assistantId: String!, $ownerId: String!) {
    aiLibraryUsage(assistantId: $assistantId) {
      id
      libraryId
    }
    aiLibraries(ownerId: $ownerId) {
      id
      name
    }
  }
`)

const getAssistantLibraries = createServerFn({ method: 'GET' })
  .validator(
    ({ assistantId, ownerId }: { assistantId: string; ownerId: string }) => ({
      assistantId: z.string().nonempty().parse(assistantId),
      ownerId: z.string().nonempty().parse(ownerId),
    }),
  )
  .handler(
    async (ctx) => await backendRequest(AssistantLibrariesDocument, ctx.data),
  )

const UpdateLibraryUsageDocument = graphql(/* GraphQL */ `
  mutation updateLibraryUsage(
    $assistantId: String!
    $libraryId: String!
    $use: Boolean!
  ) {
    updateLibraryUsage(
      data: { assistantId: $assistantId, libraryId: $libraryId, use: $use }
    ) {
      usageId
      deletedCount
    }
  }
`)

const updateLibraryUsage = createServerFn({ method: 'POST' })
  .validator(
    ({
      assistantId,
      libraryId,
      use,
    }: {
      assistantId: string
      libraryId: string
      use: boolean
    }) => ({
      assistantId: z.string().nonempty().parse(assistantId),
      libraryId: z.string().nonempty().parse(libraryId),
      use: z.boolean().parse(use),
    }),
  )
  .handler(
    async (ctx) => await backendRequest(UpdateLibraryUsageDocument, ctx.data),
  )

const assistantLibrariesQueryOptions = (
  assistantId: string,
  ownerId: string,
) => ({
  queryKey: [queryKeys.AiAssistantLibraries, assistantId, ownerId],
  queryFn: async () => {
    return getAssistantLibraries({ data: { assistantId, ownerId } })
  },
  enabled: !!assistantId,
})

export interface AssistantLibrariesProps {
  assistantId: string
  ownerId: string
}

export const AssistantLibraries = ({
  assistantId,
  ownerId,
}: AssistantLibrariesProps) => {
  const { data, isLoading, refetch } = useSuspenseQuery(
    assistantLibrariesQueryOptions(assistantId, ownerId),
  )

  const { mutate: updateUsage, isPending: updateUsageIsPending } = useMutation({
    mutationFn: (data: {
      assistantId: string
      libraryId: string
      use: boolean
    }) => updateLibraryUsage({ data }),
    onSettled: () => refetch(),
  })

  return (
    <>
      <LoadingSpinner
        isLoading={
          isLoading ||
          !data ||
          !data.aiLibraries ||
          !data.aiLibraryUsage ||
          updateUsageIsPending
        }
      />
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Library</th>
          </tr>
        </thead>
        <tbody>
          {data?.aiLibraries?.map((library, index) => (
            <tr key={library.id}>
              <td>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={async (event) => {
                      updateUsage({
                        assistantId,
                        libraryId: library.id,
                        use: event.target.checked,
                      })
                    }}
                    name="selectedFiles"
                    checked={data.aiLibraryUsage?.some(
                      (usage) => usage.libraryId === library.id,
                    )}
                  />
                </label>
              </td>
              <td>{index + 1}</td>
              <td>{library.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
