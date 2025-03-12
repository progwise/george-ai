import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useLocation, useNavigate, useParams } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { CurrentUser, useAuth } from '../../auth/auth-hook'
import { DeleteLibraryDialog } from '../../components/library/delete-library-dialog'
import { EmbeddingsTable } from '../../components/library/embeddings-table'
import { GoogleDriveFiles } from '../../components/library/google-drive-files'
import { LibraryForm } from '../../components/library/library-form'
import { LibraryQuery } from '../../components/library/library-query'
import { LibrarySelector } from '../../components/library/library-selector'
import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { AiLibraryInputSchema } from '../../gql/validation'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const aiLibraryEditQueryDocument = graphql(`
  query aiLibraryEdit($id: String!, $ownerId: String!) {
    aiLibrary(id: $id) {
      id
      name
      description
      createdAt
      ownerId
      libraryType
      url
      files {
        id
        createdAt
        libraryId
        mimeType
        name
      }
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
      libraryType: data.get('libraryType'),
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
  queryKey: [queryKeys.AiLibraries, libraryId, ownerId],
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
  beforeLoad: async ({ params, context }) => {
    const currentUser = context.queryClient.getQueryData<CurrentUser>([queryKeys.CurrentUser])
    return {
      libraryId: params.libraryId,
      ownerId: currentUser?.id,
    }
  },
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(librariesQueryOptions(context.ownerId, context.libraryId))
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const remainingStorage = (auth.userProfile?.freeStorage || 0) - (auth.userProfile?.usedStorage || 0)
  const currentLocation = useLocation()
  const { libraryId } = useParams({ strict: false })
  const { data, isLoading } = useSuspenseQuery(librariesQueryOptions(auth.user?.id, libraryId))
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

  const disabled = !auth?.isAuthenticated

  if (!aiLibrary || !aiLibraries || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <LoadingSpinner isLoading={saveIsPending} />
      <div className="flex items-center justify-between">
        <LibrarySelector libraries={aiLibraries!} selectedLibrary={aiLibrary!} />
        <div className="badge badge-secondary badge-outline">{disabled ? 'Disabled' : 'enabled'}</div>
        <div className="flex gap-2">
          <DeleteLibraryDialog library={aiLibrary} />
          <Link type="button" className="btn btn-primary btn-sm" to="..">
            Back
          </Link>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered">
        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Rules" />
        <div role="tabpanel" className="tab-content p-10">
          {auth.user?.id && (
            <LibraryForm library={aiLibrary!} ownerId={auth.user.id} handleSubmit={handleSubmit} disabled={disabled} />
          )}
        </div>

        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Files" defaultChecked />
        <div role="tabpanel" className="tab-content p-10">
          <EmbeddingsTable libraryId={aiLibrary.id} />
        </div>

        <input type="radio" name="my_tabs_1" role="tab" className="tab whitespace-nowrap" aria-label="Google Drive" />
        <div role="tabpanel" className="tab-content p-10">
          <GoogleDriveFiles
            libraryId={aiLibrary.id}
            currentLocationHref={currentLocation.href}
            noFreeUploads={remainingStorage < 100}
          />
        </div>

        <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="Query" />
        <div role="tabpanel" className="tab-content p-10">
          <LibraryQuery libraryId={aiLibrary.id} />
        </div>
      </div>
    </article>
  )
}
