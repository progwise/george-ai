import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'
import { KnowledgeSourceForm } from '../../components/knowledge-source-form'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { AiKnowledgeSourceInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { KnowledgeSourceSelector } from '../../components/knowledge-source-selector'

const aiKnowledgeSourceEditQueryDocument = graphql(`
  query aiKnowledgeSourceEdit($id: String!, $ownerId: String!) {
    aiKnowledgeSource(id: $id) {
      id
      name
      description
      createdAt
      ownerId
      aiKnowledgeSourceType
      url
    }
    aiKnowledgeSources(ownerId: $ownerId) {
      id
      name
    }
  }
`)

const getKnowledgeSource = createServerFn({ method: 'GET' })
  .validator(({ knowledgeSourceId, ownerId }) => ({
    id: z.string().nonempty().parse(knowledgeSourceId),
    ownerId: z.string().nonempty().parse(ownerId),
  }))
  .handler(
    async (ctx) =>
      await backendRequest(aiKnowledgeSourceEditQueryDocument, ctx.data),
  )

const updateKnowledgeSourceDocument = graphql(/* GraphQL */ `
  mutation changeAiKnowledgeSource(
    $id: String!
    $data: AiKnowledgeSourceInput!
  ) {
    updateAiKnowledgeSource(id: $id, data: $data) {
      id
      name
    }
  }
`)

const changeKnowledgeSource = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }

    console.log('form data', data.get('name'))

    const knowledgeSourceId = z
      .string()
      .nonempty()
      .parse(data.get('knowledgeSourceId') as string)

    const knowledgeSource = AiKnowledgeSourceInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
      aiKnowledgeSourceType: data.get('aiKnowledgeSourceType'),
    })
    return { knowledgeSourceId, knowledgeSource }
  })
  .handler(async (ctx) => {
    return await backendRequest(updateKnowledgeSourceDocument, {
      data: ctx.data.knowledgeSource,
      id: ctx.data.knowledgeSourceId,
    })
  })

export const Route = createFileRoute('/knowledge/$knowledgeSourceId')({
  component: RouteComponent,
  beforeLoad: async ({ params, context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/knowledge' })
    }
    return {
      knowledgeSourceId: params.knowledgeSourceId,
      ownerId: context.auth.user.id,
    }
  },
  loader: async ({ context }) => {
    const knowledgeSource = await getKnowledgeSource({
      data: { ...context },
    })
    return knowledgeSource
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const { aiKnowledgeSource, aiKnowledgeSources } = Route.useLoaderData()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    changeKnowledgeSource({
      data: formData,
    })
  }
  const disabled = !auth?.isAuthenticated
  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex justify-between items-center">
        <KnowledgeSourceSelector
          knowledgeSources={aiKnowledgeSources!}
          selectedKnowledgeSource={aiKnowledgeSource!}
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
      {!!aiKnowledgeSource && !!auth?.user && (
        <KnowledgeSourceForm
          knowledgeSource={aiKnowledgeSource}
          owner={auth.user}
          handleSubmit={handleSubmit}
          disabled={disabled}
        />
      )}
    </article>
  )
}
