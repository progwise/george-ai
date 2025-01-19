import { createFileRoute, Link } from '@tanstack/react-router'
import { graphql } from '../../gql/gql'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import request from 'graphql-request'
import { BACKEND_GRAPHQL_URL } from '../../constants'
import { useAuth } from '../../auth'
import { AssistantForm } from '../../components/assistant-form'
import { AiAssistantInputSchema } from '../../gql/validation'

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
      await request(BACKEND_GRAPHQL_URL, aiAssistantEditQueryDocument, {
        id: ctx.data,
      }),
  )

const updateAssistantDocument = graphql(/* GraphQL */ `
  mutation changeAiAssistant($id: String!, $assistant: AiAssistantInput!) {
    updateAiAssistant(id: $id, input: $assistant) {
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
    return await request(BACKEND_GRAPHQL_URL, updateAssistantDocument, {
      assistant: ctx.data.assistant,
      id: ctx.data.assistantId,
    })
  })

export const Route = createFileRoute('/assistants/$assistantId')({
  component: RouteComponent,
  loader: ({ params }) => {
    return getAssistant({ data: params.assistantId })
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const { aiAssistant } = Route.useLoaderData()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    //form.reset()

    changeAssistant({
      data: formData,
    })
  }

  const disabled = !auth?.isAuthenticated
  return (
    <article className="flex w-full flex-col gap-4">
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
