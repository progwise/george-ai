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

export const getCurrentWorkspaceCookie = createServerFn({ method: 'GET' })
  .inputValidator((input?: { userDefaultWorkspaceId?: string }) => input ?? {})
  .handler(({ data }) => {
    const cookieValue = getCookie(WORKSPACE_COOKIE_NAME)
    if (!cookieValue) {
      // Fallback to user's default workspace or System workspace
      return data.userDefaultWorkspaceId ?? '00000000-0000-0000-0000-000000000001'
    }
    return cookieValue
  })

/**
 * Validates the workspace cookie against accessible workspaces and fixes it if invalid.
 * This should be called early in the app lifecycle (e.g., in root beforeLoad) to prevent
 * errors from requests made with a stale/inaccessible workspace ID.
 *
 * @returns The validated (possibly corrected) workspace ID
 */
export const validateAndFixWorkspaceCookie = createServerFn({ method: 'POST' })
  .inputValidator((data: { accessibleWorkspaceIds: string[]; userDefaultWorkspaceId: string | null | undefined }) =>
    z
      .object({
        accessibleWorkspaceIds: z.array(z.string()),
        userDefaultWorkspaceId: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(({ data: { accessibleWorkspaceIds, userDefaultWorkspaceId } }) => {
    const currentCookie = getCookie(WORKSPACE_COOKIE_NAME)

    // If no cookie or cookie is valid, return early
    if (!currentCookie) {
      // Set to user's default or first accessible workspace
      const validWorkspaceId = userDefaultWorkspaceId ?? accessibleWorkspaceIds[0]
      if (validWorkspaceId) {
        setCookie(WORKSPACE_COOKIE_NAME, validWorkspaceId)
      }
      return { workspaceId: validWorkspaceId, wasFixed: !currentCookie }
    }

    // Check if current cookie is in accessible workspaces
    if (accessibleWorkspaceIds.includes(currentCookie)) {
      return { workspaceId: currentCookie, wasFixed: false }
    }

    // Cookie is stale/invalid - fix it
    const validWorkspaceId = userDefaultWorkspaceId ?? accessibleWorkspaceIds[0]
    if (validWorkspaceId) {
      setCookie(WORKSPACE_COOKIE_NAME, validWorkspaceId)
    }
    return { workspaceId: validWorkspaceId, wasFixed: true }
  })
