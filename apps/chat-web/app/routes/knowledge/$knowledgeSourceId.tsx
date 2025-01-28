import {
  createFileRoute,
  Link,
  useLocation,
  useParams,
} from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'
import { KnowledgeSourceForm } from '../../components/knowledge-source/knowledge-source-form'
import { createServerFn } from '@tanstack/start'
import { z } from 'zod'
import { AiKnowledgeSourceInputSchema } from '../../gql/validation'
import { backendRequest } from '../../server-functions/backend'
import { graphql } from '../../gql'
import { KnowledgeSourceSelector } from '../../components/knowledge-source/knowledge-source-selector'
import { queryKeys } from '../../query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '../../components/loading-spinner'
import { GoogleDriveFiles } from '../../components/knowledge-source/google-drive-files'
import { EmbeddingsTable } from '../../components/knowledge-source/embeddings-table'
import { KnowledgeSourceQuery } from '../../components/knowledge-source/knowledge-source-query'

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

const knowledgeSourcesQueryOptions = (
  ownerId?: string,
  knowledgeSourceId?: string,
) => ({
  queryKey: [queryKeys.KnowledgeSources, knowledgeSourceId, ownerId],
  queryFn: async () => {
    if (!ownerId) {
      return null
    } else {
      return getKnowledgeSource({ data: { ownerId, knowledgeSourceId } })
    }
  },
  enabled: !!ownerId || !!knowledgeSourceId,
})

export const Route = createFileRoute('/knowledge/$knowledgeSourceId')({
  component: RouteComponent,
  beforeLoad: async ({ params, context }) => {
    return {
      knowledgeSourceId: params.knowledgeSourceId,
      ownerId: context.auth.user?.id,
    }
  },
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      knowledgeSourcesQueryOptions(
        context.auth.user?.id,
        context.knowledgeSourceId,
      ),
    )
  },
  staleTime: 0,
})

function RouteComponent() {
  const auth = useAuth()
  const currentLocation = useLocation()
  const { knowledgeSourceId } = useParams({ strict: false })
  const { data, isLoading } = useSuspenseQuery(
    knowledgeSourcesQueryOptions(auth.user?.id, knowledgeSourceId),
  )
  const { aiKnowledgeSource, aiKnowledgeSources } = data || {}
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    changeKnowledgeSource({
      data: formData,
    })
  }
  const disabled = !auth?.isAuthenticated
  if (isLoading) {
    return
  }
  if (!aiKnowledgeSource || !aiKnowledgeSources) {
    return <LoadingSpinner />
  }

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

      <div role="tablist" className="tabs tabs-bordered">
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Rules"
        />
        <div role="tabpanel" className="tab-content p-10">
          <KnowledgeSourceForm
            knowledgeSource={aiKnowledgeSource!}
            owner={auth.user!}
            handleSubmit={handleSubmit}
            disabled={disabled}
          />
        </div>

        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Files"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content p-10">
          <GoogleDriveFiles
            knowledgeSourceId={aiKnowledgeSource.id}
            currentLocationHref={currentLocation.href}
          />
        </div>
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Embeddings"
        />
        <div role="tabpanel" className="tab-content p-10">
          <EmbeddingsTable knowledgeSourceId={aiKnowledgeSource.id} />
        </div>
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Query"
        />
        <div role="tabpanel" className="tab-content p-10">
          <KnowledgeSourceQuery knowledgeSourceId={aiKnowledgeSource.id} />
        </div>
      </div>
    </article>
  )
}
