import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { AiActGuide } from '../../../components/assistant/assistant-ai-act/ai-act-guide'
import { AssistantBasecaseForm } from '../../../components/assistant/assistant-basecase-form'
import { AssistantForm } from '../../../components/assistant/assistant-form'
import { AssistantLibraries } from '../../../components/assistant/assistant-libraries'
import { AssistantSelector } from '../../../components/assistant/assistant-selector'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { graphql } from '../../../gql/gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { BackIcon } from '../../../icons/back-icon'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getAssistant = createServerFn({ method: 'GET' })
  .validator(({ assistantId, ownerId }: { assistantId: string; ownerId: string }) => ({
    assistantId: z.string().nonempty().parse(assistantId),
    ownerId: z.string().nonempty().parse(ownerId),
  }))
  .handler(
    async (ctx) =>
      await backendRequest(
        graphql(`
          query aiAssistantDetails($id: String!, $ownerId: String!) {
            aiAssistant(id: $id) {
              ...AssistantForm_Assistant
              ...AssistantSelector_Assistant
              ...AssistantLibraries_Assistant
              ...AssistantBasecaseForm_Assistant
            }
            aiAssistants(ownerId: $ownerId) {
              ...AssistantSelector_Assistant
            }
            aiLibraryUsage(assistantId: $id) {
              ...AssistantLibraries_LibraryUsage
            }
            aiLibraries(ownerId: $ownerId) {
              ...AssistantLibraries_Library
            }
          }
        `),
        {
          id: ctx.data.assistantId,
          ownerId: ctx.data.ownerId,
        },
      ),
  )

export const Route = createFileRoute('/_authenticated/assistants/$assistantId')({
  component: RouteComponent,
  staleTime: 0,
})

function RouteComponent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const ownerId = Route.useRouteContext().user.id
  const { assistantId } = Route.useParams()
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.AiAssistantForEdit, assistantId, ownerId],
    queryFn: () => getAssistant({ data: { ownerId, assistantId } }),
  })

  const { aiAssistant, aiAssistants, aiLibraries, aiLibraryUsage } = data || {}

  if (!aiAssistant || !aiAssistants || !aiLibraries || !aiLibraryUsage || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="container flex w-full flex-col gap-4">
      <div className="flex justify-between">
        <div className="w-64">
          <AssistantSelector assistants={aiAssistants!} selectedAssistant={aiAssistant!} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-sm tooltip"
            data-tip={t('tooltips.goToOverview')}
            onClick={() => navigate({ to: '..' })}
          >
            <BackIcon />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="card grid grow rounded-box bg-base-200 px-3 py-3 sm:w-1/2">
          <AssistantForm assistant={aiAssistant} disabled={!ownerId} userId={ownerId} />
          <hr className="my-3" />
          <AssistantLibraries assistant={aiAssistant} usages={aiLibraryUsage} libraries={aiLibraries} />
        </div>
        <div className="card grid grow rounded-box bg-base-200 px-3 py-3 sm:w-1/2">
          <AssistantBasecaseForm assistant={aiAssistant} userId={ownerId} />
        </div>
      </div>
      {assistantId && <AiActGuide assistantId={assistantId} />}
    </article>
  )
}
