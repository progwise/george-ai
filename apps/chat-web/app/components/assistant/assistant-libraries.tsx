import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { LoadingSpinner } from '../loading-spinner'

const AssistantLibraries_AssistantFragment = graphql(`
  fragment AssistantLibraries_Assistant on AiAssistant {
    id
  }
`)
const AssistantLibraries_LibraryFragment = graphql(`
  fragment AssistantLibraries_Library on AiLibrary {
    id
    name
  }
`)
const AssistantLibraries_LibraryUsageFragment = graphql(`
  fragment AssistantLibraries_LibraryUsage on AiLibraryUsage {
    libraryId
  }
`)

const UpdateLibraryUsageDocument = graphql(/* GraphQL */ `
  mutation updateLibraryUsage($assistantId: String!, $libraryId: String!, $use: Boolean!) {
    updateLibraryUsage(data: { assistantId: $assistantId, libraryId: $libraryId, use: $use }) {
      usageId
      deletedCount
    }
  }
`)

const updateLibraryUsage = createServerFn({ method: 'POST' })
  .validator(({ assistantId, libraryId, use }: { assistantId: string; libraryId: string; use: boolean }) => ({
    assistantId: z.string().nonempty().parse(assistantId),
    libraryId: z.string().nonempty().parse(libraryId),
    use: z.boolean().parse(use),
  }))
  .handler(async (ctx) => await backendRequest(UpdateLibraryUsageDocument, ctx.data))

export interface AssistantLibrariesProps {
  assistant: FragmentType<typeof AssistantLibraries_AssistantFragment>
  libraries: FragmentType<typeof AssistantLibraries_LibraryFragment>[] | undefined
  usages: FragmentType<typeof AssistantLibraries_LibraryUsageFragment>[] | undefined
}

export const AssistantLibraries = (props: AssistantLibrariesProps) => {
  const queryClient = useQueryClient()
  const assistant = useFragment(AssistantLibraries_AssistantFragment, props.assistant)
  const libraries = useFragment(AssistantLibraries_LibraryFragment, props.libraries)
  const usages = useFragment(AssistantLibraries_LibraryUsageFragment, props.usages)

  const { mutate: updateUsage, isPending: updateUsageIsPending } = useMutation({
    mutationFn: (data: { assistantId: string; libraryId: string; use: boolean }) => updateLibraryUsage({ data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistantForEdit, assistant.id] }),
  })

  return (
    <>
      <LoadingSpinner isLoading={updateUsageIsPending} />
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Library</th>
          </tr>
        </thead>
        <tbody>
          {libraries?.map((library, index) => (
            <tr key={library.id}>
              <td>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={async (event) => {
                      updateUsage({
                        assistantId: assistant.id,
                        libraryId: library.id,
                        use: event.target.checked,
                      })
                    }}
                    name="selectedFiles"
                    checked={usages?.some((usage) => usage.libraryId === library.id)}
                  />
                </label>
              </td>
              <td>{index + 1}</td>
              <td>
                <Link to="/libraries/$libraryId" params={{ libraryId: library.id }}>
                  {library.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
