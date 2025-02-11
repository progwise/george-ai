import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/langchain-new-ui')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/langchain-new-ui"!</div>
}
