import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { CrawlerTable } from '../../components/library/crawler/crawler-table'
import { DeleteLibraryDialog } from '../../components/library/delete-library-dialog'
import { EmbeddingsTable } from '../../components/library/embeddings-table'
import { LibraryForm } from '../../components/library/library-form'
import { LibraryQuery } from '../../components/library/library-query'
import { LibrarySelector } from '../../components/library/library-selector'
import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { AiLibraryInputSchema } from '../../gql/validation'
import { useTranslation } from '../../i18n/use-translation-hook'
import { BackIcon } from '../../icons/back-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const aiLibraryEditQueryDocument = graphql(`
  query aiLibraryEdit($id: String!, $ownerId: String!) {
    aiLibrary(id: $id) {
      id
      name
      ...LibraryFormFragment
      ...DeleteLibraryDialog_Library
    }
    aiLibraries(ownerId: $ownerId) {
      id
      name
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .validator(({ libraryId, ownerId }: { libraryId: string; ownerId: string }) => ({
    id: z.string().nonempty().parse(libraryId),
    ownerId: z.string().nonempty().parse(ownerId),
  }))
  .handler(async (ctx) => await backendRequest(aiLibraryEditQueryDocument, ctx.data))

const updateLibraryDocument = graphql(`
  mutation changeAiLibrary($id: String!, $data: AiLibraryInput!) {
    updateAiLibrary(id: $id, data: $data) {
      id
      name
    }
  }
`)

const changeLibrary = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }

    const libraryId = z
      .string()
      .nonempty()
      .parse(data.get('libraryId') as string)

    const library = AiLibraryInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
    })
    return { libraryId, library }
  })
  .handler(async (ctx) => {
    return await backendRequest(updateLibraryDocument, {
      data: ctx.data.library,
      id: ctx.data.libraryId,
    })
  })

const librariesQueryOptions = (ownerId?: string, libraryId?: string) => ({
  queryKey: [queryKeys.AiLibraries, ownerId, libraryId],
  queryFn: async () => {
    if (!ownerId || !libraryId) {
      return null
    } else {
      return getLibrary({ data: { ownerId, libraryId } })
    }
  },
  enabled: !!ownerId || !!libraryId,
})

export const Route = createFileRoute('/libraries/$libraryId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(librariesQueryOptions(context.user?.id, params.libraryId))
  },
  staleTime: 0,
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { data, isLoading } = useSuspenseQuery(librariesQueryOptions(user?.id, libraryId))
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: saveLibrary, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => changeLibrary({ data }),
    onSettled: () => {
      navigate({ to: '..' })
    },
  })

  const { aiLibrary, aiLibraries } = data || {}

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    saveLibrary(formData)
  }

  const disabled = !user

  if (!aiLibrary || !aiLibraries || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <LoadingSpinner isLoading={saveIsPending} />
      <div className="flex justify-between">
        <div className="w-64">
          <LibrarySelector libraries={aiLibraries} selectedLibrary={aiLibrary} />
        </div>
        <div className="flex gap-2">
          <DeleteLibraryDialog library={aiLibrary} />
          <button
            type="button"
            onClick={() => navigate({ to: '..' })}
            className="btn btn-sm tooltip"
            data-tip={t('tooltips.goToOverview')}
          >
            <BackIcon />
          </button>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered">
        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label={t('actions.edit')} />
        <div role="tabpanel" className="tab-content p-10">
          {user?.id && (
            <LibraryForm library={aiLibrary} ownerId={user.id} handleSubmit={handleSubmit} disabled={disabled} />
          )}
        </div>

        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label={t('labels.files')} defaultChecked />
        <div role="tabpanel" className="tab-content overflow-x-auto p-10">
          <EmbeddingsTable libraryId={libraryId} userId={user?.id} />
        </div>

        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label={t('labels.query')} />
        <div role="tabpanel" className="tab-content p-10">
          <LibraryQuery libraryId={libraryId} />
        </div>

        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label={t('labels.crawlers')} />
        <div role="tabpanel" className="tab-content p-10">
          <CrawlerTable libraryId={libraryId} userId={user!.id} />
        </div>
      </div>
    </article>
  )
}
