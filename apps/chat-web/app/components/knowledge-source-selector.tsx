import { Link } from '@tanstack/react-router'
import { AiKnowledgeSource } from '../gql/graphql'

interface KnowledgeSourceSelectorProps {
  knowledgeSources: Pick<AiKnowledgeSource, 'id' | 'name'>[]
  selectedKnowledgeSource: Pick<AiKnowledgeSource, 'id' | 'name'>
}

export const KnowledgeSourceSelector = (
  props: KnowledgeSourceSelectorProps,
) => {
  const { knowledgeSources, selectedKnowledgeSource } = props
  return (
    <div className="dropdown dropdown-sm">
      <div tabIndex={0} role="button" className="btn btn-sm">
        {selectedKnowledgeSource.name}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        {knowledgeSources.map((knowledgeSource) => (
          <li key={knowledgeSource.id}>
            <Link
              to={'/knowledge/$knowledgeSourceId'}
              params={{ knowledgeSourceId: knowledgeSource.id }}
              onClick={(event) => {
                event.currentTarget.blur()
              }}
            >
              {knowledgeSource.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
