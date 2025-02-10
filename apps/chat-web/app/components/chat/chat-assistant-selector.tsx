import { AiAssistant } from '../../gql/graphql'

interface ChatAssistantSelectorProps {
  assistants: Pick<AiAssistant, 'id' | 'name'>[]
  selectedAssistant: Pick<AiAssistant, 'id' | 'name'>
  onChange: (assistant: Pick<AiAssistant, 'id' | 'name'>) => void
}

export const ChatAssistantSelector = (props: ChatAssistantSelectorProps) => {
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
            <button type="button" onClick={() => props.onChange(assistant)}>
              {assistant.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
