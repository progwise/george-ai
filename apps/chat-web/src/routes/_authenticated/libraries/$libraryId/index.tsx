import { createFileRoute, redirect } from '@tanstack/react-router'

import { getLibraryQueryOptions } from '../../../../components/library/get-library'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getLibraryQueryOptions(params.libraryId))
    throw redirect({ to: `/libraries/$libraryId/files`, params: { libraryId: params.libraryId } })
  },
})
