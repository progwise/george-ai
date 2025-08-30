import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/libraries/$libraryId/files/$fileId/search',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_authenticated/libraries/$libraryId/files/$fileId/search"!
    </div>
  )
}
