import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { getAiAssistantsQueryOptions } from '../../../components/assistant/get-assistants'
import { ConversationSelector } from '../../../components/conversation/conversation-selector'
import { getConversationsQueryOptions } from '../../../components/conversation/get-conversations'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getProfileQueryOptions()),
      context.queryClient.ensureQueryData(getConversationsQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const drawerCheckboxRef = useRef<HTMLInputElement>(null)

  const {
    data: { aiConversations },
  } = useSuspenseQuery(getConversationsQueryOptions())

  const handleConversationClick = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false
    }
  }
  return (
    <div
      className={twMerge(
        'drawer lg:drawer-open grow',
        'min-h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
      )}
    >
      <input id="conversation-drawer" type="checkbox" className="drawer-toggle" ref={drawerCheckboxRef} />

      <Outlet />

      <div
        className={twMerge(
          'drawer-side max-lg:z-50 lg:top-16',
          'lg:h-[calc(100dvh_-_--spacing(16))]', // full height minus the top bar
        )}
      >
        <label htmlFor="conversation-drawer" className="drawer-overlay" />
        <div className="bg-base-100 flex w-80 flex-col items-center bg-auto p-4 lg:p-0 lg:pl-4 lg:pt-4">
          <ConversationSelector conversations={aiConversations} onClick={handleConversationClick} />
        </div>
      </div>
    </div>
  )
}
