import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { AssistantForm } from '../../components/assistant/assistant-form'
import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { AiAssistantType } from '../../gql/graphql'
import { AiAssistantInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'

const createAssistantDocument = graphql(`
  mutation createAiAssistant($ownerId: String!, $data: AiAssistantInput!) {
    createAiAssistant(ownerId: $ownerId, data: $data) {
      id
      name
    }
  }
`)

const createAssistant = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    const ownerId = z
      .string()
      .nonempty()
      .parse(data.get('ownerId') as string)

    const icon = data.get('icon') as File

    const assistant = AiAssistantInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
      icon: icon.name as string,
      assistantType: data.get('assistantType'),
    })

    return { ownerId, data: assistant }
  })
  .handler(async (ctx) => {
    return await backendRequest(createAssistantDocument, ctx.data)
  })

export const Route = createFileRoute('/assistants/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()

  const navigate = useNavigate()
  const { mutate: createAssistantMutation, isPending: createIsPending } = useMutation({
    mutationFn: (data: FormData) => createAssistant({ data }),
    onSettled: () => {
      navigate({ to: '..' })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    createAssistantMutation(formData)
  }

  const disabled = !auth?.isAuthenticated

  return (
    <article className="flex w-full flex-col gap-4">
      <LoadingSpinner isLoading={createIsPending} />
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">New Assistant</h3>
        <div className="badge badge-secondary badge-outline">{disabled ? 'Disabled' : 'enabled'}</div>
        <div className="flex gap-2">
          <Link type="button" className="btn btn-primary btn-sm" to="..">
            List
          </Link>
        </div>
      </div>
      {auth?.user?.id && (
        <AssistantForm
          assistant={{
            createdAt: '',
            id: '',
            name: '',
            assistantType: AiAssistantType.Chatbot,
            ownerId: auth?.user.id || '',
          }}
          ownerId={auth.user.id}
          handleSubmit={handleSubmit}
          disabled={disabled}
        />
      )}
    </article>
  )
}
