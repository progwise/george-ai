import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/knowledge/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/knowledge/"!</div>
}
