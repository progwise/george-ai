import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { useCallback } from 'react'

import { queryKeys } from '../query-keys'

const getAssistantSelectionCookieName = (conversationId: string) => `assistant-selection-${conversationId}`

const getAssistantSelection = createServerFn({ method: 'GET' })
  .validator((conversationId: string) => conversationId)
  .handler(async ({ data: conversationId }) => {
    const cookieName = getAssistantSelectionCookieName(conversationId)
    const selection = getCookie(cookieName)
    return selection ? (JSON.parse(selection) as string[]) : []
  })

const setAssistantSelectionInCookie = (conversationId: string, unselectedIds: string[]) => {
  const cookieName = getAssistantSelectionCookieName(conversationId)
  document.cookie = `${cookieName}=${JSON.stringify(unselectedIds)}; path=/; max-age=31536000`
}

export const getAssistantSelectionQueryOptions = (conversationId: string) => ({
  queryKey: [queryKeys.ConversationAssistantSelection, conversationId],
  queryFn: () => getAssistantSelection({ data: conversationId }),
  staleTime: Infinity,
})

export const useAssistantSelection = (conversationId: string) => {
  const { data: unselectedAssistantIds } = useSuspenseQuery(getAssistantSelectionQueryOptions(conversationId))
  const queryClient = useQueryClient()

  const setUnselectedAssistantIds = useCallback(
    (newUnselectedIds: string[]) => {
      setAssistantSelectionInCookie(conversationId, newUnselectedIds)
      queryClient.setQueryData(getAssistantSelectionQueryOptions(conversationId).queryKey, newUnselectedIds)
    },
    [queryClient, conversationId],
  )

  const handleAssistantToggle = useCallback(
    (assistantId: string) => {
      const currentIds = unselectedAssistantIds || []
      const newIds = currentIds.includes(assistantId)
        ? currentIds.filter((id) => id !== assistantId)
        : [...currentIds, assistantId]

      setUnselectedAssistantIds(newIds)
    },
    [unselectedAssistantIds, setUnselectedAssistantIds],
  )

  return {
    unselectedAssistantIds: unselectedAssistantIds || [],
    setUnselectedAssistantIds,
    handleAssistantToggle,
  }
}
