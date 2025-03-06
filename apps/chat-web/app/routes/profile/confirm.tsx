import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/confirm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/registration/confirm"!</div>
}
