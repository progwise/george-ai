import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { BookIcon } from '../../icons/book-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { getAssistantQueryOptions } from '../../server-functions/assistant'
import { backendRequest } from '../../server-functions/backend'
import { Dropdown } from '../dropdown'
import { Input } from '../form/input'
import { LoadingSpinner } from '../loading-spinner'

const AssistantLibraries_AssistantFragment = graphql(`
  fragment AssistantLibraries_Assistant on AiAssistant {
    id
    ownerId
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
    id
    assistantId
    libraryId
    usedFor
    library {
      id
      name
    }
  }
`)

const addLibraryUsage = createServerFn({ method: 'POST' })
  .validator(async (data: { assistantId: string; libraryId: string }) => ({
    assistantId: z.string().nonempty().parse(data.assistantId),
    libraryId: z.string().nonempty().parse(data.libraryId),
  }))
  .handler(async ({ data }) => {
    return await backendRequest(
      graphql(/* GraphQL */ `
        mutation addLibraryUsage($assistantId: String!, $libraryId: String!) {
          addLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {
            id
          }
        }
      `),
      await data,
    )
  })

const removeLibraryUsage = createServerFn({ method: 'POST' })
  .validator(async (data: { assistantId: string; libraryId: string }) => ({
    assistantId: z.string().nonempty().parse(data.assistantId),
    libraryId: z.string().nonempty().parse(data.libraryId),
  }))
  .handler(async ({ data }) => {
    return await backendRequest(
      graphql(/* GraphQL */ `
        mutation removeLibraryUsage($assistantId: String!, $libraryId: String!) {
          removeLibraryUsage(assistantId: $assistantId, libraryId: $libraryId) {
            id
          }
        }
      `),
      await data,
    )
  })

const updateLibraryUsage = createServerFn({ method: 'POST' })
  .validator(async (data: { id: string; usedFor: string }) => ({
    id: z.string().nonempty().parse(data.id),
    usedFor: z.string().nonempty().parse(data.usedFor),
  }))
  .handler(
    async ({ data }) =>
      await backendRequest(
        graphql(/* GraphQL */ `
          mutation updateLibraryUsage($id: String!, $usedFor: String!) {
            updateLibraryUsage(id: $id, usedFor: $usedFor) {
              id
            }
          }
        `),
        await data,
      ),
  )

export interface AssistantLibrariesProps {
  assistant: FragmentType<typeof AssistantLibraries_AssistantFragment>
  libraries: FragmentType<typeof AssistantLibraries_LibraryFragment>[] | undefined
  usages: FragmentType<typeof AssistantLibraries_LibraryUsageFragment>[] | undefined
}

export const AssistantLibraries = (props: AssistantLibrariesProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const assistant = useFragment(AssistantLibraries_AssistantFragment, props.assistant)
  const libraries = useFragment(AssistantLibraries_LibraryFragment, props.libraries)
  const usages = useFragment(AssistantLibraries_LibraryUsageFragment, props.usages)

  const { mutate: updateUsage, isPending: updateUsageIsPending } = useMutation({
    mutationFn: (data: { id: string; usedFor: string }) => updateLibraryUsage({ data }),
    onSettled: () => queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id, assistant.ownerId)),
  })

  const { mutate: addUsage, isPending: addUsageIsPending } = useMutation({
    mutationFn: (data: { assistantId: string; libraryId: string }) => addLibraryUsage({ data }),
    onSettled: () => queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id, assistant.ownerId)),
  })

  const { mutate: removeUsage, isPending: removeUsageIsPending } = useMutation({
    mutationFn: (data: { assistantId: string; libraryId: string }) => removeLibraryUsage({ data }),
    onSettled: () => queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id, assistant.ownerId)),
  })
  const librariesToAdd = libraries?.filter((library) => !usages?.some((usage) => usage.libraryId === library.id)) || []

  return (
    <div className="flex flex-col gap-2">
      <LoadingSpinner isLoading={addUsageIsPending || removeUsageIsPending || updateUsageIsPending} />
      <div className="flex flex-row items-center justify-between">
        {librariesToAdd.length > 0 ? (
          <Dropdown
            options={
              librariesToAdd.map((library) => ({ id: library.id, title: library.name, icon: <BookIcon /> })) || []
            }
            title={t('assistants.libraryToAdd')}
            action={(item) => {
              const libraryId = item.id
              addUsage({ assistantId: assistant.id, libraryId })
            }}
          />
        ) : (
          <span className="rounded-md border border-transparent px-2 py-1 text-left text-sm text-base-content/50">
            {t('assistants.noLibrariesToAdd')}
          </span>
        )}
      </div>
      <LoadingSpinner isLoading={updateUsageIsPending} />

      <div className="flex flex-col gap-2">
        {usages?.map((usage) => (
          <div className="card" key={usage.id}>
            <label className="flex justify-between">
              <div className="ml-1 flex items-center gap-2">
                <BookIcon className="size-3" />
                <Link
                  to="/libraries/$libraryId"
                  params={{ libraryId: usage.libraryId }}
                  className="link-hover link text-sm"
                >
                  {usage.library.name}
                </Link>
              </div>
              <button
                type="button"
                className="btn btn-circle btn-ghost btn-sm tooltip tooltip-bottom"
                onClick={() => {
                  const libraryId = usage.libraryId
                  removeUsage({ assistantId: assistant.id, libraryId })
                }}
                data-tip={t('assistants.removeLibrary')}
              >
                <TrashIcon />
              </button>
            </label>
            <Input
              className="min-h-20"
              type="textarea"
              name="description"
              value={usage.usedFor}
              placeholder={t('assistants.usagePlaceholder')}
              onBlur={(event) => {
                const usedFor = event.currentTarget.value
                updateUsage({ id: usage.id, usedFor })
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
