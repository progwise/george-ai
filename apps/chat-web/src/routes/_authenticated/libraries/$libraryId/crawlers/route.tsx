import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
