import { createFileRoute } from '@tanstack/react-router'
import { request } from 'graphql-request'
import { useQuery } from '@tanstack/react-query'
import { graphql } from '../../gql/gql'
import { ChatbotsQuery } from '../../gql/graphql'

const myChatbotsDocument = graphql(/* GraphQL */ `
  query Chatbots($ownerId: String!) {
    chatbots(ownerId: $ownerId) {
      id
      name
      description
      icon
    }
  }
`)

export const Route = createFileRoute('/ken/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery<ChatbotsQuery>({
    queryKey: ['chatbots'],
    queryFn: async () =>
      request(
        'http://localhost:3003',
        myChatbotsDocument,
        // variables are type-checked too!
        { ownerId: 'cm5v311fy0000mwtv7lv614vy' },
      ),
  })
  return (
    <article className="prose prose-xl">
      <h3>My Assistants</h3>
      <div className="flex gap-4">
        {data?.chatbots?.map((bot) => (
          <div key={bot.id} className="card bg-base-100 w-96 shadow-xl">
            <figure>
              <img
                src={bot.icon ?? 'https://via.placeholder.com/150'}
                alt={bot.name ?? 'Chatbot icon'}
              />
            </figure>
            <div className="card-body p-4">
              <h2 className="card-title">{bot.name}</h2>
              <p>{bot.description}</p>
              <div className="card-actions justify-end items-middle">
                <div className="flex gap-2">
                  <div className="badge badge-outline">OpenAI</div>
                  <div className="badge badge-outline">Local Only</div>
                  <div className="badge badge-outline">Sequential</div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary btn-ghost"
                >
                  Configure
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary btn-ghost"
                >
                  Try
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
