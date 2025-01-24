import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'
import { KnowledgeSourceForm } from '../../components/knowledge-source-form'
import { AiKnowledgeSourceType } from '../../gql/graphql'
import { createServerFn } from '@tanstack/start'
import { AiKnowledgeSourceInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { z } from 'zod'

const createKnowledgeSourceDocument = graphql(`
  mutation createAiKnowledgeSource(
    $ownerId: String!
    $data: AiKnowledgeSourceInput!
  ) {
    createAiKnowledgeSource(ownerId: $ownerId, data: $data) {
      id
      name
    }
  }
`)

const createKnowledgeSource = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    const ownerId = z
      .string()
      .nonempty()
      .parse(data.get('ownerId') as string)

    const assistant = AiKnowledgeSourceInputSchema().parse({
      name: data.get('name') as string,
      description: data.get('description') as string,
      url: data.get('url') as string,
      aiKnowledgeSourceType: data.get('aiKnowledgeSourceType'),
    })

    return { ownerId, data: assistant }
  })
  .handler(async (ctx) => {
    return await backendRequest(createKnowledgeSourceDocument, ctx.data)
  })

export const Route = createFileRoute('/knowledge/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isAuthenticated, user } = useAuth()
  const disabled = !isAuthenticated || !user

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    createKnowledgeSource({
      data: formData,
    })
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Create your Knowlege Source</h3>
        <div className="badge badge-secondary badge-outline">
          {disabled ? 'Disabled' : 'enabled'}
        </div>
        <div className="flex gap-2">
          <Link type="button" className="btn btn-primary btn-sm" to="..">
            List
          </Link>
        </div>
      </div>
      {user && (
        <KnowledgeSourceForm
          knowledgeSource={{
            name: '',
            description: '',
            aiKnowledgeSourceType: AiKnowledgeSourceType.GoogleDrive,
          }}
          owner={user}
          handleSubmit={handleSubmit}
          disabled={false}
        />
      )}
    </article>
  )
}
