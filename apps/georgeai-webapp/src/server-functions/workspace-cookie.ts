import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

export const WORKSPACE_COOKIE_NAME = 'workspace-id'

export const setWorkspaceCookie = createServerFn({ method: 'POST' })
  .inputValidator((data: { workspaceId: string | null }) =>
    z.object({ workspaceId: z.string().nullable() }).parse(data),
  )
  .handler(({ data: { workspaceId } }) => {
    if (workspaceId) {
      setCookie(WORKSPACE_COOKIE_NAME, workspaceId)
    }
  })

export const getCurrentWorkspaceCookie = createServerFn({ method: 'GET' }).handler(() => {
  const cookieValue = getCookie(WORKSPACE_COOKIE_NAME)
  if (!cookieValue) return '00000000-0000-0000-0000-000000000001' //TODO default workspace id together with pothos-graphql package
  return cookieValue
})
