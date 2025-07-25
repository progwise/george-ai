import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getLibrariesQueryOptions } from '../../../../components/library/get-libraries'
import { getLibraryQueryOptions } from '../../../../components/library/get-library'
import { LibraryForm } from '../../../../components/library/library-form'
import { updateLibrary } from '../../../../components/library/update-library'
import { LoadingSpinner } from '../../../../components/loading-spinner'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))
  },
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const { libraryId } = Route.useParams()

  const { data: aiLibrary } = useSuspenseQuery(getLibraryQueryOptions(libraryId))

  const { mutate: saveLibrary, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => updateLibrary({ data }),
    onSettled: () => {
      queryClient.invalidateQueries(getLibrariesQueryOptions())
      queryClient.invalidateQueries(getLibraryQueryOptions(libraryId))
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
      <LibraryForm library={aiLibrary} handleSubmit={handleSubmit} disabled={saveIsPending} />
    </>
  )
}
