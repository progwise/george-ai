import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'
import { LibraryForm } from '../../components/library/library-form'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { AiLibraryInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { LibrarySelector } from '../../components/library/library-selector'
import { queryKeys } from '../../query-keys'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '../../components/loading-spinner'
import { GoogleDriveFiles } from '../../components/library/google-drive-files'
import { EmbeddingsTable } from '../../components/library/embeddings-table'
import { LibraryQuery } from '../../components/library/library-query'

const aiLibraryEditQueryDocument = graphql(`
  query aiLibraryEdit($id: String!, $ownerId: String!) {
    aiLibrary(id: $id) {
      id
      name
      description
      createdAt
      ownerId
      aiLibraryType
      url
    }
    aiLibraries(ownerId: $ownerId) {
      id
      name
    }
  }
`)

const getLibrary = createServerFn({ method: 'GET' })
  .validator(
    ({ libraryId, ownerId }: { libraryId: string; ownerId: string }) => ({
      id: z.string().nonempty().parse(libraryId),
      ownerId: z.string().nonempty().parse(ownerId),
    }),
  )
  .handler(
    async (ctx) => await backendRequest(aiLibraryEditQueryDocument, ctx.data),
  )

const updateLibraryDocument = graphql(/* GraphQL */ `
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

    console.log('form data', data.get('name'))

    const libraryId = z
      .string()
      .nonempty()
      .parse(data.get('libraryId') as string)

    const library = AiLibraryInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
      aiLibraryType: data.get('aiLibraryType'),
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
    return {
      libraryId: params.libraryId,
      ownerId: context.auth.user?.id,
    }
  },
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      librariesQueryOptions(context.auth.user?.id, context.libraryId),
    )
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const currentLocation = useLocation()
  const { libraryId } = useParams({ strict: false })
  const { data, isLoading } = useSuspenseQuery(
    librariesQueryOptions(auth.user?.id, libraryId),
  )

  const navigate = useNavigate()
  const { mutate: saveLibrary, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => changeLibrary({ data }),
    onSettled: () => {
      console.log('library updated')
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
  if (isLoading) {
    return
  }
  if (!aiLibrary || !aiLibraries) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <LoadingSpinner isLoading={saveIsPending} />
      <div className="flex justify-between items-center">
        <LibrarySelector
          libraries={aiLibraries!}
          selectedLibrary={aiLibrary!}
        />
        <div className="badge badge-secondary badge-outline">
          {disabled ? 'Disabled' : 'enabled'}
        </div>
        <div className="flex gap-2">
          <Link type="button" className="btn btn-primary btn-sm" to="..">
            List
          </Link>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered">
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Rules"
        />
        <div role="tabpanel" className="tab-content p-10">
          <LibraryForm
            library={aiLibrary!}
            owner={auth.user!}
            handleSubmit={handleSubmit}
            disabled={disabled}
          />
        </div>

        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Files"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content p-10">
          <GoogleDriveFiles
            aiLibraryId={aiLibrary.id}
            currentLocationHref={currentLocation.href}
          />
        </div>
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Embeddings"
        />
        <div role="tabpanel" className="tab-content p-10">
          <EmbeddingsTable aiLibraryId={aiLibrary.id} />
        </div>
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Query"
        />
        <div role="tabpanel" className="tab-content p-10">
          <LibraryQuery aiLibraryId={aiLibrary.id} />
        </div>
      </div>
    </article>
  )
}
