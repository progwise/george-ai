import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { graphql } from '../../gql/gql'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { AssistantForm } from '../../components/assistant/assistant-form'
import { AiAssistantInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { useAuth } from '../../auth/auth-context'
import { useMutation } from '@tanstack/react-query'
import { LoadingSpinner } from '../../components/loading-spinner'

const aiAssistantEditQueryDocument = graphql(`
  query aiAssistantEdit($id: String!) {
    aiAssistant(id: $id) {
      id
      name
      description
      icon
      createdAt
      ownerId
      aiAssistantType
      url
    }
  }
`)

const getAssistant = createServerFn({ method: 'GET' })
  .validator((assistantId: string) => z.string().nonempty().parse(assistantId))
  .handler(
    async (ctx) =>
      await backendRequest(aiAssistantEditQueryDocument, {
        id: ctx.data,
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
      aiAssistantType: data.get('aiAssistantType'),
    })
    return { assistantId, assistant }
  })
  .handler(async (ctx) => {
    return await backendRequest(updateAssistantDocument, {
      data: ctx.data.assistant,
      id: ctx.data.assistantId,
    })
  })

export const Route = createFileRoute('/assistants/$assistantId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const assistant = await getAssistant({ data: params.assistantId })
    return assistant
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const { aiAssistant } = Route.useLoaderData()

  const navigate = useNavigate()
  const { mutate: saveAssistant, isPending: saveIsPending } = useMutation({
    mutationFn: (data: FormData) => changeAssistant({ data }),
    onSettled: () => {
      console.log('Assistant saved')
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

  const disabled = !auth?.isAuthenticated
  return (
    <article className="flex w-full flex-col gap-4">
      <LoadingSpinner isLoading={saveIsPending} />
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">
          Configure Assistant {aiAssistant?.name}
        </h3>
        <div className="badge badge-secondary badge-outline">
          {disabled ? 'Disabled' : 'enabled'}
        </div>
        <div className="flex gap-2">
          <Link type="button" className="btn btn-primary btn-sm" to="..">
            List
          </Link>
        </div>
      </div>
      {!!aiAssistant && !!auth?.user && (
        <AssistantForm
          assistant={aiAssistant}
          owner={auth.user}
          handleSubmit={handleSubmit}
          disabled={disabled}
        />
      )}
    </article>
  )
}
