import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'
import { LibraryForm } from '../../components/library/library-form'
import { AiLibraryType } from '../../gql/graphql'
import { createServerFn } from '@tanstack/react-start'
import { AiLibraryInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { LoadingSpinner } from '../../components/loading-spinner'

const createLibraryDocument = graphql(`
  mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {
    createAiLibrary(ownerId: $ownerId, data: $data) {
      id
      name
    }
  }
`)

const createLibrary = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    const ownerId = z
      .string()
      .nonempty()
      .parse(data.get('ownerId') as string)

    const assistant = AiLibraryInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
      libraryType: data.get('libraryType'),
    })

    return { ownerId, data: assistant }
  })
  .handler(async (ctx) => {
    return await backendRequest(createLibraryDocument, ctx.data)
  })

export const Route = createFileRoute('/libraries/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isAuthenticated, user } = useAuth()
  const disabled = !isAuthenticated || !user

  const navigate = useNavigate()
  const { mutate: createLibraryMuation, isPending: createIsPending } =
    useMutation({
      mutationFn: (data: FormData) => createLibrary({ data }),
      onSettled: () => {
        navigate({ to: '..' })
      },
    })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    createLibraryMuation(formData)
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <LoadingSpinner isLoading={createIsPending} />
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Create your Library</h3>
        <div className="badge badge-secondary badge-outline">
          {disabled ? 'Disabled' : 'enabled'}
        </div>
        <div className="flex gap-2">
          <Link type="button" className="btn btn-primary btn-sm" to="..">
            List
          </Link>
        </div>
      </div>
      {user && (
        <LibraryForm
          library={{
            id: '',
            createdAt: new Date().toISOString(),
            url: '',
            ownerId: user.id,
            name: '',
            description: '',
            libraryType: AiLibraryType.GoogleDrive,
          }}
          owner={user}
          handleSubmit={handleSubmit}
          disabled={false}
        />
      )}
    </article>
  )
}
