import { Link } from '@tanstack/react-router'
import { AiAssistant } from '../../gql/graphql'

interface AssistantSelectorProps {
  assistants: Pick<AiAssistant, 'id' | 'name'>[]
  selectedAssistant: Pick<AiAssistant, 'id' | 'name'>
}

export const AssistantSelector = (props: AssistantSelectorProps) => {
  const { assistants, selectedAssistant } = props
  return (
    <div className="dropdown dropdown-sm">
      <div tabIndex={0} role="button" className="btn btn-sm">
        {selectedAssistant.name}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        {assistants.map((assistant) => (
          <li key={assistant.id}>
            <Link
              to={'/assistants/$assistantId'}
              params={{ assistantId: assistant.id }}
              onClick={(event) => {
                event.currentTarget.blur()
              }}
            >
              {assistant.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
