import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { AiActGuide } from '../../../components/assistant/assistant-ai-act/ai-act-guide'
import { AssistantBasecaseForm } from '../../../components/assistant/assistant-basecase-form'
import { AssistantForm } from '../../../components/assistant/assistant-form'
import { AssistantLibraries } from '../../../components/assistant/assistant-libraries'
import { AssistantSelector } from '../../../components/assistant/assistant-selector'
import { getAssistantQueryOptions } from '../../../components/assistant/get-assistant'
import { getAiAssistantsQueryOptions } from '../../../components/assistant/get-assistants'
import { getLibrariesQueryOptions } from '../../../components/library/queries/get-libraries'
import { LoadingSpinner } from '../../../components/loading-spinner'

export const Route = createFileRoute('/_authenticated/assistants/$assistantId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getAssistantQueryOptions(params.assistantId)),
    ])
  },
  staleTime: 0,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const ownerId = user.id
  const { assistantId } = Route.useParams()

  const {
    data: { aiAssistant, aiLibraryUsage },
  } = useSuspenseQuery(getAssistantQueryOptions(assistantId))

  const {
    data: { aiLibraries },
  } = useSuspenseQuery(getLibrariesQueryOptions())
  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAiAssistantsQueryOptions())

  if (!aiAssistant || !aiAssistants || !aiLibraries || !aiLibraryUsage) {
    return <LoadingSpinner />
  }

  return (
    <article className="container flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <AssistantSelector assistants={aiAssistants} selectedAssistant={aiAssistant!} />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="card grid grow rounded-box bg-base-200 p-3 sm:w-1/2">
          <AssistantForm assistant={aiAssistant} disabled={!ownerId} />
          <hr className="my-3" />
          <AssistantLibraries assistant={aiAssistant} usages={aiLibraryUsage} libraries={aiLibraries} />
        </div>
        <div className="card grid grow rounded-box bg-base-200 p-3 sm:w-1/2">
          <AssistantBasecaseForm assistant={aiAssistant} />
        </div>
      </div>
      {assistantId && <AiActGuide assistantId={assistantId} />}
    </article>
  )
}
