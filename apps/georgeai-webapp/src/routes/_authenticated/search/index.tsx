import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getAiAssistantsQueryOptions } from '../../../components/assistant/get-assistants'
import { getAutomationsQueryOptions } from '../../../components/automations/queries'
import { getConversationsQueryOptions } from '../../../components/conversation/get-conversations'
import { getLibrariesQueryOptions } from '../../../components/library/queries'
import { getListsQueryOptions } from '../../../components/lists/queries'
import { useWorkspace } from '../../../components/workspace'
import { useTranslation } from '../../../i18n/use-translation-hook'

const RouteComponent = () => {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()

  const { currentWorkspace } = useWorkspace(user)
  const { data: libraries } = useQuery(getLibrariesQueryOptions())
  const { data: lists } = useQuery(getListsQueryOptions())
  const { data: automations } = useQuery(getAutomationsQueryOptions())
  const { data: assistants } = useQuery(getAiAssistantsQueryOptions())
  const { data: conversations } = useQuery(getConversationsQueryOptions())

  return <span>test</span>
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: RouteComponent,
})
