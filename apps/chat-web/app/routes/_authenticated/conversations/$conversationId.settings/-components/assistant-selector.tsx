import { AssistantBaseFragment } from '../../../../../gql/graphql'
import { Selector } from './selector'

interface AssistantSelectorProps {
  assistants: AssistantBaseFragment[]
  onSelect: (assistant: AssistantBaseFragment) => void
  disabled: boolean
}

export const AssistantSelector = ({ assistants, onSelect, disabled }: AssistantSelectorProps) => (
  <Selector
    options={assistants}
    onSelect={(assistant) => onSelect(assistant)}
    disabled={disabled}
    compareOption={(assistant, query) => assistant.name.toLowerCase().includes(query.toLowerCase())}
    getKey={(assistant) => assistant.id}
    getLabel={(assistant) => assistant.name}
    notFoundLabel="No assistants found"
    inputPlaceholder="Search assistants..."
  />
)
