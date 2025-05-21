import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { AiActGuide } from '../../../components/assistant/assistant-ai-act/ai-act-guide'
import { AssistantBasecaseForm } from '../../../components/assistant/assistant-basecase-form'
import { AssistantForm } from '../../../components/assistant/assistant-form'
import { AssistantLibraries } from '../../../components/assistant/assistant-libraries'
import { AssistantParticipants } from '../../../components/assistant/assistant-participants'
import { AssistantSelector } from '../../../components/assistant/assistant-selector'
import { getLibrariesQueryOptions } from '../../../components/library/get-libraries-query-options'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { BackIcon } from '../../../icons/back-icon'
import { getAiAssistantsQueryOptions, getAssistantQueryOptions } from '../../../server-functions/assistant'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/assistants/$assistantId')({
  component: RouteComponent,
  staleTime: 0,
})

function RouteComponent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = Route.useRouteContext()
  const ownerId = user.id
  const { assistantId } = Route.useParams()
  const { data, isLoading } = useSuspenseQuery(getAssistantQueryOptions(assistantId))

  const { data: usersData } = useSuspenseQuery(getUsersQueryOptions())
  const {
    data: { aiLibraries },
  } = useSuspenseQuery(getLibrariesQueryOptions())
  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAiAssistantsQueryOptions())

  const { aiAssistant, aiLibraryUsage } = data

  if (!aiAssistant || !aiAssistants || !aiLibraries || !aiLibraryUsage || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="container flex w-full flex-col gap-4">
      <div className="flex gap-2">
        <div className="w-64">
          <AssistantSelector assistants={aiAssistants} selectedAssistant={aiAssistant!} />
        </div>
        <div className="flex w-5/6 gap-2">
          <AssistantParticipants assistant={aiAssistant} users={usersData.users} userId={ownerId} />
          <button
            type="button"
            className="btn btn-sm tooltip tooltip-left"
            data-tip={t('tooltips.goToOverview')}
            onClick={() => navigate({ to: '..' })}
          >
            <BackIcon />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="card rounded-box bg-base-200 grid grow px-3 py-3 sm:w-1/2">
          <AssistantForm assistant={aiAssistant} disabled={!ownerId} />
          <hr className="my-3" />
          <AssistantLibraries assistant={aiAssistant} usages={aiLibraryUsage} libraries={aiLibraries} />
        </div>
        <div className="card rounded-box bg-base-200 grid grow px-3 py-3 sm:w-1/2">
          <AssistantBasecaseForm assistant={aiAssistant} />
        </div>
      </div>
      {assistantId && <AiActGuide assistantId={assistantId} />}
    </article>
  )
}
