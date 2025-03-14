import { useNavigate } from '@tanstack/react-router'

import { FragmentType, graphql, useFragment } from '../../gql'
import { Listbox } from '../listbox'

const AssistantSelector_AssistantFragment = graphql(`
  fragment AssistantSelector_assistant on AiAssistant {
    id
    name
  }
`)

interface AssistantSelectorProps {
  assistants: FragmentType<typeof AssistantSelector_AssistantFragment>[]
  selectedAssistant: FragmentType<typeof AssistantSelector_AssistantFragment>
}

export const AssistantSelector = (props: AssistantSelectorProps) => {
  const assistants = useFragment(AssistantSelector_AssistantFragment, props.assistants)
  const selectedAssistant = useFragment(AssistantSelector_AssistantFragment, props.selectedAssistant)
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
