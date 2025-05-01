import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getLibrariesQueryOptions } from '../../../../components/library/get-libraries-query-options'
import { getLibraryQueryOptions } from '../../../../components/library/get-library-query-options'
import { LibraryForm } from '../../../../components/library/library-form'
import { LoadingSpinner } from '../../../../components/loading-spinner'
import { graphql } from '../../../../gql'
import { AiLibraryInputSchema } from '../../../../gql/validation'
import { backendRequest } from '../../../../server-functions/backend'

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

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/edit')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))
  },
})

function RouteComponent() {
  const { user, queryClient } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const { libraryId } = Route.useParams()

  const { data: aiLibrary } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  const { mutate: saveLibrary, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => changeLibrary({ data }),
    onSettled: () => {
      queryClient.invalidateQueries(getLibrariesQueryOptions(user.id))
      queryClient.invalidateQueries(getLibraryQueryOptions(libraryId))
      navigate({ to: '..' })
    },
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    saveLibrary(formData)
  }

  return (
    <>
      <LoadingSpinner isLoading={saveIsPending} />
      <LibraryForm library={aiLibrary} ownerId={user.id} handleSubmit={handleSubmit} disabled={saveIsPending} />
    </>
  )
}
