import { useNavigate } from '@tanstack/react-router'

import { graphql } from '../../gql'
import { AssistantBaseFragment, AssistantSelector_AssistantFragment } from '../../gql/graphql'
import { Listbox } from '../listbox'

graphql(`
  fragment AssistantSelector_Assistant on AiAssistant {
    id
    name
  }
`)

interface AssistantSelectorProps {
  assistants: AssistantBaseFragment[]
  selectedAssistant: AssistantSelector_AssistantFragment
}

export const AssistantSelector = ({ assistants, selectedAssistant }: AssistantSelectorProps) => {
  const navigate = useNavigate()
  return (
    <Listbox
      items={assistants}
      selectedItem={selectedAssistant}
      onChange={(newAssistant) => {
        navigate({
          to: '/assistants/$assistantId',
          params: { assistantId: newAssistant!.id },
        })
      }}
    />
  )
}
