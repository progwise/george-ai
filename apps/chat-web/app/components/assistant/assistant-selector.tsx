import { useNavigate } from '@tanstack/react-router'
import { AiAssistant } from '../../gql/graphql'
import { Listbox } from '../listbox'
import { useState } from 'react'

interface AssistantSelectorProps {
  assistants: Pick<AiAssistant, 'id' | 'name'>[]
  selectedAssistant: Pick<AiAssistant, 'id' | 'name'>
}

export const AssistantSelector = ({
  assistants,
  selectedAssistant,
}: AssistantSelectorProps) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(selectedAssistant)
  return (
    <Listbox
      items={assistants}
      selectedItem={selected}
      onChange={(newAssistant) => {
        setSelected(newAssistant)
        navigate({
          to: '/assistants/$assistantId',
          params: { assistantId: newAssistant.id },
        })
      }}
    />
  )
}
