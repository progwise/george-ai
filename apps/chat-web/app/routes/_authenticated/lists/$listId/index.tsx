import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/lists/$listId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/lists/listId$/"!</div>
}
