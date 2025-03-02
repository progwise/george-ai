import {
  createFileRoute,
  Link,
  useParams,
  useNavigate,
} from '@tanstack/react-router'
import { graphql } from '../../gql/gql'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { AssistantForm } from '../../components/assistant/assistant-form'
import { AiAssistantInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { useAuth } from '../../auth/auth-context'
import { AssistantSelector } from '../../components/assistant/assistant-selector'
import { queryKeys } from '../../query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AssistantLibraries } from '../../components/assistant/assistant-libraries'
import { useMutation } from '@tanstack/react-query'
import { LoadingSpinner } from '../../components/loading-spinner'

const aiAssistantEditQueryDocument = graphql(`
  query aiAssistantEdit($id: String!, $ownerId: String!) {
    aiAssistant(id: $id) {
      id
      name
      description
      icon
      createdAt
      ownerId
      assistantType
      url
    }
    aiAssistants(ownerId: $ownerId) {
      id
      name
    }
  }
`)

const getAssistant = createServerFn({ method: 'GET' })
  .validator(
    ({ assistantId, ownerId }: { assistantId: string; ownerId: string }) => ({
      assistantId: z.string().nonempty().parse(assistantId),
      ownerId: z.string().nonempty().parse(ownerId),
    }),
  )
  .handler(
    async (ctx) =>
      await backendRequest(aiAssistantEditQueryDocument, {
        id: ctx.data.assistantId,
        ownerId: ctx.data.ownerId,
      }),
  )

const updateAssistantDocument = graphql(/* GraphQL */ `
  mutation changeAiAssistant($id: String!, $data: AiAssistantInput!) {
    updateAiAssistant(id: $id, data: $data) {
      id
      name
    }
  }
`)

const changeAssistant = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }

    const assistantId = z
      .string()
      .nonempty()
      .parse(data.get('assistantId') as string)

    const icon = data.get('icon') as File

    const assistant = AiAssistantInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
      icon: icon.name as string,
      assistantType: data.get('assistantType'),
    })
    return { assistantId, assistant }
  })
  .handler(async (ctx) => {
    return await backendRequest(updateAssistantDocument, {
      data: ctx.data.assistant,
      id: ctx.data.assistantId,
    })
  })

const assistantsQueryOptions = (ownerId?: string, assistantId?: string) => ({
  queryKey: [queryKeys.AiAssistants, assistantId, ownerId],
  queryFn: async () => {
    if (!ownerId || !assistantId) {
      return null
    } else {
      return getAssistant({ data: { ownerId, assistantId } })
    }
  },
  enabled: !!ownerId || !!assistantId,
})

export const Route = createFileRoute('/assistants/$assistantId')({
  component: RouteComponent,
  beforeLoad: async ({ params, context }) => {
    return {
      assistantId: params.assistantId,
      ownerId: context.auth.user?.id,
    }
  },
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      assistantsQueryOptions(context.auth.user?.id, context.assistantId),
    )
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const { assistantId } = useParams({ strict: false })
  const { data, isLoading } = useSuspenseQuery(
    assistantsQueryOptions(auth.user?.id, assistantId),
  )

  const { aiAssistant, aiAssistants } = data || {}

  const navigate = useNavigate()
  const { mutate: saveAssistant, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => changeAssistant({ data }),
    onSettled: () => {
      navigate({ to: '..' })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    saveAssistant(formData)
  }

  if (!aiAssistant) {
    return <LoadingSpinner />
  }
  if (!auth.user?.id || !aiAssistant || !aiAssistants || isLoading) {
    return <LoadingSpinner />
  }
  const disabled = !auth?.isAuthenticated
  return (
    <article className="flex w-full flex-col gap-4">
      <LoadingSpinner isLoading={saveIsPending} />
      <div className="flex justify-between items-center">
        <AssistantSelector
          assistants={aiAssistants!}
          selectedAssistant={aiAssistant!}
        />
        <div className="badge badge-secondary badge-outline">
          {disabled ? 'Disabled' : 'enabled'}
        </div>
        <div className="flex gap-2">
          <Link type="button" className="btn btn-primary btn-sm" to="..">
            List
          </Link>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered">
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Rules"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content p-10">
          <AssistantForm
            assistant={aiAssistant}
            owner={auth.user}
            handleSubmit={handleSubmit}
            disabled={disabled}
          />
        </div>

        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Used Libraries"
        />
        <div role="tabpanel" className="tab-content p-10">
          <AssistantLibraries
            assistantId={aiAssistant.id}
            ownerId={auth.user.id}
          />
        </div>
      </div>
    </article>
  )
}
