import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'
import { KnowledgeSourceForm } from '../../components/knowledge-source-form'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { AiKnowledgeSourceInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'

const aiKnowledgeSourceEditQueryDocument = graphql(`
  query aiKnowledgeSourceEdit($id: String!) {
    aiKnowledgeSource(id: $id) {
      id
      name
      description
      createdAt
      ownerId
      aiKnowledgeSourceType
      url
    }
  }
`)

const getKnowledgeSource = createServerFn({ method: 'GET' })
  .validator((knowledgeSourceId: string) =>
    z.string().nonempty().parse(knowledgeSourceId),
  )
  .handler(
    async (ctx) =>
      await backendRequest(aiKnowledgeSourceEditQueryDocument, {
        id: ctx.data,
      }),
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
  loader: async ({ params }) => {
    const assistant = await getKnowledgeSource({
      data: params.knowledgeSourceId,
    })
    return assistant
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const { aiKnowledgeSource } = Route.useLoaderData()

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
        <h3 className="text-base font-semibold">
          Configure Knowledge Source {aiKnowledgeSource?.name}
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
