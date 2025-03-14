import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'
import { LoadingSpinner } from '../loading-spinner'

const AssistantForLibrariesFragment = graphql(`
  fragment AssistantForLibrariesFragment on AiAssistant {
    id
  }
`)
const AssistantLibrariesFragment = graphql(`
  fragment AssistantLibrariesFragment on AiLibrary {
    id
    name
  }
`)
const AssistantLibrariesUsageFragment = graphql(`
  fragment AssistantLibrariesUsageFragment on AiLibraryUsage {
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
  assistant: FragmentType<typeof AssistantForLibrariesFragment>
  libraries: FragmentType<typeof AssistantLibrariesFragment>[] | undefined
  usages: FragmentType<typeof AssistantLibrariesUsageFragment>[] | undefined
}

export const AssistantLibraries = (props: AssistantLibrariesProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const assistant = useFragment(AssistantForLibrariesFragment, props.assistant)
  const libraries = useFragment(AssistantLibrariesFragment, props.libraries)
  const usages = useFragment(AssistantLibrariesUsageFragment, props.usages)

  const { mutate: updateUsage, isPending: updateUsageIsPending } = useMutation({
    mutationFn: (data: { assistantId: string; libraryId: string; use: boolean }) => updateLibraryUsage({ data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistantForEdit, assistant.id] }),
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="overflow-hidden text-nowrap text-sm text-base-content/50">{t('assistants.libraries')}</p>

      <LoadingSpinner isLoading={updateUsageIsPending} />

      {libraries?.map((library) => (
        <div className="card grid grid-cols-2 gap-2" key={library.id}>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
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

            <Link to="/libraries/$libraryId" params={{ libraryId: library.id }}>
              {library.name}
            </Link>
          </label>
          <Input
            className="col-span-2"
            type="textarea"
            name="description"
            placeholder="When should the assistant choose this library"
          />
        </div>
      ))}
    </div>
  )
}
