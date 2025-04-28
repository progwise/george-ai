import { useRef } from 'react'

import { FragmentType, graphql, useFragment } from '../../gql'
import { DialogForm } from '../dialog-form'

const AssistantParticipantsDialog_AssistantFragment = graphql(`
  fragment AssistantParticipantsDialog_Assistant on AiAssistant {
    id
    ownerId
    # name
    participants {
      id
      userId
    }
  }
`)

interface DialogFormProps {
  assistant: FragmentType<typeof AssistantParticipantsDialog_AssistantFragment>
  userId: string
}

export const AssistantParticipantsDialog = (props: DialogFormProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const assistant = useFragment(AssistantParticipantsDialog_AssistantFragment, props.assistant)

  const isOwner = props.userId === assistant.ownerId

  const handleSubmit = () => {
    dialogRef.current?.close()
  }

  return (
    <>
      <button type="button" className="btn btn-sm">
        Assistant Participants
      </button>
      <DialogForm ref={dialogRef} title="Manage assistant participants here." onSubmit={handleSubmit}>
        {/* <p>Manage assistant participants here.</p> */}
      </DialogForm>
    </>
  )
}
